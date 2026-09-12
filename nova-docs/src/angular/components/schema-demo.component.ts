import { JsonPipe } from '@angular/common';
import { Component, computed, input, linkedSignal } from '@angular/core';
import { PiyingView } from '@piying/view-angular';
import { FieldGlobalConfig } from './define';
import { demoRegistry } from '../definition';

/**
 * 通用「定义 → 表单」演示组件。
 * 通过 `name` 从 demoRegistry 取出对应的 schema / model / options。
 */
@Component({
  selector: 'schema-demo',
  standalone: true,
  template: `
    <piying-view
      [schema]="schema()"
      [model]="model()"
      [options]="options()"
      (modelChange)="model.set($event)"
    ></piying-view>
    @if (showModel()) {
      <pre class="mt-4 rounded-box bg-base-200 p-3 text-sm">
Model 值: {{ model() | json }}</pre
      >
    }
  `,
  imports: [PiyingView, JsonPipe],
  host: {
    class: 'not-content',
  },
})
export class SchemaDemoComponent {
  name = input('string');

  showModel = input(false);

  private definition = computed(() => demoRegistry[this.name()]);

  schema = computed(() => this.definition()?.schema);

  options = computed(
    () =>
      this.definition()?.options ?? { fieldGlobalConfig: FieldGlobalConfig },
  );

  // 以定义中的 model 作为初值，后续跟随用户输入变化
  model = linkedSignal(() => this.definition()?.model);
}

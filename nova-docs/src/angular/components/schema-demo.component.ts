import { Component, computed, input } from '@angular/core';
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
    ></piying-view>
  `,
  imports: [PiyingView],
  host: {
    class: 'not-content',
  },
})
export class SchemaDemoComponent {
  name = input('string');

  private definition = computed(() => demoRegistry[this.name()]);

  schema = computed(() => this.definition()?.schema);

  model = computed(() => this.definition()?.model);

  options = computed(
    () =>
      this.definition()?.options ?? { fieldGlobalConfig: FieldGlobalConfig },
  );
}

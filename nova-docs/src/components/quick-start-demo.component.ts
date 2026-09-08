import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { actions, PiyingView, PiyingViewGroup } from '@piying/view-angular';
import * as v from 'valibot';
import {
  CheckboxFCC,
  InputFCC,
  InputNumberFCC,
} from '@piying-lib/angular-daisyui/field-control';
import { setComponent } from '@piying/view-angular-core';

@Component({
  selector: 'quick-start-demo',
  standalone: true,
  template: `
    <piying-view
      [schema]="schema"
      [model]="model()"
      (modelChange)="model.set($event)"
    ></piying-view>
    <pre class="mt-4 rounded-box bg-base-200 p-3 text-sm">
Model 值: {{ model() | json }}</pre
    >
  `,
  imports: [PiyingView, JsonPipe],
})
export class QuickStartDemoComponent {
  model = signal({ name: '', age: 18, email: '', active: true });

  schema = v.pipe(
    v.object({
      name: v.pipe(
        v.string(),
        setComponent(InputFCC),
        actions.attributes.set({ placeholder: '名称（至少 2 个字符）' }),
      ),
      age: v.pipe(
        v.number(),
        setComponent(InputNumberFCC),
        actions.attributes.set({ placeholder: '年龄（至少 18 岁）' }),
      ),
      email: v.pipe(
        v.optional(v.string()),
        setComponent(InputFCC),
        actions.attributes.set({ placeholder: '邮箱（可选）' }),
      ),
      active: v.pipe(v.boolean(), setComponent(CheckboxFCC)),
    }),
    setComponent(PiyingViewGroup),
  );
}

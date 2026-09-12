import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { actions, PiyingView } from '@piying/view-angular';
import * as v from 'valibot';

import {
  FormInputWithValidate,
  PresetDefine,
} from '@piying-lib/angular-daisyui/preset';
@Component({
  selector: 'quick-start-demo',
  standalone: true,
  template: `
    <piying-view
      [schema]="schema"
      [(model)]="model"
      [options]="options"
    ></piying-view>
    <pre class="mt-4 rounded-box bg-base-200 p-3 text-sm">
Model 值: {{ model() | json }}</pre
    >
  `,
  imports: [PiyingView, JsonPipe],
  host: {
    class: 'not-content',
  },
})
export class QuickStartDemoComponent {
  model = signal({ name: '', age: 18, email: '', active: true });
  options = {
    fieldGlobalConfig: {
      ...PresetDefine,
      types: {
        ...PresetDefine.types,
        ...FormInputWithValidate,
      },
    },
  };
  schema = v.pipe(
    v.object({
      name: v.pipe(
        v.string(),
        actions.attributes.set({ placeholder: '名称（至少 2 个字符）' }),
      ),
      age: v.pipe(
        v.number(),
        actions.attributes.set({ placeholder: '年龄（至少 18 岁）' }),
      ),
      email: v.pipe(
        v.optional(v.string()),
        actions.attributes.set({ placeholder: '邮箱（可选）' }),
      ),
      active: v.pipe(v.boolean()),
    }),
    actions.wrappers.set(['fieldset']),
    actions.class.top(
      'bg-base-200 border-base-300 rounded-box w-xs border p-4',
    ),
  );
}

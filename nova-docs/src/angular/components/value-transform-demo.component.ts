import { JsonPipe } from '@angular/common';
import { Component, signal } from '@angular/core';
import { actions, PiyingView, PiyingViewGroup } from '@piying/view-angular';
import * as v from 'valibot';
import { InputFCC } from '@piying-lib/angular-daisyui/field-control';
import { formConfig, setComponent } from '@piying/view-angular-core';

@Component({
  selector: 'value-transform-demo',
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
export class ValueTransformDemoComponent {
  model = signal({ name: '张三' });

  schema = v.pipe(
    v.object({
      name: v.pipe(
        v.string(),
        setComponent(InputFCC),
        actions.attributes.set({ placeholder: '输入前后带空格的值' }),
        formConfig({
          transformer: {
            toModel: (value: any) => (value == null ? value : String(value).trim()),
          },
        }),
      ),
    }),
    setComponent(PiyingViewGroup),
  );
}

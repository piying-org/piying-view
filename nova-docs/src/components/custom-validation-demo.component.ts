import { JsonPipe } from '@angular/common';
import { Component, signal } from '@angular/core';
import { actions, PiyingView, PiyingViewGroup } from '@piying/view-angular';
import * as v from 'valibot';
import { InputFCC } from '@piying-lib/angular-daisyui/field-control';
import { formConfig, setComponent } from '@piying/view-angular-core';

@Component({
  selector: 'custom-validation-demo',
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
export class CustomValidationDemoComponent {
  model = signal({ password: '', confirmPassword: '' });

  schema = v.pipe(
    v.object({
      password: v.pipe(
        v.string(),
        setComponent(InputFCC),
        actions.attributes.set({ placeholder: '密码（至少 8 位，不含 123）' }),
        formConfig({
          validators: [
            (control) => {
              const value = control.value ?? '';
              if (value.includes('123')) {
                return [
                  {
                    kind: 'weakPassword',
                    message: '密码不能包含连续数字',
                  },
                ];
              }
              if (value.length < 8) {
                return [
                  {
                    kind: 'tooShort',
                    message: '密码至少 8 个字符',
                  },
                ];
              }
              return undefined;
            },
          ],
        }),
      ),
      confirmPassword: v.pipe(
        v.string(),
        setComponent(InputFCC),
        actions.attributes.set({ placeholder: '确认密码（需与密码一致）' }),
        formConfig({
          validators: [
            (control) => {
              const password = control.root.get('password')?.value;
              if (control.value && password !== control.value) {
                return [
                  {
                    kind: 'passwordsNotMatch',
                    message: '两次密码不一致',
                  },
                ];
              }
              return undefined;
            },
          ],
        }),
      ),
    }),
    setComponent(PiyingViewGroup),
  );
}

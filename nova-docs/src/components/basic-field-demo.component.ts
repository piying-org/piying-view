import { Component } from '@angular/core';
import { actions, PiyingView, PiyingViewGroup } from '@piying/view-angular';
import * as v from 'valibot';
import {
  CheckboxFCC,
  InputFCC,
  InputNumberFCC,
  TextareaFCC,
} from '@piying-lib/angular-daisyui/field-control';
import { setComponent } from '@piying/view-angular-core';

@Component({
  selector: 'basic-field-demo',
  standalone: true,
  template: ` <piying-view [schema]="schema"></piying-view> `,
  imports: [PiyingView],
})
export class BasicFieldDemoComponent {
  schema = v.pipe(
    v.object({
      name: v.pipe(
        v.string(),
        setComponent(InputFCC),
        actions.attributes.set({ placeholder: '请输入用户名' }),
      ),
      age: v.pipe(
        v.number(),
        setComponent(InputNumberFCC),
        actions.attributes.set({ placeholder: '请输入年龄' }),
      ),
      bio: v.pipe(
        v.string(),
        setComponent(TextareaFCC),
        actions.attributes.set({ placeholder: '请输入个人简介' }),
      ),
      active: v.pipe(v.boolean(), setComponent(CheckboxFCC)),
    }),
    setComponent(PiyingViewGroup),
  );
}

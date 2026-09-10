import { Component } from '@angular/core';
import { actions, PiyingView, PiyingViewGroup } from '@piying/view-angular';
import * as v from 'valibot';
import {
  CheckboxFCC,
  InputFCC,
  InputNumberFCC,
} from '@piying-lib/angular-daisyui/field-control';
import { setComponent } from '@piying/view-angular-core';

@Component({
  selector: 'complex-schema-demo',
  standalone: true,
  template: ` <piying-view [schema]="schema"></piying-view> `,
  imports: [PiyingView],
})
export class ComplexSchemaDemoComponent {
  schema = v.pipe(
    v.object({
      name: v.pipe(
        v.string(),
        setComponent(InputFCC),
        actions.attributes.set({ placeholder: '姓名' }),
      ),
      user: v.pipe(
        v.object({
          nickname: v.pipe(
            v.string(),
            setComponent(InputFCC),
            actions.attributes.set({ placeholder: '昵称' }),
          ),
          age: v.pipe(
            v.number(),
            setComponent(InputNumberFCC),
            actions.attributes.set({ placeholder: '年龄' }),
          ),
          active: v.pipe(v.boolean(), setComponent(CheckboxFCC)),
        }),
        setComponent(PiyingViewGroup),
      ),
    }),
    setComponent(PiyingViewGroup),
  );
}

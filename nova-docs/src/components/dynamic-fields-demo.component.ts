import { Component } from '@angular/core';
import { actions, PiyingView, PiyingViewGroup } from '@piying/view-angular';
import * as v from 'valibot';
import { CheckboxFCC, InputFCC } from '@piying-lib/angular-daisyui/field-control';
import { disableWhen, hideWhen, setComponent } from '@piying/view-angular-core';
import { map } from 'rxjs';

@Component({
  selector: 'dynamic-fields-demo',
  standalone: true,
  template: ` <piying-view [schema]="schema"></piying-view> `,
  imports: [PiyingView],
})
export class DynamicFieldsDemoComponent {
  schema = v.pipe(
    v.object({
      showExtra: v.pipe(v.boolean(), setComponent(CheckboxFCC)),
      extraField: v.pipe(
        v.string(),
        setComponent(InputFCC),
        actions.attributes.set({ placeholder: '勾选上方开关后显示' }),
        hideWhen({
          listen: (fn) =>
            fn({ list: [['..', 'showExtra']] }).pipe(
              map((item) => !item.list[0]),
            ),
        }),
      ),
      isActive: v.pipe(v.boolean(), setComponent(CheckboxFCC)),
      name: v.pipe(
        v.string(),
        setComponent(InputFCC),
        actions.attributes.set({ placeholder: '勾选上方开关后启用编辑' }),
        disableWhen({
          listen: (fn) =>
            fn({ list: [['..', 'isActive']] }).pipe(
              map((item) => !item.list[0]),
            ),
        }),
      ),
    }),
    setComponent(PiyingViewGroup),
  );
}

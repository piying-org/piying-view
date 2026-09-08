import { Component } from '@angular/core';
import {
  actions,
  asVirtualGroup,
  PiyingView,
  PiyingViewGroup,
} from '@piying/view-angular';
import * as v from 'valibot';
import { InputFCC } from '@piying-lib/angular-daisyui/field-control';
import { setComponent } from '@piying/view-angular-core';

@Component({
  selector: 'as-control-group-demo',
  standalone: true,
  template: ` <piying-view [schema]="schema"></piying-view> `,
  imports: [PiyingView],
})
export class AsControlGroupDemoComponent {
  schema = v.pipe(
    v.object({
      name: v.pipe(
        v.string(),
        setComponent(InputFCC),
        actions.attributes.set({ placeholder: '姓名' }),
      ),
      settings: v.pipe(
        v.intersect([
          v.object({
            theme: v.pipe(
              v.string(),
              setComponent(InputFCC),
              actions.attributes.set({ placeholder: '主题' }),
            ),
          }),
          v.object({
            lang: v.pipe(
              v.string(),
              setComponent(InputFCC),
              actions.attributes.set({ placeholder: '语言' }),
            ),
          }),
        ]),
        asVirtualGroup(),
        setComponent(PiyingViewGroup),
      ),
    }),
    setComponent(PiyingViewGroup),
  );
}

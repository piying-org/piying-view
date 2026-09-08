import { Component, signal } from '@angular/core';
import { PiyingView, PiyingViewGroup } from '@piying/view-angular';
import * as v from 'valibot';
import { InputFCC } from '@piying-lib/angular-daisyui/field-control';
import { setComponent } from '@piying/view-angular-core';

@Component({
  selector: 'array-demo',
  standalone: true,
  template: ` <piying-view [schema]="schema" [model]="model()"></piying-view> `,
  imports: [PiyingView],
})
export class ArrayDemoComponent {
  model = signal({ tags: ['angular', 'vue', 'react'] });

  schema = v.pipe(
    v.object({
      tags: v.pipe(
        v.array(v.pipe(v.string(), setComponent(InputFCC))),
        setComponent(PiyingViewGroup),
      ),
    }),
    setComponent(PiyingViewGroup),
  );
}

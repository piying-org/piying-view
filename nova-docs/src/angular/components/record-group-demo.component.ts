import { Component, signal } from '@angular/core';
import { PiyingView, PiyingViewGroup } from '@piying/view-angular';
import * as v from 'valibot';
import { InputFCC } from '@piying-lib/angular-daisyui/field-control';
import { setComponent } from '@piying/view-angular-core';

@Component({
  selector: 'record-group-demo',
  standalone: true,
  template: ` <piying-view [schema]="schema" [model]="model()"></piying-view> `,
  imports: [PiyingView],
})
export class RecordGroupDemoComponent {
  model = signal({
    metadata: {
      department: '研发部',
      level: 'P7',
    },
  });

  schema = v.pipe(
    v.object({
      metadata: v.pipe(
        v.record(v.string(), v.pipe(v.string(), setComponent(InputFCC))),
        setComponent(PiyingViewGroup),
      ),
    }),
    setComponent(PiyingViewGroup),
  );
}

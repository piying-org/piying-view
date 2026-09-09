import { PiyingViewGroup } from '@piying/view-angular';
import * as v from 'valibot';
import { InputFCC } from '@piying-lib/angular-daisyui/field-control';
import { setComponent, valueChange } from '@piying/view-angular-core';
import { BehaviorSubject } from 'rxjs';

export const context = { lastValue$: new BehaviorSubject<string | undefined>(undefined) };

export const options = { context };

export const schema = v.pipe(
  v.object({
    input1: v.pipe(
      v.string(),
      setComponent(InputFCC),
      valueChange((fn) => {
        fn({ list: [undefined] }).subscribe(({ list, field }) => {
          console.log('prev:', field.context.lastValue$.value);
          field.context.lastValue$.next(list[0]);
        });
      }),
    ),
  }),
  setComponent(PiyingViewGroup),
);

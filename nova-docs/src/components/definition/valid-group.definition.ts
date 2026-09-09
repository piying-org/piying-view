import * as v from 'valibot';
import { InputFCC } from '@piying-lib/angular-daisyui/field-control';
import { setComponent } from '@piying/view-angular-core';

export const schema = v.pipe(
  v.object({
    k1: v.pipe(v.string(), setComponent(InputFCC)),
    k2: v.pipe(
      v.string(),
      setComponent(InputFCC),
      v.check((value) => value === 'k2-value', 'should input k2-value'),
    ),
  }),
  setComponent('validGroup'),
);

import * as v from 'valibot';
import { setComponent } from '@piying/view-angular-core';

export const schema = v.pipe(
  v.object({
    k1: v.pipe(v.string()),
    k2: v.pipe(
      v.string(),
      v.check((value) => value === 'k2-value', 'should input k2-value'),
    ),
  }),
  setComponent('validGroup'),
);

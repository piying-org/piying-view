import * as v from 'valibot';
import { setComponent } from '@piying/view-angular-core';

export const schema = v.pipe(
  v.object({
    k1: v.string(),
    k2: v.pipe(
      v.string(),
      v.check((value) => value === 'k2-value'),
    ),
  }),
  setComponent('validGroup'),
);

export const model = { k1: '', k2: '' };

import * as v from 'valibot';
import { actions } from '@piying/view-angular';
import { setComponent } from '@piying/view-angular-core';

export const schema = v.pipe(
  v.object({
    k1: v.pipe(
      v.string(),
      v.check((value) => value === 'k2-value', 'should input k2-value'),
      actions.wrappers.set(['validator']),
    ),
  }),
);

export const model = { k1: '' };

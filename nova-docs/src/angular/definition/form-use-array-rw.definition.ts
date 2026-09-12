import * as v from 'valibot';
import { actions } from '@piying/view-angular';
import { setComponent } from '@piying/view-angular-core';

export const schema = v.object({
  list: v.pipe(
    v.array(v.string()),
    setComponent('array-rw'),
    actions.inputs.set({ minLength: 2 }),
  ),
});

export const model = { list: ['v1', 'v2'] };

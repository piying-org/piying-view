import * as v from 'valibot';
import { NFCSchema, setComponent, actions } from '@piying/view-angular-core';

export const schema = v.pipe(
  v.object({
    __k1: v.pipe(NFCSchema, setComponent('string'), actions.wrappers.set([])),
    __k2: v.pipe(
      v.optional(v.void()),
      setComponent('string'),
      actions.wrappers.set([]),
    ),
  }),
  setComponent('fieldset'),
);

import * as v from 'valibot';
import { NFCSchema, setComponent } from '@piying/view-angular-core';

export const schema = v.pipe(
  v.object({
    __k1: v.pipe(NFCSchema, setComponent('string')),
    __k2: v.pipe(v.optional(v.void()), setComponent('string')),
  }),
  setComponent('fieldset'),
);

import * as v from 'valibot';
import { NFCSchema, setComponent } from '@piying/view-angular-core';

export const schema = v.object({
  k1: v.string(),
  o1: v.object({
    k2: v.string(),
    k3: v.string(),
  }),
  __helper: v.pipe(NFCSchema, setComponent('formHelper')),
});

import * as v from 'valibot';
import { NFCSchema, setComponent } from '@piying/view-angular-core';

export const schema = v.object({
  list: v.looseTuple([v.string()]),
  __helper: v.pipe(NFCSchema, setComponent('formHelper')),
});

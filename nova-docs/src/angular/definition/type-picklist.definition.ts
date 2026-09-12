import * as v from 'valibot';
import { NFCSchema, setComponent } from '@piying/view-angular-core';

export const schema = v.object({
  k1: v.picklist(['v1', 'v2', 'v3']),
  __helper: v.pipe(NFCSchema, setComponent('formHelper')),
});

import * as v from 'valibot';
import { NFCSchema, setComponent } from '@piying/view-angular-core';

export const schema = v.object({
  o1: v.record(v.string(), v.string()),
  __helper: v.pipe(NFCSchema, setComponent('formHelper')),
});

export const model = { o1: { k1: 'v1' } };

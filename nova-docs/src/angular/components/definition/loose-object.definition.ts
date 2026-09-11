import * as v from 'valibot';
import { NFCSchema, setComponent } from '@piying/view-angular-core';

export const schema = v.looseObject({
  k1: v.string(),
  k2: v.number(),
  __helper: v.pipe(NFCSchema, setComponent('formHelper')),
});

export const model = { k1: 'v1', k2: 2 };

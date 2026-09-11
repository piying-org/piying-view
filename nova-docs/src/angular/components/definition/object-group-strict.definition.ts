import * as v from 'valibot';
import { NFCSchema, setComponent } from '@piying/view-angular-core';

export const schema = v.strictObject({
  k1: v.string(),
  __helper: v.pipe(NFCSchema, setComponent('formHelper')),
});

export const model = { k1: 'v1', extraKey: 'schema 未定义的键' };

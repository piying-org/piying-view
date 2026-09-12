import * as v from 'valibot';
import { NFCSchema, setComponent } from '@piying/view-angular-core';

export const schema = v.object({
  list: v.tuple([v.string()]),
  __helper: v.pipe(NFCSchema, setComponent('formHelper')),
});

export const model = { list: ['v1'] };

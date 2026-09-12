import * as v from 'valibot';
import { formConfig, NFCSchema, setComponent } from '@piying/view-angular-core';

export const schema = v.object({
  profile: v.pipe(
    v.object({
      k1: v.optional(v.string()),
      k2: v.optional(v.string()),
    }),
    formConfig({ emptyValue: { empty: true } }),
  ),
  __helper: v.pipe(NFCSchema, setComponent('formHelper')),
});

export const model = { profile: {} };

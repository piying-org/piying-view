import * as v from 'valibot';
import { NFCSchema, setComponent } from '@piying/view-angular-core';

export const schema = v.intersect([
  v.objectWithRest(
    {
      k1: v.string(),
      k2: v.number(),
    },
    v.string(),
  ),
  v.optional(
    v.object({
      __helper: v.pipe(NFCSchema, setComponent('formHelper')),
    }),
  ),
]);

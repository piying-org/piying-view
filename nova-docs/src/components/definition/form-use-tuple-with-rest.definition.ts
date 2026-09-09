import * as v from 'valibot';
import { NFCSchema, setComponent } from '@piying/view-angular-core';

export const schema = v.intersect([
  v.object({
    list: v.tupleWithRest([v.string()], v.string()),
    __helper: v.pipe(NFCSchema, setComponent('formHelper')),
  }),
]);

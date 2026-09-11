import * as v from 'valibot';
import {
  asVirtualGroup,
  formConfig,
  NFCSchema,
  setComponent,
} from '@piying/view-angular-core';

export const schema = v.pipe(
  v.intersect([v.object({ a: v.string(), __helper: v.pipe(NFCSchema, setComponent('formHelper')) })]),
  asVirtualGroup(),
  formConfig({ groupMode: 'loose' }),
);

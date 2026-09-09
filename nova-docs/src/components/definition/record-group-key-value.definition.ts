import * as v from 'valibot';
import { formConfig } from '@piying/view-angular-core';

export const schema = v.pipe(
  v.record(v.string(), v.string()),
  formConfig({
    groupKeySchema: v.picklist(['name', 'email', 'phone']),
    groupValueSchema: v.pipe(v.string(), v.minLength(1)),
  }),
);

import * as v from 'valibot';
import { formConfig } from '@piying/view-angular-core';

export const schema = v.object({
  readonlyField: v.pipe(v.string(), formConfig({ disabled: true })),
});

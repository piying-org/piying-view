import * as v from 'valibot';
import { formConfig } from '@piying/view-angular-core';

export const schema = v.object({
  name: v.pipe(
    v.string(),
    formConfig({
      required: true,
      defaultValue: '无名',
    }),
  ),
});

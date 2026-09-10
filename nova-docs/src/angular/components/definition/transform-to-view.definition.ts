import * as v from 'valibot';
import { formConfig } from '@piying/view-angular-core';

export const schema = v.object({
  date: v.pipe(
    v.string(),
    formConfig({
      transformer: {
        toView: (value: any) => new Date(value).toLocaleDateString(),
      },
    }),
  ),
});

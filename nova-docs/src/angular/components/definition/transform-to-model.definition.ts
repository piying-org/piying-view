import * as v from 'valibot';
import { formConfig } from '@piying/view-angular-core';

export const schema = v.object({
  price: v.pipe(
    v.string(),
    formConfig({
      transformer: {
        toModel: (value: any) => parseFloat(value),
      },
    }),
  ),
});

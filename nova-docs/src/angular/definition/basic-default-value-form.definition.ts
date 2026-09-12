import * as v from 'valibot';
import { formConfig } from '@piying/view-angular-core';

export const schema = v.object({
  age: v.pipe(v.number(), formConfig({ defaultValue: 18 })),
});

export const model = { age: 18 };

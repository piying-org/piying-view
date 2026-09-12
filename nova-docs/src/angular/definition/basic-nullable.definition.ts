import * as v from 'valibot';
import { formConfig } from '@piying/view-angular-core';

export const schema = v.object({
  name: v.nullable(v.string()),
  email: v.pipe(v.optional(v.string()), formConfig({ undefinedable: true })),
});

export const model = { name: '张三', email: 'a@b.com' };

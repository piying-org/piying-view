import * as v from 'valibot';
import { formConfig } from '@piying/view-angular-core';

export const schema = v.object({
  tags: v.pipe(v.array(v.string()), formConfig({ required: true })),
});

export const model = { tags: ['v1', 'v2'] };

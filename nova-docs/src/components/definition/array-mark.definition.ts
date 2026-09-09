import * as v from 'valibot';
import { formConfig } from '@piying/view-angular-core';

export const schema = v.pipe(v.tuple([v.number(), v.string()]), formConfig({ deletionMode: 'mark' }));

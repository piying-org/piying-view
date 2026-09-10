import * as v from 'valibot';
import { formConfig } from '@piying/view-angular-core';

export const schema = v.pipe(v.object({ a: v.pipe(v.number(), v.maxValue(5)) }), formConfig({ emptyValue: {} }));

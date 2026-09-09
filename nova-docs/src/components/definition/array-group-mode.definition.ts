import * as v from 'valibot';
import { asVirtualGroup, formConfig } from '@piying/view-angular-core';

export const schema = v.pipe(v.intersect([v.object({ a: v.string() })]), asVirtualGroup(), formConfig({ groupMode: 'loose' }));

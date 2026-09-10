import * as v from 'valibot';
import { formConfig } from '@piying/view-angular-core';

export const schema = v.pipe(
  v.array(v.string()),
  formConfig({ deletionMode: 'shrink' }),
);

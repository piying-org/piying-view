import { actions } from '@piying/view-angular';
import * as v from 'valibot';
import { NFCSchema, setComponent } from '@piying/view-angular-core';

export const schema = v.pipe(
  v.object({
    k1: v.pipe(
      v.string(),
      v.title('k1-label'),
      actions.wrappers.set(['label']),
    ),
    k2: v.pipe(v.number(), v.title('k2-label'), v.minValue(10)),
    __helper: v.pipe(NFCSchema, setComponent('formHelper')),
  }),
  setComponent('fieldset'),
);

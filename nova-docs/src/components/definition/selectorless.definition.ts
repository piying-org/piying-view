import { actions } from '@piying/view-angular';
import * as v from 'valibot';
import { NFCSchema, setComponent } from '@piying/view-angular-core';

export const schema = v.pipe(
  v.object({
    __sel: v.pipe(
      NFCSchema,
      setComponent('selectorless-demo'),
      actions.wrappers.set(['label']),
      v.title('selectorless'),
    ),
  }),
  setComponent('fieldset'),
);

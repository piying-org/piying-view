import { actions } from '@piying/view-angular';
import * as v from 'valibot';
import {
  NFCSchema,
  outputChange,
  setComponent,
} from '@piying/view-angular-core';

export const schema = v.pipe(
  v.object({
    input: v.pipe(v.string(),),
    __btn: v.pipe(
      NFCSchema,
      setComponent('demo'),
      actions.inputs.set({ input1: 1 }),
      outputChange((fn) => {
        fn([{ list: undefined, output: 'output1' }]).subscribe(({ field }) => {
          console.log('output received', field);
        });
      }),
    ),
  }),
  setComponent('fieldset'),
);

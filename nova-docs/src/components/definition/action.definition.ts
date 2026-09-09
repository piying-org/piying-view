import { actions } from '@piying/view-angular';
import * as v from 'valibot';
import { InputFCC } from '@piying-lib/angular-daisyui/field-control';
import { NFCSchema, outputChange, setComponent } from '@piying/view-angular-core';

export const schema = v.pipe(
  v.object({
    input: v.pipe(v.string(), setComponent(InputFCC)),
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

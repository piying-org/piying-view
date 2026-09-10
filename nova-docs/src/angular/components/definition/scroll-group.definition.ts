import { actions } from '@piying/view-angular';
import * as v from 'valibot';
import { InputFCC } from '@piying-lib/angular-daisyui/field-control';
import { setComponent } from '@piying/view-angular-core';

export const schema = v.pipe(
  v.object(
    new Array(100)
      .fill(undefined)
      .map((item, i) =>
        v.pipe(v.string(), setComponent(InputFCC), v.title(`title${i}`)),
      )
      .reduce((obj, item, i) => {
        obj[`k${i}`] = item;
        return obj;
      }, Object.create({})),
  ),
  setComponent('scrollGroup'),
  actions.inputs.set({ scrollHeight: 500, placeholerHeight: 20 }),
);

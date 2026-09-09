import * as v from 'valibot';
import { valueChange } from '@piying/view-angular-core';

export const schema = v.object({
  k1: v.pipe(
    v.string(),
    valueChange((fn) => {
      fn({ list: [undefined] }).subscribe(({ list }) => {
        console.log(list[0]);
      });
    }),
  ),
});

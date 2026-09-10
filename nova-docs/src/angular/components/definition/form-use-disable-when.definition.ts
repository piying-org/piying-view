import * as v from 'valibot';
import { disableWhen } from '@piying/view-angular-core';
import { map } from 'rxjs';

export const schema = v.object({
  enable: v.boolean(),
  value: v.intersect([
    v.pipe(
      v.object({
        input1: v.string(),
        input2: v.string(),
      }),
      disableWhen({
        listen: (fn) => {
          return fn({ list: [['#', 'enable']] }).pipe(
            map(({ list }) => list[0]),
          );
        },
      }),
    ),
    v.pipe(
      v.object({
        input3: v.string(),
        input4: v.string(),
      }),
      disableWhen({
        listen: (fn) => {
          return fn({ list: [['#', 'enable']] }).pipe(
            map(({ list }) => !list[0]),
          );
        },
      }),
    ),
  ]),
});

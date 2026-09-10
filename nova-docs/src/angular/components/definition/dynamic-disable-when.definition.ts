import * as v from 'valibot';
import { disableWhen } from '@piying/view-angular-core';
import { map } from 'rxjs';

export const schema = v.object({
  isActive: v.boolean(),
  name: v.pipe(
    v.string(),
    disableWhen({
      listen: (fn) =>
        fn({ list: [['..', 'isActive']] }).pipe(
          map((item) => !item.list[0]),
        ),
    }),
  ),
});

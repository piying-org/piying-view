import * as v from 'valibot';
import { hideWhen } from '@piying/view-angular-core';
import { map } from 'rxjs';

export const schema = v.object({
  enable: v.boolean(),
  name: v.pipe(
    v.string(),
    hideWhen({
      disabled: true,
      listen: (fn) => fn({ list: [['..', 'enable']] }).pipe(map((item) => !item.list[0])),
    }),
  ),
});

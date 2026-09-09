import * as v from 'valibot';
import { hideWhen } from '@piying/view-angular-core';
import { map } from 'rxjs';

export const schema = v.object({
  showExtra: v.boolean(),
  extraField: v.pipe(
    v.string(),
    hideWhen({
      listen: (fn) =>
        fn({ list: [['..', 'showExtra']] }).pipe(
          map((item) => !item.list[0]),
        ),
    }),
  ),
});

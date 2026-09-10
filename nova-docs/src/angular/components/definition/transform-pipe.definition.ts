import * as v from 'valibot';
import { formConfig } from '@piying/view-angular-core';
import { debounceTime, filter, map, pipe } from 'rxjs';

export const schema = v.object({
  search: v.pipe(
    v.string(),
    formConfig({
      pipe: {
        toModel: pipe(
          debounceTime(300),
          filter((v) => v.trim().length > 0),
          map((v) => v.toLowerCase()),
        ),
      },
    }),
  ),
});

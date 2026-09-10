import * as v from 'valibot';
import { valueChange } from '@piying/view-angular-core';
import { skip } from 'rxjs';

export const schema = v.object({
  k1: v.boolean(),
  k2: v.pipe(
    v.boolean(),
    valueChange((fn) => {
      fn({ list: [['#', 'k1']] })
        .pipe(skip(1))
        .subscribe(({ list: [value], field }) => {
          field.form.control?.updateValue(!value);
        });
    }),
  ),
  k3: v.pipe(
    v.boolean(),
    valueChange((fn) => {
      fn({ list: [['#', 'k2']] })
        .pipe(skip(1))
        .subscribe(({ list: [value], field }) => {
          field.form.control?.updateValue(!value);
        });
    }),
  ),
});

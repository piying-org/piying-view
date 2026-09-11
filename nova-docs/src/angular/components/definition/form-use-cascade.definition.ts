import * as v from 'valibot';
import {
  actions,
  NFCSchema,
  setComponent,
  valueChange,
} from '@piying/view-angular-core';
import { skip } from 'rxjs';
import { appendLog } from '../log';

export const schema = v.object({
  k1: v.boolean(),
  k2: v.pipe(
    v.boolean(),
    valueChange((fn) => {
      fn({ list: [['#', 'k1']] })
        .pipe(skip(1))
        .subscribe(({ list: [value], field }) => {
          field.form.control?.updateValue(!value);
          appendLog(field, `k1 = ${value} → k2 = ${!value}`);
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
          appendLog(field, `k2 = ${value} → k3 = ${!value}`);
        });
    }),
  ),
  k4: v.pipe(
    v.boolean(),
    valueChange((fn) => {
      fn({ list: [['#', 'k3']] })
        .pipe(skip(1))
        .subscribe(({ list: [value], field }) => {
          field.form.control?.updateValue(!value);
          appendLog(field, `k3 = ${value} → k4 = ${!value}`);
        });
    }),
  ),
  __log: v.pipe(
    NFCSchema,
    setComponent('log'),
    actions.inputs.set({ logs: [] }),
  ),
});

export const model = { k1: true, k2: false, k3: true, k4: false };

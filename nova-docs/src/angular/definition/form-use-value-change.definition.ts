import * as v from 'valibot';
import {
  actions,
  NFCSchema,
  setComponent,
  valueChange,
} from '@piying/view-angular-core';
import { appendLog } from '../components/log';

export const schema = v.object({
  k1: v.pipe(
    v.string(),
    valueChange((fn) => {
      fn({ list: [undefined] }).subscribe(({ list, field }) => {
        appendLog(field, `k1 = ${JSON.stringify(list[0])}`);
      });
    }),
  ),
  __log: v.pipe(
    NFCSchema,
    setComponent('log'),
    actions.inputs.set({ logs: [] }),
  ),
});

export const model = { k1: '' };

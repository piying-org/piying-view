import * as v from 'valibot';
import {
  actions,
  NFCSchema,
  setComponent,
  valueChange,
} from '@piying/view-angular-core';
import { appendLog } from '../log';

export const schema = v.object({
  list: v.pipe(
    v.picklist(['data1', 'data2']),
    valueChange((fn) => {
      fn().subscribe(({ list: [value], field }) => {
        const o1FG = field.get(['#', 'o1']).form.control;
        const o2FG = field.get(['#', 'o2']).form.control;
        if (value === 'data1') {
          o1FG.updateValue({ k1: 'data1-input-k1', k2: 'data1-input-k2' });
          o2FG.updateValue({});
          appendLog(field, 'list = data1 → 写入 o1，清空 o2');
        } else {
          o2FG.updateValue({ k3: 'data2-input-k3', k4: 'data2-input-k4' });
          o1FG.updateValue({});
          appendLog(field, 'list = data2 → 写入 o2，清空 o1');
        }
      });
    }),
  ),
  o1: v.object({ k1: v.optional(v.string()), k2: v.optional(v.string()) }),
  o2: v.object({ k3: v.optional(v.string()), k4: v.optional(v.string()) }),
  __log: v.pipe(
    NFCSchema,
    setComponent('log'),
    actions.inputs.set({ logs: [] }),
  ),
});

import * as v from 'valibot';
import {
  actions,
  disableWhen,
  NFCSchema,
  setComponent,
} from '@piying/view-angular-core';
import { map } from 'rxjs';
import { appendLog } from '../log';

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
            map(({ list, field }) => {
              appendLog(
                field,
                `enable = ${list[0]} → input1 / input2 ${list[0] ? '禁用' : '可编辑'}`,
              );
              return list[0];
            }),
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
            map(({ list, field }) => {
              appendLog(
                field,
                `enable = ${list[0]} → input3 / input4 ${list[0] ? '可编辑' : '禁用'}`,
              );
              return !list[0];
            }),
          );
        },
      }),
    ),
  ]),
  __log: v.pipe(
    NFCSchema,
    setComponent('log'),
    actions.inputs.set({ logs: [] }),
  ),
});

export const model = {
  enable: true,
  value: { input1: '', input2: '', input3: '', input4: '' },
};

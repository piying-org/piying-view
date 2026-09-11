import * as v from 'valibot';
import { actions, NFCSchema, setComponent } from '@piying/view-angular-core';
import { SimpleInputC } from '../simple-input';
import { appendLog } from '../log';

export const schema = v.pipe(
  v.object({
    input: v.pipe(
      v.string(),
      // V1 控件：events 会自动绑定到宿主元素
      setComponent(SimpleInputC),
      actions.inputs.set({ placeholder: '点我，或在此输入后按 Enter' }),
      actions.events.patchAsync({
        click: (field) => () => {
          return appendLog(field, 'click 触发');
        },
        keydown: (field) => (event: KeyboardEvent) => {
          if (event.key === 'Enter') {
            appendLog(field, 'Enter 触发');
          }
        },
      }),
    ),
    __log: v.pipe(
      NFCSchema,
      setComponent('log'),
      actions.inputs.set({ logs: [] }),
    ),
  }),
  setComponent('fieldset'),
);

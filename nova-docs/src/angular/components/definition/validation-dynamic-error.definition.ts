import * as v from 'valibot';
import { formConfig } from '@piying/view-angular-core';

export const schema = v.object({
  age: v.pipe(
    v.number(),
    formConfig({
      validators: [
        (control) => {
          if (control.value < 0) {
            return [
              {
                kind: 'negative',
                metadata: { value: control.value },
                message: `年龄不能为负数（当前: ${control.value}）`,
              },
            ];
          }
          if (control.value > 150) {
            return [
              {
                kind: 'tooOld',
                metadata: { value: control.value },
                message: `年龄不合理（当前: ${control.value}）`,
              },
            ];
          }
          return undefined;
        },
      ],
    }),
  ),
});

export const model = { age: 25 };

import * as v from 'valibot';
import { formConfig } from '@piying/view-angular-core';

export const schema = v.object({
  password: v.pipe(
    v.string(),
    formConfig({
      validators: [
        (control) => {
          if (control.value?.includes('123')) {
            return [
              {
                kind: 'weakPassword',
                message: '密码不能包含连续数字',
              },
            ];
          }
          return undefined;
        },
        (control) => {
          if (control.value?.length < 8) {
            return { tooShort: '密码至少 8 个字符' };
          }
          return undefined;
        },
      ],
    }),
  ),
});

import * as v from 'valibot';
import { formConfig } from '@piying/view-angular-core';

export const schema = v.object({
  password: v.pipe(
    v.string(),
    formConfig({
      validators: [
        (control) => {
          if (control.value?.includes('123')) {
            return { weakPassword: '密码不能包含连续数字' };
          }
          return undefined;
        },
      ],
    }),
  ),
});

export const model = { password: 'abc' };

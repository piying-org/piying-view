import * as v from 'valibot';
import { formConfig } from '@piying/view-angular-core';

export const schema = v.pipe(
  v.object({
    password: v.pipe(v.string()),
    confirmPassword: v.pipe(v.string()),
  }),
  formConfig({
    validators: [
      (control) => {
        const parent = control.root;
        if (parent.value?.password !== parent.value?.confirmPassword) {
          return [
            {
              kind: 'passwordsNotMatch',
              message: '两次密码不一致',
            },
          ];
        }
        return undefined;
      },
    ],
  }),
);

export const model = { password: '12345678', confirmPassword: '87654321' };

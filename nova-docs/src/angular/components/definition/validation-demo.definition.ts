import * as v from 'valibot';
import { actions, formConfig } from '@piying/view-angular-core';

export const schema = v.object({
  password: v.pipe(
    v.string(),
    actions.attributes.set({ placeholder: '密码（至少 8 位，不含 123）' }),
    formConfig({
      validators: [
        (control) => {
          const value = control.value ?? '';
          if (value.includes('123')) {
            return [
              {
                kind: 'weakPassword',
                message: '密码不能包含连续数字',
              },
            ];
          }
          if (value.length < 8) {
            return [
              {
                kind: 'tooShort',
                message: '密码至少 8 个字符',
              },
            ];
          }
          return undefined;
        },
      ],
    }),
  ),

  confirmPassword: v.pipe(
    v.string(),
    actions.attributes.set({ placeholder: '确认密码（需与密码一致）' }),
    formConfig({
      validators: [
        (control) => {
          const password = control.root.get('password')?.value;
          if (control.value && password !== control.value) {
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
  ),
});

import * as v from 'valibot';
import { formConfig } from '@piying/view-angular-core';
import { untracked } from '@angular/core';

export const schema = v.object({
  password: v.pipe(v.string()),
  confirmPassword: v.pipe(
    v.string(),
    formConfig({
      validators: [
        (control) => {
          return untracked(() => {
            const parent = control.root;
            if (parent.value?.password !== control.value) {
              return [
                {
                  kind: 'passwordsNotMatch',
                  message: '两次密码不一致',
                },
              ];
            }
            return undefined;
          });
        },
      ],
    }),
  ),
});

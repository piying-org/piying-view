import * as v from 'valibot';
import { formConfig } from '@piying/view-angular-core';

export const schema = v.object({
  username: v.pipe(
    v.string(),
    formConfig({
      asyncValidators: [
        async (control) => {
          const response = await fetch(`/api/check-username?name=${control.value}`);
          const available = await response.json();
          if (!available) {
            return [
              {
                kind: 'usernameTaken',
                metadata: { value: control.value },
                message: '用户名已被占用',
              },
            ];
          }
          return undefined;
        },
      ],
    }),
  ),
});

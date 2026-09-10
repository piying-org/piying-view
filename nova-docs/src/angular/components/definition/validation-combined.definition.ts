import * as v from 'valibot';
import { formConfig } from '@piying/view-angular-core';

export const schema = v.object({
  email: v.pipe(
    v.string(),
    v.email('邮箱格式不正确'),
    formConfig({
      validators: [
        (control) => {
          if (control.value?.endsWith('.test')) {
            return [
              {
                kind: 'testDomain',
                message: '不能使用测试域名',
              },
            ];
          }
          return undefined;
        },
      ],
    }),
  ),
});

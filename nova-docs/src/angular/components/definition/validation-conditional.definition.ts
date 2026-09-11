import * as v from 'valibot';
import { formConfig } from '@piying/view-angular-core';

export const schema = v.pipe(
  v.object({
    hasAddress: v.boolean(),
    address: v.pipe(v.string()),
  }),
  formConfig({
    validators: [
      (control) => {
        const parent = control.root;
        if (parent.value?.hasAddress && !parent.value?.address) {
          return [
            {
              kind: 'conditionalRequired',
              message: '需要填写地址',
            },
          ];
        }
        return undefined;
      },
    ],
  }),
);

export const model = { hasAddress: true, address: '' };

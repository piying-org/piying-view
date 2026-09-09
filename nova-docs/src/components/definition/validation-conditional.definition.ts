import * as v from 'valibot';
import { formConfig } from '@piying/view-angular-core';
import { untracked } from '@angular/core';

export const schema = v.object({
  hasAddress: v.boolean(),
  address: v.pipe(
    v.string(),
    formConfig({
      validators: [
        (control) => {
          return untracked(() => {
            const parent = control.root;
            if (parent.value?.hasAddress && !control.value) {
              return [
                {
                  kind: 'conditionalRequired',
                  message: '需要填写地址',
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

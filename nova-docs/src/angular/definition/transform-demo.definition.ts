import * as v from 'valibot';
import { actions, formConfig } from '@piying/view-angular-core';

export const schema = v.object({
  name: v.pipe(
    v.string(),
    actions.attributes.set({ placeholder: '输入前后带空格的值' }),
    formConfig({
      transformer: {
        toModel: (value) => value?.trim() ?? '',
      },
    }),
  ),
});

export const model = { name: '' };

import * as v from 'valibot';
import { InputFCC } from '@piying-lib/angular-daisyui/field-control';
import { rawConfig, setComponent } from '@piying/view-angular-core';

export const schema = v.pipe(
  v.object({
    k1: v.pipe(
      v.string(),
      rawConfig((field) => {
        field.attributes = {
          ...field.attributes,
          placeholder: 'rawConfig 底层配置',
        };
        return field;
      }),
    ),
  }),
  setComponent('fieldset'),
);

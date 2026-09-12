import * as v from 'valibot';
import { map } from 'rxjs';
import { actions, NFCSchema, setComponent } from '@piying/view-angular-core';

export const schema = v.pipe(
  v.object({
    input: v.pipe(
      v.string(),
      actions.attributes.set({
        placeholder: '悬停输入框看 title，敲击看 data-length',
        title: '0',
      }),
      // patchAsync：随值变化动态更新 data-length（可在开发者工具中观察）
      actions.attributes.patchAsync({
        title: (field) =>
          field.form.control!.valueChanges.pipe(
            map((value) => String((value as string)?.length ?? 0)),
          ),
      }),
    ),
  }),
  setComponent('fieldset'),
);

import * as v from 'valibot';
import { map } from 'rxjs';
import { actions, setComponent } from '@piying/view-angular-core';

export const schema = v.pipe(
  v.object({
    bottom: v.pipe(
      v.string(),
      actions.attributes.set({ placeholder: 'bottom：固定 class' }),
      // 作用于字段组件本身
      actions.class.bottom('rounded-box border-2 border-primary px-2'),
    ),
    asyncBottom: v.pipe(
      v.string(),
      actions.attributes.set({ placeholder: 'asyncBottom：class 随值切换' }),
      // 回调返回 Observable，值变化时动态更新 class
      actions.class.asyncBottom((field) =>
        field.form.control!.valueChanges.pipe(
          map((value) =>
            (value as string)?.length > 5 ? 'bg-error/30' : 'bg-success/30',
          ),
        ),
      ),
    ),
  }),
  setComponent('fieldset'),
);

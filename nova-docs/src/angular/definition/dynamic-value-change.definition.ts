import * as v from 'valibot';
import { valueChange } from '@piying/view-angular-core';

export const schema = v.object({
  source: v.string(),
  target: v.pipe(
    v.string(),
    valueChange((fn) =>
      fn({ list: [['..', 'source']] }).subscribe((value) => {
        // 自定义逻辑：源字段变化时更新目标字段
      }),
    ),
  ),
});

export const model = { source: '', target: '' };

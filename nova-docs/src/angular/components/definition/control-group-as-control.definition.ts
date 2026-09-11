import * as v from 'valibot';
import { asControl, setComponent } from '@piying/view-angular-core';

export const schema = v.object({
  address: v.pipe(
    v.object({
      city: v.string(),
      street: v.string(),
    }),
    // 仅测试
    setComponent('textarea'),
    asControl(),
  ),
});

export const model = { address: { city: '上海', street: '南京路' } };

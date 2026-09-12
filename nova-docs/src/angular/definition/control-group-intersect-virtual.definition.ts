import { asVirtualGroup } from '@piying/view-angular';
import * as v from 'valibot';
import { actions } from '@piying/view-angular-core';

export const schema = v.object({
  name: v.pipe(v.string(), actions.attributes.set({ placeholder: '姓名' })),
  settings: v.pipe(
    v.intersect([
      v.object({
        theme: v.pipe(v.string(), actions.attributes.set({ placeholder: '主题' })),
      }),
      v.object({
        lang: v.pipe(v.string(), actions.attributes.set({ placeholder: '语言' })),
      }),
    ]),
    asVirtualGroup(),
  ),
});

export const model = { name: '张三', settings: { theme: 'dark', lang: 'zh-CN' } };

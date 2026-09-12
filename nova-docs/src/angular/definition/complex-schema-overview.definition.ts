import * as v from 'valibot';
import { actions } from '@piying/view-angular-core';

export const schema = v.object({
  name: v.pipe(v.string(), actions.attributes.set({ placeholder: '姓名' })),
  user: v.object({
    nickname: v.pipe(v.string(), actions.attributes.set({ placeholder: '昵称' })),
    age: v.pipe(v.number(), actions.attributes.set({ placeholder: '年龄' })),
    active: v.boolean(),
  }),
});

export const model = {
  name: '张三',
  user: { nickname: '小张', age: 20, active: true },
};

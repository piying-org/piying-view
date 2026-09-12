import * as v from 'valibot';
import { actions, setComponent } from '@piying/view-angular-core';

export const schema = v.object({
  name: v.pipe(
    v.string(),
    actions.attributes.set({ placeholder: '请输入用户名' }),
  ),
  age: v.pipe(
    v.number(),
    actions.attributes.set({ placeholder: '请输入年龄' }),
  ),
  bio: v.pipe(
    v.string(),
    setComponent('textarea'),
    actions.attributes.set({ placeholder: '请输入个人简介' }),
  ),
  active: v.boolean(),
});

export const model = { name: '', age: 18, bio: '', active: true };

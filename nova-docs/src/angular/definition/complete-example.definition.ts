import * as v from 'valibot';
import { actions, formConfig, hideWhen, setComponent } from '@piying/view-angular-core';
import { map } from 'rxjs';

export const schema = v.object({
  username: v.pipe(
    v.string(),
    actions.attributes.set({ placeholder: '用户名（必填）' }),
    formConfig({ required: true }),
  ),
  age: v.pipe(
    v.number(),
    actions.attributes.set({ placeholder: '年龄' }),
    formConfig({ required: true }),
  ),
  password: v.pipe(
    v.string(),
    actions.attributes.set({ placeholder: '密码（至少 8 位）' }),
    formConfig({
      validators: [
        (control) => {
          if (control.value.includes('123')) {
            return [
              {
                kind: 'weakPassword',
                message: '密码不能包含连续数字',
              },
            ];
          }
          if (control.value.length < 8) {
            return [
              {
                kind: 'tooShort',
                message: '密码至少 8 个字符',
              },
            ];
          }
          return undefined;
        },
      ],
    }),
  ),
  confirmPassword: v.pipe(
    v.string(),
    actions.attributes.set({ placeholder: '确认密码' }),
    formConfig({
      validators: [
        (control) => {
          const password = control.root.get('password')?.value;
          if (control.value && password !== control.value) {
            return [
              {
                kind: 'passwordsNotMatch',
                message: '两次密码不一致',
              },
            ];
          }
          return undefined;
        },
      ],
    }),
  ),
  showEmail: v.boolean(),
  email: v.pipe(
    v.string(),
    actions.attributes.set({ placeholder: '勾选上方开关后显示邮箱' }),
    hideWhen({
      listen: (fn) =>
        fn({ list: [['..', 'showEmail']] }).pipe(
          map((item) => !item.list[0]),
        ),
    }),
  ),
  bio: v.pipe(
    v.string(),
    setComponent('textarea'),
    actions.attributes.set({ placeholder: '自我介绍（可选）' }),
  ),
});

export const model = {
  username: '',
  age: 18,
  password: '',
  confirmPassword: '',
  showEmail: false,
  email: '',
  bio: '',
};

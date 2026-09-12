import * as v from 'valibot';
import { actions, disableWhen, hideWhen } from '@piying/view-angular-core';
import { map } from 'rxjs';

export const schema = v.object({
  showExtra: v.boolean(),
  extraField: v.pipe(
    v.string(),
    actions.attributes.set({ placeholder: '勾选上方开关后显示' }),
    hideWhen({
      listen: (fn) =>
        fn({ list: [['..', 'showExtra']] }).pipe(map((item) => !item.list[0])),
    }),
  ),
  isActive: v.boolean(),
  name: v.pipe(
    v.string(),
    actions.attributes.set({ placeholder: '勾选上方开关后启用编辑' }),
    disableWhen({
      listen: (fn) =>
        fn({ list: [['..', 'isActive']] }).pipe(map((item) => !item.list[0])),
    }),
  ),
});

export const model = {
  showExtra: true,
  extraField: '额外字段',
  isActive: true,
  name: '',
};

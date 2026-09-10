import * as v from 'valibot';
import { actions } from '@piying/view-angular';
import { setComponent, valueChange } from '@piying/view-angular-core';

export const schema = v.pipe(
  v.object({
    k1: v.pipe(v.string(), v.title('一级k1'), actions.wrappers.set(['label'])),
    o1: v.pipe(
      v.object({
        k2: v.pipe(v.optional(v.string()), v.title('二级k2'), actions.wrappers.set(['label'])),
        k3: v.pipe(v.optional(v.string()), v.title('二级k3'), actions.wrappers.set(['label'])),
      }),
      setComponent('fieldset'),
      v.title('一级o1'),
    ),
  }),
  setComponent('fieldset'),
  valueChange((fn) => {
    fn().subscribe(({ list }) => {
      console.log(list[0]);
    });
  }),
);

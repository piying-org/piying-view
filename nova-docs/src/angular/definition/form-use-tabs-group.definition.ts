import { asVirtualGroup } from '@piying/view-angular';
import * as v from 'valibot';
import { setComponent, valueChange } from '@piying/view-angular-core';

export const schema = v.pipe(
  v.intersect([
    v.pipe(
      v.object({
        k1: v.optional(v.string()),
        k2: v.optional(v.string()),
      }),
      setComponent('fieldset'),
      v.title('tab1-fieldset'),
    ),
    v.pipe(
      v.object({
        k3: v.optional(v.string()),
        k4: v.optional(v.string()),
      }),
      v.title('tab2'),
    ),
  ]),
  setComponent('tabs'),
  asVirtualGroup(),
  valueChange((fn) => {
    fn().subscribe(({ list }) => {
      console.log('tabs', list[0]);
    });
  }),
);

export const model = { k1: '', k2: '', k3: '', k4: '' };

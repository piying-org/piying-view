import { asVirtualGroup } from '@piying/view-angular';
import * as v from 'valibot';
import { setComponent } from '@piying/view-angular-core';

export const schema = v.pipe(
  v.intersect([
    v.pipe(
      v.object({
        k1: v.pipe(v.string()),
        k2: v.pipe(v.string()),
      }),
      v.title('tab1'),
    ),
    v.pipe(
      v.object({
        k3: v.pipe(v.string()),
        k4: v.pipe(v.string()),
      }),
      v.title('tab2'),
    ),
  ]),
  asVirtualGroup(),
  setComponent('tabs'),
);

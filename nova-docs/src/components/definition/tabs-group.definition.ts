import { actions, asVirtualGroup, PiyingViewGroup } from '@piying/view-angular';
import * as v from 'valibot';
import { InputFCC } from '@piying-lib/angular-daisyui/field-control';
import { TabsFGC } from '@piying-lib/angular-daisyui/field-group';
import { setComponent } from '@piying/view-angular-core';

export const schema = v.pipe(
  v.intersect([
    v.pipe(
      v.object({
        k1: v.pipe(v.string(), setComponent(InputFCC)),
        k2: v.pipe(v.string(), setComponent(InputFCC)),
      }),
      setComponent(PiyingViewGroup),
      v.title('tab1'),
    ),
    v.pipe(
      v.object({
        k3: v.pipe(v.string(), setComponent(InputFCC)),
        k4: v.pipe(v.string(), setComponent(InputFCC)),
      }),
      setComponent(PiyingViewGroup),
      v.title('tab2'),
    ),
  ]),
  asVirtualGroup(),
  setComponent(TabsFGC),
);

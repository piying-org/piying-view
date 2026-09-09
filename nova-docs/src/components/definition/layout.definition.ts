import { actions, asVirtualGroup, PiyingViewGroup } from '@piying/view-angular';
import * as v from 'valibot';
import { InputFCC } from '@piying-lib/angular-daisyui/field-control';
import { layout, setAlias, setComponent } from '@piying/view-angular-core';

export const schema = v.pipe(
  v.intersect([
    v.pipe(v.object({}), setComponent(PiyingViewGroup), setAlias('ly1')),
    v.pipe(v.object({}), setComponent(PiyingViewGroup), setAlias('ly2')),
    v.object({
      input1: v.pipe(
        v.string(),
        setComponent(InputFCC),
        layout({ keyPath: ['@ly1'] }),
      ),
      input2: v.pipe(
        v.string(),
        setComponent(InputFCC),
        layout({ keyPath: ['@ly2'], priority: 3 }),
      ),
      input3: v.pipe(
        v.string(),
        setComponent(InputFCC),
        layout({ keyPath: ['@ly2'], priority: 2 }),
      ),
      input4: v.pipe(
        v.string(),
        setComponent(InputFCC),
        layout({ keyPath: ['@ly2'], priority: 1 }),
      ),
    }),
  ]),
  asVirtualGroup(),
);

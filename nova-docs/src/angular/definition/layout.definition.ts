import { asVirtualGroup } from '@piying/view-angular';
import * as v from 'valibot';
import { layout, setAlias } from '@piying/view-angular-core';

export const schema = v.pipe(
  v.intersect([
    v.pipe(v.object({}), setAlias('ly1')),
    v.pipe(v.object({}), setAlias('ly2')),
    v.object({
      input1: v.pipe(
        v.string(),
        layout({ keyPath: ['@ly1'] }),
      ),
      input2: v.pipe(
        v.string(),
        layout({ keyPath: ['@ly2'], priority: 3 }),
      ),
      input3: v.pipe(
        v.string(),
        layout({ keyPath: ['@ly2'], priority: 2 }),
      ),
      input4: v.pipe(
        v.string(),
        layout({ keyPath: ['@ly2'], priority: 1 }),
      ),
    }),
  ]),
  asVirtualGroup(),
);

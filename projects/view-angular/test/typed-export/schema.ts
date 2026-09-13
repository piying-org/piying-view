import * as v from 'valibot';
import { setAlias } from '@piying/view-angular-core';

export const typedRoot = v.object({
  a: v.pipe(v.string(), setAlias('aa')),
  b: v.pipe(v.string(), setAlias('bb')),
  n: v.number(),
  list: v.array(
    v.object({ c: v.number(), s: v.pipe(v.string(), setAlias('ss')) }),
  ),
});

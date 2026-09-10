import * as v from 'valibot';

export const schema = v.intersect([
  v.objectWithRest(
    {
      k1: v.string(),
      k2: v.number(),
    },
    v.string(),
  ),
]);

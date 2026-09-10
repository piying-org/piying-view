import * as v from 'valibot';

export const schema = v.looseObject({
  k1: v.string(),
  k2: v.number(),
});

import * as v from 'valibot';

export const schema = v.object({
  k1: v.string(),
  k2: v.number(),
  k3: v.boolean(),
});

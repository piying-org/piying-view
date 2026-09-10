import * as v from 'valibot';

export const schema = v.object({
  k1: v.optional(v.string(), 'default value'),
});

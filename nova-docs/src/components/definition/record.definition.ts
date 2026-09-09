import * as v from 'valibot';

export const schema = v.object({
  o1: v.record(v.string(), v.string()),
});

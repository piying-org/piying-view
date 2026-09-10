import * as v from 'valibot';

export const schema = v.object({
  config: v.record(v.string(), v.union([v.string(), v.number(), v.boolean()])),
});

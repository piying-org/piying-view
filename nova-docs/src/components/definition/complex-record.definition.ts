import * as v from 'valibot';

export const schema = v.object({
  metadata: v.record(v.string(), v.string()),
  scores: v.record(v.string(), v.number()),
});

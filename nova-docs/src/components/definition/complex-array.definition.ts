import * as v from 'valibot';

export const schema = v.object({
  tags: v.array(v.string()),
  scores: v.array(v.number()),
});

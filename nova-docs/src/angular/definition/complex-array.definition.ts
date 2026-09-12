import * as v from 'valibot';

export const schema = v.object({
  tags: v.array(v.string()),
  scores: v.array(v.number()),
});

export const model = { tags: ['v1', 'v2'], scores: [1, 2] };

import * as v from 'valibot';

export const schema = v.object({
  tags: v.array(v.string()),
});

export const model = { tags: ['angular', 'vue', 'react'] };

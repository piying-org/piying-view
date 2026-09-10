import * as v from 'valibot';

export const schema = v.object({
  list: v.array(v.string()),
});

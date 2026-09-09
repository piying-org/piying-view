import * as v from 'valibot';

export const schema = v.object({
  tags: v.pipe(
    v.array(v.string()),
    v.transform((arr) => arr.join(',')),
  ),
});

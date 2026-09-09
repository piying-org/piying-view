import * as v from 'valibot';

export const schema = v.object({
  fullName: v.pipe(
    v.object({ first: v.string(), last: v.string() }),
    v.transform((obj) => `${obj.first} ${obj.last}`),
  ),
});

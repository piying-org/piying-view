import * as v from 'valibot';

export const schema = v.object({
  age: v.pipe(
    v.string(),
    v.transform((value) => parseInt(value, 10)),
  ),
});

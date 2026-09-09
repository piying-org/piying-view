import * as v from 'valibot';

export const schema = v.object({
  position: v.tuple([v.number(), v.number()]),
});

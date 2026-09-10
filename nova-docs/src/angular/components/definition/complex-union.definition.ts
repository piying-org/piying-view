import * as v from 'valibot';

export const schema = v.object({
  value: v.union([v.string(), v.number()]),
});

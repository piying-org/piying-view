import * as v from 'valibot';

export const schema = v.object({
  list: v.tupleWithRest([v.string()], v.string()),
});

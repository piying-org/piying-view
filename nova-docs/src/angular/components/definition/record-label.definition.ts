import * as v from 'valibot';

export const schema = v.object({
  labels: v.record(v.string(), v.string()),
});

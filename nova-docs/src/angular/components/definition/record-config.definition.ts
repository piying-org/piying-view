import * as v from 'valibot';

export const schema = v.object({
  config: v.record(v.string(), v.union([v.string(), v.number(), v.boolean()])),
});

export const model = { config: { theme: 'dark', count: 3 } };

import * as v from 'valibot';

export const schema = v.object({
  labels: v.record(v.string(), v.string()),
});

export const model = { labels: { 研发部: 'P7' } };

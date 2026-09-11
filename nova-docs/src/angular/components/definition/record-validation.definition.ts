import * as v from 'valibot';

export const schema = v.object({
  metadata: v.record(v.string(), v.pipe(v.number(), v.minValue(0))),
});

export const model = { metadata: { score: 5 } };

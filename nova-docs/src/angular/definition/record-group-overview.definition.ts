import * as v from 'valibot';

export const schema = v.object({
  metadata: v.record(v.string(), v.string()),
});

export const model = { metadata: { department: '研发部', level: 'P7' } };

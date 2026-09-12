import * as v from 'valibot';

export const schema = v.object({
  name: v.pipe(v.string()),
  email: v.optional(v.string()),
});

export const model = { name: '张三', email: 'a@b.com' };

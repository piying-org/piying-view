import * as v from 'valibot';

export const schema = v.object({
  name: v.pipe(v.string(), v.minLength(2, '名称至少 2 个字符')),
  age: v.pipe(v.number(), v.minValue(18, '必须年满 18 岁')),
  email: v.optional(v.string()),
});

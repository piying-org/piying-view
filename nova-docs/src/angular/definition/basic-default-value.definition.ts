import * as v from 'valibot';

export const schema = v.object({
  name: v.optional(v.string(), '默认名称'),
});

export const model = { name: '默认名称' };

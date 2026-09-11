import * as v from 'valibot';

export const schema = v.object({
  user: v.object({
    name: v.string(),
    address: v.object({
      city: v.string(),
      street: v.string(),
    }),
  }),
});

export const model = {
  user: { name: '张三', address: { city: '北京', street: '长安街' } },
};

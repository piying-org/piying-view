import * as v from 'valibot';

export const schema = v.object({
  address: v.object({
    city: v.string(),
    street: v.string(),
  }),
});

export const model = { address: { city: '上海', street: '南京路' } };

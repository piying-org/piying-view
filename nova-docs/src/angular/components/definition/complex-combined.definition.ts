import * as v from 'valibot';
import { formConfig, layout } from '@piying/view-angular-core';

export const schema = v.object({
  name: v.string(),

  address: v.object({
    city: v.string(),
    details: v.object({
      street: v.string(),
      zipCode: v.string(),
    }),
  }),

  positions: v.array(v.tuple([v.number(), v.number()])),

  metadata: v.record(v.string(), v.string()),

  profile: v.intersect([
    v.pipe(v.object({ bio: v.string() }), layout({ priority: 1 })),
    v.pipe(v.object({ website: v.string() }), layout({ priority: 2 })),
  ]),

  identifier: v.union([v.string(), v.number()]),
});

export const model = {
  name: '',
  address: { city: '', details: { street: '', zipCode: '' } },
  positions: [[1, 2]],
  metadata: {},
  profile: { bio: '', website: '' },
  identifier: 'x',
};

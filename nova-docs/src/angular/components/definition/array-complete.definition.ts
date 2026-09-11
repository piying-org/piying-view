import * as v from 'valibot';
import { formConfig, setComponent } from '@piying/view-angular-core';

export const schema = v.object({
  tags: v.pipe(v.array(v.string()), formConfig({ deletionMode: 'mark' })),
  scores: v.pipe(v.optional(v.array(v.number()), [0, 0])),
  position: v.tuple([v.number(), v.number()]),
  coordinates: v.pipe(
    v.tupleWithRest([v.string()], v.number()),
    setComponent('array'),
  ),
  groups: v.pipe(v.array(v.looseObject({ name: v.string() }))),
});

export const model = {
  tags: ['a', 'b'],
  scores: [0, 0],
  position: [1, 2],
  coordinates: ['v1', 3],
  groups: [{ name: '张三' }],
};

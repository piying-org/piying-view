import * as v from 'valibot';
import { setComponent } from '@piying/view-angular-core';

export const schema = v.pipe(
  v.tupleWithRest([v.string()], v.number()),
  setComponent('array'),
);

export const model = ['v1', 0, 1];

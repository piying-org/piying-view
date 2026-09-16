import * as v from 'valibot';
import { convertToField } from '@piying/view-vue2-legacy';

export const Schema = v.object({
  text1: v.optional(v.string()),
  number1: v.number(),
});

export const makeField = () => convertToField(() => Schema);

export type TestField = ReturnType<typeof makeField>;

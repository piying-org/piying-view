import {
  ArraySchema,
  BooleanSchema,
  IntersectSchema,
  LooseObjectSchema,
  LooseTupleSchema,
  NullSchema,
  NumberSchema,
  ObjectSchema,
  ObjectWithRestSchema,
  PicklistSchema,
  StringSchema,
  TupleWithRestSchema,
  UnionSchema,
} from 'valibot';
export type TypeMap = {
  object: ObjectSchema<any, any>;
  loose_object: LooseObjectSchema<any, any>;
  object_with_rest: ObjectWithRestSchema<any, any, any>;
  loose_tuple: LooseTupleSchema<any, any>;
  tuple_with_rest: TupleWithRestSchema<any, any, any>;
  string: StringSchema<any>;
  number: NumberSchema<any>;
  boolean: BooleanSchema<any>;
  null: NullSchema<undefined>;
  intersect: IntersectSchema<any, any>;
  union: UnionSchema<any, any>;
  picklist: PicklistSchema<any, any>;
  array: ArraySchema<any, any>;
};
export function assertType<T extends keyof TypeMap>(
  input: any,
  key: T,
): TypeMap[T] {
  if (input.type === key) {
    return input;
  }
  if (input.type === 'optional' || input.type === 'nullable') {
    return assertType(input.wrapped, key);
  }
  if (input.type === 'lazy') {
    return assertType(input.getter(), key);
  }

  throw new Error(`${input.type}!=${key}`);
}

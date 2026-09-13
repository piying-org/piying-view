import * as v from 'valibot';

import {
  EntriesOf,
  ItemOf,
  ItemsOf,
  OptionsOf,
  PipeOf,
  RecordValueOf,
  RestOf,
  WrappedOf,
} from '../../builder-base/type/valibot-shape';

type Assert<T extends true> = T;
type Eq<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false;
type IsNever<T> = [T] extends [never] ? true : false;

/** 提取结果的值类型是否等于期望 */
type OutOf<T> = T extends v.BaseSchema<any, infer O, any> ? O : never;

describe('valibot 结构适配层提取', () => {
  it('EntriesOf: object 族 4 个变体全部可提取', () => {
    const o = v.object({ a: v.string() });
    const lo = v.looseObject({ a: v.string() });
    const st = v.strictObject({ a: v.string() });
    const wr = v.objectWithRest({ a: v.string() }, v.number());
    type _1 = Assert<Eq<OutOf<EntriesOf<typeof o>['a']>, string>>;
    type _2 = Assert<Eq<OutOf<EntriesOf<typeof lo>['a']>, string>>;
    type _3 = Assert<Eq<OutOf<EntriesOf<typeof st>['a']>, string>>;
    type _4 = Assert<Eq<OutOf<EntriesOf<typeof wr>['a']>, string>>;
    expect(1).toBe(1);
  });

  it('ItemOf: array 可提取, 非 array 为 never', () => {
    const arr = v.array(v.string());
    type _1 = Assert<Eq<OutOf<ItemOf<typeof arr>>, string>>;
    type _2 = Assert<Eq<IsNever<ItemOf<v.ObjectSchema<any, any>>>, true>>;
    expect(1).toBe(1);
  });

  it('ItemsOf: tuple 族 4 个变体全部可提取', () => {
    const t = v.tuple([v.string(), v.number()]);
    const lt = v.looseTuple([v.string(), v.number()]);
    const st = v.strictTuple([v.string(), v.number()]);
    const twr = v.tupleWithRest([v.string()], v.number());
    type _1 = Assert<Eq<OutOf<ItemsOf<typeof t>[1]>, number>>;
    type _2 = Assert<Eq<OutOf<ItemsOf<typeof lt>[1]>, number>>;
    type _3 = Assert<Eq<OutOf<ItemsOf<typeof st>[1]>, number>>;
    type _4 = Assert<Eq<OutOf<ItemsOf<typeof twr>[0]>, string>>;
    expect(1).toBe(1);
  });

  it('OptionsOf: intersect / union 可提取', () => {
    const i = v.intersect([v.object({ a: v.string() })]);
    const u = v.union([v.string(), v.number()]);
    type _1 = Assert<Eq<OutOf<EntriesOf<OptionsOf<typeof i>[0]>['a']>, string>>;
    type _2 = Assert<Eq<OutOf<OptionsOf<typeof u>[1]>, number>>;
    expect(1).toBe(1);
  });

  it('RecordValueOf: record 可提取', () => {
    const r = v.record(v.string(), v.boolean());
    type _1 = Assert<Eq<OutOf<RecordValueOf<typeof r>>, boolean>>;
    expect(1).toBe(1);
  });

  it('RestOf: objectWithRest / tupleWithRest 可提取, 无 rest 为 never', () => {
    const owr = v.objectWithRest({ a: v.string() }, v.number());
    const twr = v.tupleWithRest([v.string()], v.boolean());
    const plain = v.object({ a: v.string() });
    type _1 = Assert<Eq<OutOf<RestOf<typeof owr>>, number>>;
    type _2 = Assert<Eq<OutOf<RestOf<typeof twr>>, boolean>>;
    type _3 = Assert<Eq<IsNever<RestOf<typeof plain>>, true>>;
    expect(1).toBe(1);
  });

  it('WrappedOf: optional / nullable / nullish 可穿透', () => {
    const opt = v.optional(v.string());
    const nul = v.nullable(v.number());
    const nulsh = v.nullish(v.boolean());
    type _1 = Assert<Eq<OutOf<WrappedOf<typeof opt>>, string>>;
    type _2 = Assert<Eq<OutOf<WrappedOf<typeof nul>>, number>>;
    type _3 = Assert<Eq<OutOf<WrappedOf<typeof nulsh>>, boolean>>;
    expect(1).toBe(1);
  });

  it('PipeOf: pipe 首项可提取', () => {
    const p = v.pipe(
      v.object({ a: v.string() }),
      v.custom(() => true),
    );
    type _1 = Assert<Eq<OutOf<EntriesOf<PipeOf<typeof p>[0]>['a']>, string>>;
    expect(1).toBe(1);
  });

  it('嵌套: optional(pipe(object)) 可穿透取 entries', () => {
    const s = v.optional(
      v.pipe(
        v.object({ a: v.string() }),
        v.custom(() => true),
      ),
    );
    type Inner = WrappedOf<typeof s>;
    type _1 = Assert<Eq<OutOf<EntriesOf<PipeOf<Inner>[0]>['a']>, string>>;
    expect(1).toBe(1);
  });
});

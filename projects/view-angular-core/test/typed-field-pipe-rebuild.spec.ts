import * as v from 'valibot';
import { typedFieldPipe } from '@piying/view-angular-core';
import { createBuilder } from './util/create-builder';

type PipeNode = { readonly pipe: readonly unknown[] };

/** 取 pipe 成员列表(非 pipe 节点返回空) */
const pipeOf = (s: unknown): readonly unknown[] =>
  (s as PipeNode | undefined)?.pipe ?? [];

/** 把 pipe(含嵌套 pipe)展开成线性成员列表, 用于断言顺序 */
const flatPipe = (s: unknown): unknown[] =>
  s && typeof s === 'object' && Array.isArray((s as PipeNode).pipe)
    ? (s as PipeNode).pipe.flatMap(flatPipe)
    : [s];

/**
 * intersect / union 的「第 N 个成员」、map / set / record 的「值节点」是 schema 结构路径,
 * 而 PathsOf 基于值类型推导(交叉类型会被合并、Map 无隐式索引签名), 这类路径无法在类型层表达。
 */
const schemaPath = (p: readonly (string | number)[]) => p as never;

describe('typedFieldPipe 容器重建: 覆盖全部 schema 类型', () => {
  it('looseTuple 重建后类型与 message 保留', () => {
    const msg = 'tuple错误';
    const source = v.looseTuple([v.string(), v.number()], msg);
    const merged = typedFieldPipe(source, (d) => [
      d([1], ($) => [$.props.patchAsync({ x: () => 1 })]),
    ]);
    expect(merged.type).toBe('loose_tuple');
    expect(merged.message).toBe(msg);
    expect(merged.items.length).toBe(2);
    expect(flatPipe(merged.items[1]).length).toBe(2);
    expect(v.safeParse(merged, ['a', 1]).success).toBeTrue();
  });

  it('strictTuple 重建后类型与 message 保留', () => {
    const msg = 'strictTuple错误';
    const source = v.strictTuple([v.string(), v.number()], msg);
    const merged = typedFieldPipe(source, (d) => [
      d([0], ($) => [$.props.patchAsync({ x: () => 1 })]),
    ]);
    expect(merged.type).toBe('strict_tuple');
    expect(merged.message).toBe(msg);
    expect(v.safeParse(merged, ['a', 1]).success).toBeTrue();
    expect(v.safeParse(merged, ['a', 1, 'extra']).success).toBeFalse();
  });

  it('tupleWithRest 重建后 rest 保留', () => {
    const msg = 'tupleWithRest错误';
    const source = v.tupleWithRest([v.string()], v.number(), msg);
    const merged = typedFieldPipe(source, (d) => [
      d([0], ($) => [$.props.patchAsync({ x: () => 1 })]),
    ]);
    expect(merged.type).toBe('tuple_with_rest');
    expect(merged.message).toBe(msg);
    expect(merged.rest).toBeDefined();
    expect(v.safeParse(merged, ['a', 1, 2]).success).toBeTrue();
  });

  it('intersect 重建后子项保留', () => {
    const source = v.object({
      a: v.intersect([
        v.object({ foo: v.string() }),
        v.object({ bar: v.number() }),
      ]),
    });
    const merged = typedFieldPipe(source, (d) => [
      d(schemaPath(['a', 0]), ($) => [$.props.patchAsync({ x: () => 1 })]),
    ]);
    expect(merged.entries.a.type).toBe('intersect');
    expect(merged.entries.a.options.length).toBe(2);
    expect(flatPipe(merged.entries.a.options[0]).length).toBe(2);
    const resolved = createBuilder(merged);
    expect(resolved.get(['a', 0])!.props()['x']).toBe(1);
  });

  it('union 重建后子项保留', () => {
    const source = v.object({ a: v.union([v.string(), v.number()]) });
    const merged = typedFieldPipe(source, (d) => [
      d(schemaPath(['a', 1]), ($) => [$.props.patchAsync({ x: () => 1 })]),
    ]);
    expect(merged.entries.a.type).toBe('union');
    expect(merged.entries.a.options.length).toBe(2);
    expect(v.safeParse(merged, { a: 1 }).success).toBeTrue();
    expect(v.safeParse(merged, { a: 'x' }).success).toBeTrue();
  });

  it('optional 下钻重建后 default 保留', () => {
    const source = v.object({
      a: v.optional(v.object({ b: v.string() }), { b: 'def' }),
    });
    const merged = typedFieldPipe(source, (d) => [
      d(['a', 'b'], ($) => [$.props.patchAsync({ x: () => 1 })]),
    ]);
    expect(merged.entries.a.type).toBe('optional');
    expect(merged.entries.a.default).toEqual({ b: 'def' });
    expect(merged.entries.a.wrapped.type).toBe('object');
    const resolved = createBuilder(merged);
    expect(resolved.get(['a', 'b'])!.props()['x']).toBe(1);
  });

  it('nullable 下钻重建后 default 保留', () => {
    const source = v.object({
      a: v.nullable(v.object({ b: v.string() }), { b: 'n' }),
    });
    const merged = typedFieldPipe(source, (d) => [
      d(['a', 'b'], ($) => [$.props.patchAsync({ x: () => 1 })]),
    ]);
    expect(merged.entries.a.type).toBe('nullable');
    expect(merged.entries.a.default).toEqual({ b: 'n' });
    expect(v.safeParse(merged, { a: null }).success).toBeTrue();
  });

  it('nullish 下钻重建后类型保留', () => {
    const source = v.object({ a: v.nullish(v.object({ b: v.string() })) });
    const merged = typedFieldPipe(source, (d) => [
      d(['a', 'b'], ($) => [$.props.patchAsync({ x: () => 1 })]),
    ]);
    expect(merged.entries.a.type).toBe('nullish');
    expect(v.safeParse(merged, { a: undefined }).success).toBeTrue();
    expect(v.safeParse(merged, { a: null }).success).toBeTrue();
  });

  it('map 值 schema 重建后 key 保留', () => {
    const source = v.map(v.string(), v.object({ b: v.string() }));
    const merged = typedFieldPipe(source, (d) => [
      d(schemaPath(['b']), ($) => [$.props.patchAsync({ x: () => 1 })]),
    ]);
    expect(merged.type).toBe('map');
    expect(merged.key).toBe(source.key);
    expect(merged.value.type).toBe('object');
    expect(v.safeParse(merged, new Map([['k', { b: '1' }]])).success).toBeTrue();
  });

  it('set 值 schema 重建生效', () => {
    const source = v.set(v.object({ b: v.string() }));
    const merged = typedFieldPipe(source, (d) => [
      d(schemaPath(['b']), ($) => [$.props.patchAsync({ x: () => 1 })]),
    ]);
    expect(merged.type).toBe('set');
    expect(v.safeParse(merged, new Set([{ b: '1' }])).success).toBeTrue();
  });

  it('单成员 pipe 合并后不再多包一层空 pipe', () => {
    const single = v.pipe(v.string());
    const merged = typedFieldPipe(single, (d) => [
      d([], ($) => [$.props.patchAsync({ x: () => 1 })]),
    ]);
    expect(flatPipe(merged).length).toBe(2);
    // 原 pipe 节点整体保留, 没被拆散重包
    expect(pipeOf(merged).length).toBe(2);
    expect(pipeOf(merged)[0]).toBe(single);
  });
});

describe('typedFieldPipe 兑底报错与空值兜底', () => {
  it('空 actions 时不往 schema 上叠加任何 pipe', () => {
    const source = v.object({ a: v.string() });
    const merged = typedFieldPipe(source, (d) => [d(['a'], () => [])]);
    // 容器会被重建(无法原地修改), 但子节点保持原引用, 没被多包一层 pipe
    expect(merged).not.toBe(source);
    expect(merged.entries.a).toBe(source.entries.a);
    expect(v.safeParse(merged, { a: 'x' }).success).toBeTrue();
  });

  it('define 回调返回 undefined 时按空数组处理', () => {
    const source = v.object({ a: v.string() });
    // 类型层要求返回数组, 运行时对 undefined 做了兜底
    const emptyFn = (() => undefined) as unknown as () => readonly unknown[];
    const merged = typedFieldPipe(source, (d) => [d(['a'], emptyFn)]);
    expect(merged.entries.a).toBe(source.entries.a);
    expect(v.safeParse(merged, { a: 'x' }).success).toBeTrue();
  });

  it('cb 返回 undefined 时按空数组处理', () => {
    const source = v.object({ a: v.string() });
    const emptyCb = (() => undefined) as unknown as () => readonly never[];
    expect(typedFieldPipe(source, emptyCb)).toBe(source);
  });

  it('object 中不存在的 key 会报错', () => {
    const source = v.object({ a: v.string() });
    expect(() =>
      typedFieldPipe(source, (d) => [
        // @ts-expect-error 'nope' 不是该 schema 的合法路径
        d(['nope'], ($) => [$.props.patch({ x: 1 })]),
      ]),
    ).toThrowMatching((e: Error) => e.message.includes('不存在 key: nope'));
  });

  it('tuple 下标越界会报错', () => {
    const source = v.tuple([v.string()]);
    expect(() =>
      typedFieldPipe(source, (d) => [
        d([5], ($) => [$.props.patch({ x: 1 })]),
      ]),
    ).toThrowMatching((e: Error) => e.message.includes('tuple 下标越界: 5'));
  });

  it('intersect 下标越界会报错', () => {
    const source = v.intersect([v.object({ a: v.string() })]);
    expect(() =>
      typedFieldPipe(source, (d) => [
        d(schemaPath([3]), ($) => [$.props.patch({ x: 1 })]),
      ]),
    ).toThrowMatching((e: Error) =>
      e.message.includes('intersect/union 下标越界: 3'),
    );
  });

  it('union 下标越界会报错', () => {
    const source = v.union([v.string(), v.number()]);
    expect(() =>
      typedFieldPipe(source, (d) => [
        d(schemaPath([9]), ($) => [$.props.patch({ x: 1 })]),
      ]),
    ).toThrowMatching((e: Error) =>
      e.message.includes('intersect/union 下标越界: 9'),
    );
  });
});

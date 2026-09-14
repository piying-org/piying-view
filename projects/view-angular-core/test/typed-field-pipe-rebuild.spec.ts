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
 * intersect / union 的「第 N 个成员」、map / set / record 的「值节点」都是 schema 结构路径,
 * `PathsOf` 直接按 schema 结构展开, 这类路径可以直接写出来。
 */

describe('typedFieldPipe 容器重建: 覆盖全部 schema 类型', () => {
  it('looseTuple 重建后类型与 message 保留', () => {
    const msg = 'tuple错误';
    const source = v.looseTuple([v.string(), v.number()], msg);
    const merged = typedFieldPipe(source, (d) => [
      d([1], [d.props.patchAsync({ x: () => 1 })]),
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
      d([0], [d.props.patchAsync({ x: () => 1 })]),
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
      d([0], [d.props.patchAsync({ x: () => 1 })]),
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
      d(['a', 0], [d.props.patchAsync({ x: () => 1 })]),
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
      d(['a', 1], [d.props.patchAsync({ x: () => 1 })]),
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
      d(['a', 'b'], [d.props.patchAsync({ x: () => 1 })]),
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
      d(['a', 'b'], [d.props.patchAsync({ x: () => 1 })]),
    ]);
    expect(merged.entries.a.type).toBe('nullable');
    expect(merged.entries.a.default).toEqual({ b: 'n' });
    expect(v.safeParse(merged, { a: null }).success).toBeTrue();
  });

  it('nullish 下钻重建后类型保留', () => {
    const source = v.object({ a: v.nullish(v.object({ b: v.string() })) });
    const merged = typedFieldPipe(source, (d) => [
      d(['a', 'b'], [d.props.patchAsync({ x: () => 1 })]),
    ]);
    expect(merged.entries.a.type).toBe('nullish');
    expect(v.safeParse(merged, { a: undefined }).success).toBeTrue();
    expect(v.safeParse(merged, { a: null }).success).toBeTrue();
  });

  it('map 值 schema 重建后 key 保留', () => {
    const source = v.map(v.string(), v.object({ b: v.string() }));
    const merged = typedFieldPipe(source, (d) => [
      d(['[value]', 'b'], [d.props.patchAsync({ x: () => 1 })]),
    ]);
    expect(merged.type).toBe('map');
    expect(merged.key).toBe(source.key);
    expect(merged.value.type).toBe('object');
    expect(
      v.safeParse(merged, new Map([['k', { b: '1' }]])).success,
    ).toBeTrue();
  });

  it('set 值 schema 重建生效', () => {
    const source = v.set(v.object({ b: v.string() }));
    const merged = typedFieldPipe(source, (d) => [
      d(['[value]', 'b'], [d.props.patchAsync({ x: () => 1 })]),
    ]);
    expect(merged.type).toBe('set');
    expect(v.safeParse(merged, new Set([{ b: '1' }])).success).toBeTrue();
  });

  it('variant 重建后 key / options 保留, 校验仍生效', () => {
    const source = v.object({
      v: v.variant('kind', [
        v.object({ kind: v.literal('a'), x: v.string() }),
        v.object({ kind: v.literal('b'), y: v.number() }),
      ]),
    });
    const merged = typedFieldPipe(source, (d) => [
      d(['v', 0, 'x'], [d.props.patchAsync({ p: () => 1 })]),
    ]);
    expect(merged.entries.v.type).toBe('variant');
    expect(merged.entries.v.key).toBe('kind');
    expect(merged.entries.v.options.length).toBe(2);
    // 下钻目标是 options[0].entries.x, 所以只有 x 被包了一层 pipe
    expect(flatPipe(merged.entries.v.options[0].entries.x).length).toBe(2);
    expect(flatPipe(merged.entries.v.options[1].entries.y).length).toBe(1);
    expect(
      v.safeParse(merged, { v: { kind: 'a', x: '1' } }).success,
    ).toBeTrue();
    expect(v.safeParse(merged, { v: { kind: 'b', y: 1 } }).success).toBeTrue();
    expect(v.safeParse(merged, { v: { kind: 'c' } }).success).toBeFalse();
    const resolved = createBuilder(merged);
    expect(resolved.get(['v', 0, 'x'])!.props()['p']).toBe(1);
  });

  it('exactOptional 下钻重建后 default 保留', () => {
    const source = v.object({
      a: v.exactOptional(v.object({ b: v.string() }), { b: 'def' }),
    });
    const merged = typedFieldPipe(source, (d) => [
      d(['a', 'b'], [d.props.patchAsync({ p: () => 1 })]),
    ]);
    expect(merged.entries.a.type).toBe('exact_optional');
    expect(merged.entries.a.default).toEqual({ b: 'def' });
    expect(merged.entries.a.wrapped.type).toBe('object');
    const resolved = createBuilder(merged);
    expect(resolved.get(['a', 'b'])!.props()['p']).toBe(1);
  });

  it('undefinedable 下钻重建后 default 保留', () => {
    const source = v.object({
      a: v.undefinedable(v.object({ b: v.string() }), { b: 'def' }),
    });
    const merged = typedFieldPipe(source, (d) => [
      d(['a', 'b'], [d.props.patchAsync({ p: () => 1 })]),
    ]);
    expect(merged.entries.a.type).toBe('undefinedable');
    expect(merged.entries.a.default).toEqual({ b: 'def' });
    expect(v.safeParse(merged, { a: undefined }).success).toBeTrue();
    const resolved = createBuilder(merged);
    expect(resolved.get(['a', 'b'])!.props()['p']).toBe(1);
  });

  it('nonNullable 下钻重建后 message 保留', () => {
    const msg = '包装错了';
    const source = v.object({
      a: v.nonNullable(v.object({ b: v.string() }), msg),
    });
    const merged = typedFieldPipe(source, (d) => [
      d(['a', 'b'], [d.props.patchAsync({ p: () => 1 })]),
    ]);
    expect(merged.entries.a.type).toBe('non_nullable');
    expect(merged.entries.a.message).toBe(msg);
    expect(v.safeParse(merged, { a: null }).success).toBeFalse();
    const resolved = createBuilder(merged);
    expect(resolved.get(['a', 'b'])!.props()['p']).toBe(1);
  });

  it('nonNullish 下钻重建后 message 保留', () => {
    const msg = '包装错了';
    const source = v.object({
      a: v.nonNullish(v.object({ b: v.string() }), msg),
    });
    const merged = typedFieldPipe(source, (d) => [
      d(['a', 'b'], [d.props.patchAsync({ p: () => 1 })]),
    ]);
    expect(merged.entries.a.type).toBe('non_nullish');
    expect(merged.entries.a.message).toBe(msg);
    expect(v.safeParse(merged, { a: null }).success).toBeFalse();
    expect(v.safeParse(merged, { a: undefined }).success).toBeFalse();
    const resolved = createBuilder(merged);
    expect(resolved.get(['a', 'b'])!.props()['p']).toBe(1);
  });

  it('nonOptional 下钻重建后 message 保留', () => {
    const msg = '包装错了';
    const source = v.object({
      a: v.nonOptional(v.object({ b: v.string() }), msg),
    });
    const merged = typedFieldPipe(source, (d) => [
      d(['a', 'b'], [d.props.patchAsync({ p: () => 1 })]),
    ]);
    expect(merged.entries.a.type).toBe('non_optional');
    expect(merged.entries.a.message).toBe(msg);
    expect(v.safeParse(merged, { a: undefined }).success).toBeFalse();
    const resolved = createBuilder(merged);
    expect(resolved.get(['a', 'b'])!.props()['p']).toBe(1);
  });

  it('wrapped 家族多层叠加下钻', () => {
    const source = v.object({
      a: v.nonNullish(v.exactOptional(v.object({ b: v.string() }))),
    });
    const merged = typedFieldPipe(source, (d) => [
      d(['a', 'b'], [d.props.patchAsync({ p: () => 1 })]),
    ]);
    expect(merged.entries.a.type).toBe('non_nullish');
    expect(merged.entries.a.wrapped.type).toBe('exact_optional');
    const resolved = createBuilder(merged);
    expect(resolved.get(['a', 'b'])!.props()['p']).toBe(1);
  });

  it('单成员 pipe 合并后不再多包一层空 pipe', () => {
    const single = v.pipe(v.string());
    const merged = typedFieldPipe(single, (d) => [
      d([], [d.props.patchAsync({ x: () => 1 })]),
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
    const merged = typedFieldPipe(source, (d) => [d(['a'], [])]);
    // 容器会被重建(无法原地修改), 但子节点保持原引用, 没被多包一层 pipe
    expect(merged).not.toBe(source);
    expect(merged.entries.a).toBe(source.entries.a);
    expect(v.safeParse(merged, { a: 'x' }).success).toBeTrue();
  });

  it('actions 传 undefined 时按空数组处理', () => {
    const source = v.object({ a: v.string() });
    // 类型层要求数组, 运行时对 undefined 做了兜底
    const merged = typedFieldPipe(source, (d) => [d(['a'], undefined as any)]);
    expect(merged.entries.a).toBe(source.entries.a);
    expect(v.safeParse(merged, { a: 'x' }).success).toBeTrue();
  });

  it('cb 返回 undefined 时按空数组处理', () => {
    const source = v.object({ a: v.string() });
    const emptyCb = (() => undefined) as unknown as () => readonly never[];
    expect(typedFieldPipe(source, emptyCb)).toBe(source);
  });

  it('fallback 节点下钻会报错(重建会静默丢 fallback)', () => {
    const source = v.object({
      f: v.fallback(v.object({ a: v.string() }), { a: 'def' }),
    });
    expect(() =>
      typedFieldPipe(source, (d) => [
        // @ts-expect-error fallback 节点不参与下钻
        d(['f', 'a'], [d.props.patch({ x: 1 })]),
      ]),
    ).toThrowMatching((e: Error) => e.message.includes('fallback'));
  });

  it('cache 节点下钻会报错(重建会静默丢 cache)', () => {
    const source = v.object({
      c: v.cache(v.object({ a: v.string() }), {} as never),
    });
    expect(() =>
      typedFieldPipe(source, (d) => [
        // @ts-expect-error cache 节点不参与下钻
        d(['c', 'a'], [d.props.patch({ x: 1 })]),
      ]),
    ).toThrowMatching((e: Error) => e.message.includes('cache'));
  });

  it('fallback / cache 节点自身仍是合法终点, 属性不丢', () => {
    const source = v.object({
      f: v.fallback(v.object({ a: v.string() }), { a: 'def' }),
      c: v.cache(v.object({ a: v.string() }), {} as never),
    });
    const merged = typedFieldPipe(source, (d) => [
      d(['f'], [d.props.patchAsync({ x: () => 1 })]),
      d(['c'], [d.props.patchAsync({ y: () => 2 })]),
    ]);
    expect('fallback' in merged.entries.f).toBeTrue();
    expect('cache' in merged.entries.c).toBeTrue();
    const resolved = createBuilder(merged);
    expect(resolved.get(['f'])!.props()['x']).toBe(1);
    expect(resolved.get(['c'])!.props()['y']).toBe(2);
  });

  it('长 wrapped / pipe 链不会把合法路径限深砍掉', () => {
    // 5 层 wrapped + 2 层 pipe = 7 跳, 旧的 6 格预算会在 exactOptional 处砍掉这条路径
    const leaf = v.object({ b: v.string() });
    const l1 = v.exactOptional(leaf);
    const l2 = v.pipe(l1, v.metadata({}));
    const l3 = v.optional(l2);
    const l4 = v.nullish(l3);
    const l5 = v.nullable(l4);
    const l6 = v.pipe(l5, v.metadata({}));
    const source = v.object({ a: v.optional(l6) });

    const merged = typedFieldPipe(source, (d) => [
      d(['a', 'b'], [d.props.patchAsync({ p: () => 1 })]),
    ]);
    const resolved = createBuilder(merged);
    expect(resolved.get(['a', 'b'])!.props()['p']).toBe(1);
  });

  it('object 中不存在的 key 会报错', () => {
    const source = v.object({ a: v.string() });
    expect(() =>
      typedFieldPipe(source, (d) => [
        // @ts-expect-error 'nope' 不是该 schema 的合法路径
        d(['nope'], [d.props.patch({ x: 1 })]),
      ]),
    ).toThrowMatching((e: Error) => e.message.includes('不存在 key: nope'));
  });

  it('tuple 下标越界会报错', () => {
    const source = v.tuple([v.string()]);
    expect(() =>
      typedFieldPipe(source, (d) => [
        // @ts-expect-error 只有下标 0, 越界在编译期就被拦下
        d([5], [d.props.patch({ x: 1 })]),
      ]),
    ).toThrowMatching((e: Error) => e.message.includes('tuple 下标越界: 5'));
  });

  it('intersect 下标越界会报错', () => {
    const source = v.intersect([v.object({ a: v.string() })]);
    expect(() =>
      typedFieldPipe(source, (d) => [
        // @ts-expect-error 只有下标 0, 越界在编译期就被拦下
        d([3], [d.props.patch({ x: 1 })]),
      ]),
    ).toThrowMatching((e: Error) =>
      e.message.includes('intersect/union 下标越界: 3'),
    );
  });

  it('union 下标越界会报错', () => {
    const source = v.union([v.string(), v.number()]);
    expect(() =>
      typedFieldPipe(source, (d) => [
        // @ts-expect-error 只有下标 0 / 1, 越界在编译期就被拦下
        d([9], [d.props.patch({ x: 1 })]),
      ]),
    ).toThrowMatching((e: Error) =>
      e.message.includes('intersect/union 下标越界: 9'),
    );
  });
});

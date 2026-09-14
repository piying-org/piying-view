import * as v from 'valibot';
import { setAlias, typedFieldPipe } from '@piying/view-angular-core';
import { createBuilder } from '../util/create-builder';
import { Equal, Val } from '../util/type-assert';

const root = v.object({
  a: v.string(),
  b: v.number(),
  list: v.array(
    v.object({ c: v.number(), s: v.pipe(v.string(), setAlias('ss')) }),
  ),
});
type RootT = {
  a: string;
  b: number;
  list: { c: number; s: string }[];
};

describe('typedFieldPipe 精确写法(schema 实参 + 路径合并 actions)', () => {
  it('类型: 回调 field 与 builder.get(path) 完全等价', () => {
    const builder = createBuilder(root);
    const gA = builder.get(['a'])!;
    const gC = builder.get(['list', 0, 'c'])!;
    let count = 0;

    const merged = typedFieldPipe(root, (d) => [
      d(
        ['a'],
        [
          d.props.patchAsync({
            tp: (field) => {
              const eq: Equal<typeof field, typeof gA> = true;
              expect(eq).toBe(true);
              expect(field.fullPath).toEqual(['a']);
              count++;
              return 1;
            },
          }),
        ],
      ),
      d(
        ['list', 0, 'c'],
        [
          d.props.patchAsync({
            tp: (field) => {
              const eq: Equal<typeof field, typeof gC> = true;
              expect(eq).toBe(true);
              expect(field.fullPath).toEqual(['list', 0, 'c']);
              count++;
              return 1;
            },
          }),
        ],
      ),
    ]);

    const resolved = createBuilder(merged);
    resolved.form.control?.updateValue({
      a: 'x',
      b: 1,
      list: [{ c: 1, s: 'y' }],
    });

    expect(count).toBe(2);

    expect(resolved.get(['a'])!.props()['tp']).toBe(1);
    expect(resolved.get(['list', 0, 'c'])!.props()['tp']).toBe(1);
  });

  it('类型: 自身 / 父级 / 根级 / 别名 全部强类型', () => {
    let count = 0;

    const merged = typedFieldPipe(root, (d) => [
      d(
        ['list', 0, 'c'],
        [
          d.props.patchAsync({
            tp: (field) => {
              const self: Equal<Val<typeof field.form.control>, number> = true;

              const up = field.get(['..'])!;
              const upV: Equal<
                Val<typeof up.form.control>,
                { c: number; s: string }
              > = true;

              const rootF = field.get(['#'])!;
              const rootV: Equal<Val<typeof rootF.form.control>, RootT> = true;

              const alias = field.get(['@ss'])!;
              const aliasV: Equal<
                Val<typeof alias.form.control>,
                string
              > = true;

              // @ts-expect-error 自身是 number, 不是 string
              const wrong: string = field.form.control!.value;

              expect(self).toBe(true);
              expect(upV).toBe(true);
              expect(rootV).toBe(true);
              expect(aliasV).toBe(true);
              expect(up.fullPath).toEqual(['list', 0]);
              expect(rootF.fullPath).toEqual([]);
              expect(alias.fullPath).toEqual(['list', 0, 's']);
              count++;
              return 1;
            },
          }),
        ],
      ),
    ]);

    const resolved = createBuilder(merged);
    resolved.form.control?.updateValue({
      a: 'x',
      b: 1,
      list: [{ c: 1, s: 'y' }],
    });

    // 上面那些断言全在回调里, 靠这个确认它们真的跑了
    expect(count).toBe(1);
    expect(resolved.get(['list', 0, 'c'])!.props()['tp']).toBe(1);
  });

  it('运行时: actions 真的被合并进 schema(含 root 级)', () => {
    const merged = typedFieldPipe(root, (d) => [
      d([], [d.props.patchAsync({ rootProp: () => 'ROOT' })]),
      d(['a'], [d.props.patchAsync({ aProp: () => 'A' })]),
      d(['b'], [d.props.patchAsync({ bProp: () => 'B' })]),
    ]);
    const resolved = createBuilder(merged);
    expect(resolved.props()['rootProp']).toBe('ROOT');
    expect(resolved.get(['a'])!.props()['aProp']).toBe('A');
    expect(resolved.get(['b'])!.props()['bProp']).toBe('B');
  });

  it('运行时: 原 schema 不被修改', () => {
    const merged = typedFieldPipe(root, (d) => [
      d(['a'], [d.props.patchAsync({ aProp: () => 'A' })]),
    ]);
    const orig = createBuilder(root);
    expect(orig.get(['a'])!.props()['aProp']).toBeUndefined();
    expect(merged).not.toBe(root);
  });

  it('运行时: 同一路径多条 entry / 同一工厂多次调用, 全部叠加生效', () => {
    const merged = typedFieldPipe(root, (d) => [
      d(['a'], [d.props.patchAsync({ x: () => 1 })]),
      d(['a'], [d.props.patchAsync({ y: () => 2 })]),
      d(
        ['a'],
        [
          d.props.patchAsync({ z: () => 3 }),
          d.props.patchAsync({ w: () => 4 }),
        ],
      ),
    ]);
    const resolved = createBuilder(merged);
    expect(resolved.get(['a'])!.props()).toEqual({ x: 1, y: 2, z: 3, w: 4 });
  });

  it('运行时: 数组元素路径合并', () => {
    const merged = typedFieldPipe(root, (d) => [
      d(['list', 0, 'c'], [d.props.patchAsync({ tag: () => 'CTAG' })]),
    ]);
    const resolved = createBuilder(merged);
    resolved.form.control?.updateValue({ list: [{ c: 1, s: 'x' }] });
    expect(resolved.get(['list', 0, 'c'])!.props()['tag']).toBe('CTAG');
  });

  it('运行时: 节点上原有的 pipe action 不被丢弃', () => {
    const withPipe = v.object({
      a: v.pipe(v.string(), setAlias('aa')),
    });
    const merged = typedFieldPipe(withPipe, (d) => [
      d(['a'], [d.props.patchAsync({ p: () => 1 })]),
    ]);
    const resolved = createBuilder(merged);
    // 原有 setAlias 仍在
    expect(resolved.get(['@aa'])!.keyPath).toEqual(['a']);
    // 新 action 也生效
    expect(resolved.get(['a'])!.props()['p']).toBe(1);
  });

  it('覆盖其他 action 族: inputs / hooks / mapAsync', () => {
    const merged = typedFieldPipe(root, (d) => [
      d(
        ['a'],
        [
          d.inputs.patchAsync({ i: () => 'I' }),
          d.props.mapAsync((f) => () => ({ m: f.form.control!.value })),
        ],
      ),
    ]);
    const resolved = createBuilder(merged);
    expect(resolved.get(['a'])!.inputs()['i']).toBe('I');
    expect(resolved.get(['a'])!.props()['m']).toBeUndefined();
  });

  it('类型: hooks 回调里的 field 与 builder.get(path) 完全等价', () => {
    const builder = createBuilder(root);
    const gB = builder.get(['b'])!;
    const gC = builder.get(['list', 0, 'c'])!;
    const calls: string[] = [];

    const merged = typedFieldPipe(root, (d) => [
      d(
        ['b'],
        [
          d.hooks.merge({
            allFieldsResolved: (field) => {
              const eq: Equal<typeof field, typeof gB> = true;
              const selfV: Equal<Val<typeof field.form.control>, number> = true;
              expect([eq, selfV]).toEqual([true, true]);
              expect(field.fullPath).toEqual(['b']);
              calls.push('b:all');
            },
            fieldResolved: (field) => {
              const eq: Equal<typeof field, typeof gB> = true;
              expect(eq).toBe(true);
              calls.push('b:resolved');
            },
          }),
        ],
      ),
      d(
        ['list', 0, 'c'],
        [
          d.hooks.patch({
            allFieldsResolved: (field) => {
              const eq: Equal<typeof field, typeof gC> = true;

              const up = field.get(['..'])!;
              const upV: Equal<
                Val<typeof up.form.control>,
                { c: number; s: string }
              > = true;

              const rootF = field.get(['#'])!;
              const rootV: Equal<Val<typeof rootF.form.control>, RootT> = true;

              const alias = field.get(['@ss'])!;
              const aliasV: Equal<
                Val<typeof alias.form.control>,
                string
              > = true;

              // @ts-expect-error 自身是 number, 不是 string
              const wrong: string = field.form.control!.value;

              expect([eq, upV, rootV, aliasV]).toEqual([
                true,
                true,
                true,
                true,
              ]);
              calls.push('c:all');
            },
          }),
        ],
      ),
    ]);

    const resolved = createBuilder(merged);
    resolved.form.control?.updateValue({
      a: 'x',
      b: 1,
      list: [{ c: 1, s: 'y' }],
    });

    expect(calls).toEqual(['b:resolved', 'b:all', 'c:all']);
  });
});

describe('typedFieldPipe 合并语义: 字段顺序与 pipe 嵌套', () => {
  /** 把 pipe(含嵌套 pipe)展开成线性成员列表, 用于断言顺序 */
  const flatPipe = (s: any): any[] => {
    if (Array.isArray(s?.pipe)) return s.pipe.flatMap(flatPipe);
    return [s];
  };

  it('字段声明顺序保持不变(合并顺序不影响字段顺序)', () => {
    const source = v.object({
      a: v.string(),
      b: v.number(),
      c: v.string(),
      d: v.boolean(),
    });
    // 故意逆序声明 entry
    const merged: any = typedFieldPipe(source, (d) => [
      d(['c'], [d.props.patchAsync({ x: () => 1 })]),
      d(['a'], [d.props.patchAsync({ y: () => 2 })]),
      d(['d'], [d.props.patchAsync({ z: () => 3 })]),
    ]);

    expect(Object.keys(merged.entries)).toEqual(['a', 'b', 'c', 'd']);

    const resolved = createBuilder(merged);
    expect(resolved.children!().map((f: any) => f.key)).toEqual([
      'a',
      'b',
      'c',
      'd',
    ]);
    expect(resolved.get(['c'])!.props()['x']).toBe(1);
    expect(resolved.get(['a'])!.props()['y']).toBe(2);
    expect(resolved.get(['d'])!.props()['z']).toBe(3);
  });

  it('嵌套对象 / 数组 / tuple 内部字段顺序保持不变', () => {
    const source = v.object({
      outer: v.object({ a: v.string(), b: v.number(), c: v.string() }),
      list: v.array(v.object({ x: v.string(), y: v.number(), z: v.string() })),
      t: v.tuple([v.string(), v.number(), v.boolean()]),
    });
    const merged: any = typedFieldPipe(source, (d) => [
      d(['outer', 'b'], [d.props.patchAsync({ m: () => 1 })]),
      d(['list', 0, 'y'], [d.props.patchAsync({ m: () => 2 })]),
      d(['t', 1], [d.props.patchAsync({ m: () => 3 })]),
    ]);

    expect(Object.keys(merged.entries)).toEqual(['outer', 'list', 't']);
    expect(Object.keys(merged.entries.outer.entries)).toEqual(['a', 'b', 'c']);
    expect(Object.keys(merged.entries.list.item.entries)).toEqual([
      'x',
      'y',
      'z',
    ]);
    expect(
      merged.entries.t.items.map((i: any) => (i.pipe ? 'merged' : i.type)),
    ).toEqual(['string', 'merged', 'boolean']);
  });

  it('嵌套 pipe(pipe(pipe())) 合并时不被拆散, 原节点原样保留', () => {
    const str = v.string();
    const aa = setAlias('aa');
    const bb = setAlias('bb');
    const cc = setAlias('cc');
    const inner = v.pipe(str, aa);
    const mid = v.pipe(inner, bb);
    const outer = v.pipe(mid, cc);

    const merged: any = typedFieldPipe(v.object({ a: outer }), (d) => [
      d(['a'], [d.props.patchAsync({ x: () => 1 })]),
    ]);

    // 新 action 只加在最外层, 内层三层 pipe 结构原封不动
    expect(merged.entries.a.pipe.length).toBe(2);
    expect(merged.entries.a.pipe[0]).toBe(outer);
    expect(merged.entries.a.pipe[0].pipe[0]).toBe(mid);
    expect(merged.entries.a.pipe[0].pipe[0].pipe[0]).toBe(inner);
    expect(merged.entries.a.pipe[0].pipe[0].pipe[0].pipe[0]).toBe(str);

    // 展开后的 action 顺序 = 声明顺序 + 新 action 在最后
    const list = flatPipe(merged.entries.a);
    expect(list[0]).toBe(str);
    expect(list[1]).toBe(aa);
    expect(list[2]).toBe(bb);
    expect(list[3]).toBe(cc);
    expect(list.length).toBe(5);

    // 原 schema 未被修改
    expect(outer.pipe.length).toBe(2);
    expect(mid.pipe.length).toBe(2);
    expect(inner.pipe.length).toBe(2);
  });

  it('下钻穿过嵌套 pipe 时, 各层 pipe 成员保持原位', () => {
    const obj = v.object({ a: v.string(), b: v.number() });
    const o1 = setAlias('o1');
    const o2 = setAlias('o2');
    const inner = v.pipe(obj, o1);
    const outer = v.pipe(inner, o2);

    const merged: any = typedFieldPipe(outer, (d) => [
      d(['a'], [d.props.patchAsync({ x: () => 1 })]),
    ]);

    expect(merged.pipe[1]).toBe(o2);
    expect(merged.pipe[0].pipe[1]).toBe(o1);
    expect(merged.pipe[0].pipe[0].type).toBe('object');
    expect(Object.keys(merged.pipe[0].pipe[0].entries)).toEqual(['a', 'b']);

    const resolved = createBuilder(v.object({ root: merged }));
    expect(resolved.get(['root', 'a'])!.props()['x']).toBe(1);
  });

  it('loose / strict object 合并后类型与自定义 message 保留', () => {
    const msg = '自定义错误';
    const loose: any = v.looseObject({ a: v.string(), b: v.number() }, msg);
    const strict: any = v.strictObject({ a: v.string(), b: v.number() }, msg);
    const withRest: any = v.objectWithRest(
      { a: v.string(), b: v.number() },
      v.number(),
      msg,
    );

    const build = (s: any) =>
      typedFieldPipe(s, (d) => [
        d(['a'], [d.props.patchAsync({ x: () => 1 })]),
      ]);

    const ml: any = build(loose);
    expect(ml.type).toBe('loose_object');
    expect(ml.message).toBe(msg);
    expect(Object.keys(ml.entries)).toEqual(['a', 'b']);

    const ms: any = build(strict);
    expect(ms.type).toBe('strict_object');
    expect(ms.message).toBe(msg);

    const mr: any = build(withRest);
    expect(mr.type).toBe('object_with_rest');
    expect(mr.message).toBe(msg);
    expect(mr.rest).toBeDefined();
  });

  it('record 值 schema 合并后 key 与顺序保留', () => {
    const source: any = v.record(
      v.string(),
      v.object({ a: v.string(), b: v.number() }),
    );
    const merged: any = typedFieldPipe(source, (d) => [
      d(['b'], [d.props.patchAsync({ x: () => 1 })]),
    ]);
    expect(merged.type).toBe('record');
    expect(merged.key).toBe(source.key);
    expect(Object.keys(merged.value.entries)).toEqual(['a', 'b']);
  });

  it('picklist 的 options 不会被误当成子 schema 下钻', () => {
    const source = v.object({ a: v.picklist(['x', 'y']) });
    // ['a', 0] 是非法路径, 类型层已经拦住了, 这里只验证运行时的兑底报错
    const badPath: any = ['a', 0];
    expect(() =>
      typedFieldPipe(source, (d) => [d(badPath, [d.props.patch({ z: 1 })])]),
    ).toThrowMatching((e: Error) => e.message.includes('无法在类型'));
  });
});

describe('typedFieldPipe 混入 valibot 官方通用 action', () => {
  const fullValue = { a: 'xy', b: 1, list: [{ c: 1, s: 'y' }] };

  it('通用 action 可塞进 actions, 回调拿到该路径的精确 value 类型', () => {
    const merged = typedFieldPipe(root, (d) => [
      d(
        ['a'],
        [
          v.minLength(2),
          v.check((a) => a.length > 1),
          v.transform((s) => s.trim()),
          v.description('说明'),
          d.props.patchAsync({ tag: () => 'A' }),
        ],
      ),
    ]);

    const resolved = createBuilder(merged);
    expect(resolved.get(['a'])!.props()['tag']).toBe('A');
    // 官方 action 真的进了 pipe, 校验真的生效
    expect(v.safeParse(merged, { ...fullValue, a: 'x' }).success).toBeFalse();
    expect(v.safeParse(merged, fullValue).success).toBeTrue();
  });

  it('类型: 数组下标路径的 value 类型同样精确', () => {
    let ran = 0;
    const merged = typedFieldPipe(root, (d) => [
      d(
        ['list', 0, 'c'],
        [
          v.check((c) => {
            const n: number = c;
            ran++;
            return n > 0;
          }),
        ],
      ),
    ]);

    expect(v.safeParse(merged, fullValue).success).toBeTrue();
    expect(ran).toBe(1);
  });

  it('类型: 混排时 field 不会被 value 类型污染', () => {
    const builder = createBuilder(root);
    const gC = builder.get(['list', 0, 'c'])!;
    let ran = 0;

    const merged = typedFieldPipe(root, (d) => [
      d(
        ['list', 0, 'c'],
        [
          v.check((c) => c > 0),
          d.props.patchAsync({
            tp: (field) => {
              const eq: Equal<typeof field, typeof gC> = true;
              ran++;
              expect(eq).toBe(true);
              return 1;
            },
          }),
        ],
      ),
    ]);

    const resolved = createBuilder(merged);
    resolved.form.control?.updateValue({ ...fullValue });
    expect(ran).toBe(1);
  });

  it('类型: 官方 action 回调参数用错类型会报错', () => {
    const typeOnlyChecks = () =>
      typedFieldPipe(root, (d) => [
        d(
          ['a'],
          [
            // @ts-expect-error a 是 string, 不是 number
            v.check((a: number) => a > 1),
          ],
        ),
      ]);
    expect(typeOnlyChecks).toBeDefined();
  });

  it('类型: 塞子 schema 也算通用, 不影响工厂的 field 强类型', () => {
    const builder = createBuilder(root);
    const gA = builder.get(['a'])!;
    let ran = 0;

    const merged = typedFieldPipe(root, (d) => [
      d(
        ['a'],
        [
          v.email(),
          d.props.patchAsync({
            tp: (field) => {
              const eq: Equal<typeof field, typeof gA> = true;
              ran++;
              expect(eq).toBe(true);
              return 1;
            },
          }),
        ],
      ),
    ]);

    const resolved = createBuilder(merged);
    resolved.form.control?.updateValue({ ...fullValue, a: 'a@b.com' });
    expect(ran).toBe(1);
  });
});

describe('typedFieldPipe 结构路径: intersect / union 的下标段', () => {
  const intersectRoot = v.intersect([
    v.object({ a: v.string() }),
    v.object({ b: v.number() }),
  ]);
  const unionRoot = v.union([v.string(), v.object({ c: v.number() })]);

  it('类型: 根级 intersect 的 [0, key] 与 builder.get 完全等价', () => {
    const builder = createBuilder(intersectRoot);
    const gA = builder.get([0, 'a'])!;
    const gB = builder.get([1, 'b'])!;
    let ran = 0;

    const merged = typedFieldPipe(intersectRoot, (d) => [
      d(
        [0, 'a'],
        [
          d.props.patchAsync({
            tp: (field) => {
              const eq: Equal<typeof field, typeof gA> = true;
              expect(eq).toBe(true);
              ran++;
              return 1;
            },
          }),
        ],
      ),
      d(
        [1, 'b'],
        [
          d.props.patchAsync({
            tp: (field) => {
              const eq: Equal<typeof field, typeof gB> = true;
              expect(eq).toBe(true);
              ran++;
              return 1;
            },
          }),
        ],
      ),
    ]);

    const resolved = createBuilder(merged);
    resolved.form.control?.updateValue({ a: 'x', b: 1 });
    expect(ran).toBe(2);
    expect(resolved.get([0, 'a'])!.props()['tp']).toBe(1);
    expect(resolved.get([1, 'b'])!.props()['tp']).toBe(1);
  });

  it('类型: 根级 union 的 [1, key] 与 builder.get 完全等价', () => {
    const builder = createBuilder(unionRoot);
    const gC = builder.get([1, 'c'])!;
    let ran = 0;

    const merged = typedFieldPipe(unionRoot, (d) => [
      d(
        [1, 'c'],
        [
          d.props.patchAsync({
            tp: (field) => {
              const eq: Equal<typeof field, typeof gC> = true;
              expect(eq).toBe(true);
              ran++;
              return 1;
            },
          }),
        ],
      ),
    ]);

    const resolved = createBuilder(merged);
    resolved.form.control?.updateValue({ c: 1 });
    expect(ran).toBe(1);
    expect(resolved.get([1, 'c'])!.props()['tp']).toBe(1);
  });

  it('类型: 特殊段 # / .. / @alias 不在 pipe 的合并路径里', () => {
    const typeOnlyChecks = () =>
      typedFieldPipe(intersectRoot, (d) => [
        // @ts-expect-error pipe 只按结构下钻, 特殊段没有落点
        d(['#', 0, 'a'], [d.props.patch({ tp: 1 })]),
      ]);
    expect(typeOnlyChecks).toBeDefined();
  });
});

describe('typedFieldPipe 结构路径: variant 与 wrapped 家族', () => {
  const variantRoot = v.object({
    sel: v.variant('kind', [
      v.object({ kind: v.literal('a'), x: v.string() }),
      v.object({ kind: v.literal('b'), y: v.number() }),
    ]),
  });

  it('类型: variant 的 [下标, key] 与 builder.get 完全等价', () => {
    const builder = createBuilder(variantRoot);
    const gX = builder.get(['sel', 0, 'x'])!;
    const gY = builder.get(['sel', 1, 'y'])!;
    let ran = 0;

    const merged = typedFieldPipe(variantRoot, (d) => [
      d(
        ['sel', 0, 'x'],
        [
          d.props.patchAsync({
            tp: (field) => {
              const eq: Equal<typeof field, typeof gX> = true;
              expect(eq).toBe(true);
              ran++;
              return 1;
            },
          }),
        ],
      ),
      d(
        ['sel', 1, 'y'],
        [
          d.props.patchAsync({
            tp: (field) => {
              const eq: Equal<typeof field, typeof gY> = true;
              expect(eq).toBe(true);
              ran++;
              return 1;
            },
          }),
        ],
      ),
    ]);

    const resolved = createBuilder(merged);
    expect(resolved.get(['sel', 0, 'x'])!.props()['tp']).toBe(1);
    expect(resolved.get(['sel', 1, 'y'])!.props()['tp']).toBe(1);
    expect(ran).toBe(2);
  });

  it('类型: variant 越界下标编译期报错', () => {
    const typeOnlyChecks = () =>
      typedFieldPipe(variantRoot, (d) => [
        // @ts-expect-error 只有 0 / 1 两个成员
        d(['sel', 2, 'x'], [d.props.patch({ tp: 1 })]),
      ]);
    expect(typeOnlyChecks).toBeDefined();
  });

  it('类型: wrapped 家族下钻后 field 的 value 类型精确', () => {
    const wrappedRoot = v.object({
      eo: v.exactOptional(v.object({ b: v.string() })),
      ud: v.undefinedable(v.object({ n: v.number() })),
      nn: v.nonNullable(v.object({ t: v.boolean() })),
      nnul: v.nonNullish(v.object({ s: v.string() })),
      no: v.nonOptional(v.object({ d: v.date() })),
    });

    const merged = typedFieldPipe(wrappedRoot, (d) => [
      d(
        ['eo', 'b'],
        [
          d.props.patchAsync({
            p: (f) => {
              const s: string = f.form.control!.value;
              return s;
            },
          }),
        ],
      ),
      d(
        ['ud', 'n'],
        [
          d.props.patchAsync({
            p: (f) => {
              const n: number = f.form.control!.value;
              return n;
            },
          }),
        ],
      ),
      d(
        ['nn', 't'],
        [
          d.props.patchAsync({
            p: (f) => {
              const t: boolean = f.form.control!.value;
              return t;
            },
          }),
        ],
      ),
      d(
        ['nnul', 's'],
        [
          d.props.patchAsync({
            p: (f) => {
              const s: string = f.form.control!.value;
              return s;
            },
          }),
        ],
      ),
      d(
        ['no', 'd'],
        [
          d.props.patchAsync({
            p: (f) => {
              const dt: Date = f.form.control!.value;
              return dt;
            },
          }),
        ],
      ),
    ]);
    expect(merged).toBeTruthy();
  });

  it('类型: wrapped 家族多层叠加与 pipe 混排仍可下钻', () => {
    const root = v.object({
      a: v.pipe(
        v.nonNullish(v.exactOptional(v.object({ b: v.string() }))),
        v.metadata({}),
      ),
    });
    const merged = typedFieldPipe(root, (d) => [
      d(
        ['a', 'b'],
        [
          d.props.patchAsync({
            p: (f) => {
              const s: string = f.form.control!.value;
              return s;
            },
          }),
        ],
      ),
    ]);
    expect(merged).toBeTruthy();
  });
});

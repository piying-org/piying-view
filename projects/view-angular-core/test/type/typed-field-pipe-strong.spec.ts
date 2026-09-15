import * as v from 'valibot';
import { signal, Signal } from '@angular/core';
import { Observable, map, of } from 'rxjs';
import {
  typedFieldPipe,
  PiFieldAtPath,
  PathsOf,
  FieldPathsOf,
  AsyncResult,
  ListenPathOf,
  setAlias,
  ɵtypedFieldActions,
} from '@piying/view-angular-core';
import { createBuilder } from '../util/create-builder';
import { Equal, IsAny, IsUnknown } from '../util/type-assert';

const root = v.object({ num: v.number() });
type NumField = PiFieldAtPath<typeof root, ['num']>;

/** 6 层 optional + 2 层 pipe 混合, 旧实现会被深度预算截断 */
const deep = v.object({
  a: v.optional(
    v.object({
      a: v.pipe(
        v.optional(
          v.object({
            a: v.optional(
              v.object({
                a: v.pipe(
                  v.optional(
                    v.object({
                      a: v.optional(
                        v.object({
                          a: v.optional(v.object({ deep: v.string() })),
                        }),
                      ),
                    }),
                  ),
                  v.metadata({ k: 1 }),
                ),
              }),
            ),
          }),
        ),
        v.metadata({ k: 2 }),
      ),
    }),
  ),
});
type DeepPath = ['a', 'a', 'a', 'a', 'a', 'a', 'deep'];
const DEEP_PATH: DeepPath = ['a', 'a', 'a', 'a', 'a', 'a', 'deep'];

describe('强类型改造 - 带 field 的 action (#4)', () => {
  it('valueChange / hideWhen / disableWhen 回调 field 与 builder.get(path) 等价', () => {
    const seen: string[] = [];

    const merged = typedFieldPipe(root, (d) => [
      d(
        ['num'],
        [
          d.valueChange((fn, field) => {
            const eq: Equal<typeof field, NumField> = true;
            expect(eq).toBe(true);
            seen.push('valueChange@' + field.fullPath.join('/'));
            fn({ list: [undefined] }).subscribe();
          }),
        ],
      ),
      d(
        ['num'],
        [
          d.hideWhen({
            listen: (fn, field) => {
              const eq: Equal<typeof field, NumField> = true;
              expect(eq).toBe(true);
              seen.push('hideWhen@' + field.fullPath.join('/'));
              return of(false);
            },
          }),
        ],
      ),
      d(
        ['num'],
        [
          d.disableWhen({
            listen: (fn, field) => {
              const eq: Equal<typeof field, NumField> = true;
              expect(eq).toBe(true);
              seen.push('disableWhen@' + field.fullPath.join('/'));
              return of(false);
            },
          }),
        ],
      ),
    ]);

    const builder = createBuilder(merged);
    builder.form.control?.updateValue({ num: 1 });

    expect(seen).toContain('valueChange@num');
    expect(seen).toContain('hideWhen@num');
    expect(seen).toContain('disableWhen@num');
  });

  it('class.async* / outputs.mergeAsync 回调 field 同样精确', () => {
    const seen: string[] = [];

    const merged = typedFieldPipe(root, (d) => [
      d(
        ['num'],
        [
          d.class.asyncTop((field) => {
            const eq: Equal<typeof field, NumField> = true;
            expect(eq).toBe(true);
            seen.push('asyncTop@' + field.fullPath.join('/'));
            return 'c-top';
          }),
          d.class.asyncBottom((field) => {
            const eq: Equal<typeof field, NumField> = true;
            expect(eq).toBe(true);
            seen.push('asyncBottom@' + field.fullPath.join('/'));
            return 'c-bottom';
          }),
          d.class.asyncComponent((field) => {
            const eq: Equal<typeof field, NumField> = true;
            expect(eq).toBe(true);
            seen.push('asyncComponent@' + field.fullPath.join('/'));
            return 'c-comp';
          }),
        ],
      ),
      d(
        ['num'],
        [
          d.outputs.mergeAsync({
            output1: (field) => {
              const eq: Equal<typeof field, NumField> = true;
              expect(eq).toBe(true);
              seen.push('mergeAsync@' + field.fullPath.join('/'));
              return () => {};
            },
          }),
        ],
      ),
    ]);

    const builder = createBuilder(merged);
    builder.form.control?.updateValue({ num: 1 });

    expect(seen).toContain('asyncTop@num');
    expect(seen).toContain('asyncBottom@num');
    expect(seen).toContain('asyncComponent@num');
    expect(seen).toContain('mergeAsync@num');
  });

  it('hideWhen / disableWhen 的 listen 拿到真实 field 且能驱动渲染配置', () => {
    let hideField: any = null;
    let disableField: any = null;

    const merged = typedFieldPipe(root, (d) => [
      d(
        ['num'],
        [
          d.hideWhen({
            listen: (fn, field) => {
              hideField = field;
              return of(false);
            },
          }),
          d.disableWhen({
            listen: (fn, field) => {
              disableField = field;
              return of(true);
            },
          }),
        ],
      ),
    ]);

    const builder = createBuilder(merged);
    builder.form.control?.updateValue({ num: 1 });

    expect(hideField).toBeTruthy();
    // hideWhen(false) 时 `!!undefined === false`, 不会触发写入, 所以断言「不是 true」
    expect(hideField.renderConfig().hidden).not.toBe(true);
    expect(disableField).toBeTruthy();
    expect(disableField.formConfig().disabled).toBe(true);
  });
});

describe('强类型改造 - 门面与运行时对齐 (#5)', () => {
  it('运行时 action 表键集合与门面声明一致(漏挂/改名会失败)', () => {
    const expected = [
      'attributes',
      'class',
      'createOptions',
      'disableWhen',
      'events',
      'hideWhen',
      'hooks',
      'inputs',
      'models',
      'outputs',
      'outputChange',
      'props',
      'providers',
      'slots',
      'valueChange',
      'wrappers',
    ];
    expect(Object.keys(ɵtypedFieldActions).sort()).toEqual(expected);
  });

  it('编译期: 运行时表键集合 === ActionFactories 键集合', () => {
    type RuntimeKeys = { [K in keyof typeof ɵtypedFieldActions]: true };
    type FacadeKeys = {
      [K in keyof import('@piying/view-angular-core').ActionFactories]: true;
    };
    const align: Equal<RuntimeKeys, FacadeKeys> = true;
    expect(align).toBe(true);
  });
});

describe('强类型改造 - 路径深度预算 (#6)', () => {
  it('深层 optional + pipe 混合路径可寻址', () => {
    const reachable: DeepPath extends PathsOf<typeof deep> ? true : false =
      true;
    expect(reachable).toBe(true);
  });

  it('深层路径在 typedFieldPipe 里真的能挂上 action', () => {
    let hit = 0;
    const merged = typedFieldPipe(deep, (d) => [
      d(DEEP_PATH, [
        d.props.patchAsync({
          tag: (field) => {
            // 类型: 回调 field 就是这条深层路径的精确字段类型, 不是松散兵底形态
            const eqField: Equal<
              typeof field,
              PiFieldAtPath<typeof deep, DeepPath>
            > = true;
            // 且不是 any / unknown
            const notAny: IsAny<typeof field> = false;
            const notUnknown: IsUnknown<typeof field> = false;
            expect(eqField).toBe(true);
            expect(notAny).toBe(false);
            expect(notUnknown).toBe(false);
            expect(field.fullPath).toEqual(DEEP_PATH);
            hit++;
            return 'deep-tag';
          },
        }),
      ]),
    ]);

    const builder = createBuilder(merged);
    builder.form.control?.updateValue({
      a: { a: { a: { a: { a: { a: { a: { deep: 'x' } } } } } } },
    });
    expect(hit).toBe(1);
    expect(builder.get(DEEP_PATH)!.props()['tag']).toBe('deep-tag');
  });
});

describe('强类型改造 - 关键字路径段 [value] / [key] / [rest]', () => {
  const keyRoot = v.object({
    rec: v.record(v.string(), v.object({ x: v.number() })),
    mapNum: v.map(v.number(), v.object({ y: v.number() })),
    st: v.set(v.object({ z: v.number() })),
    arr: v.array(v.object({ c: v.number() })),
    tup: v.tuple([v.string(), v.number()]),
    tupRest: v.tupleWithRest([v.string()], v.number()),
    objRest: v.objectWithRest({ k: v.string() }, v.number()),
  });
  type KP = PathsOf<typeof keyRoot>;

  it('类型: [value] 只出现在 record / map / set / array', () => {
    const a: ['rec', '[value]', 'x'] extends KP ? true : false = true;
    const b: ['mapNum', '[value]', 'y'] extends KP ? true : false = true;
    const c: ['st', '[value]', 'z'] extends KP ? true : false = true;
    const d: ['arr', '[value]', 'c'] extends KP ? true : false = true;
    const e: ['tup', '[value]', 'y'] extends KP ? true : false = false;
    const f: ['tupRest', '[value]'] extends KP ? true : false = false;
    expect([a, b, c, d, e, f]).toEqual([true, true, true, true, false, false]);
  });

  it('类型: [key] 只出现在 record / map(set 无 key 节点)', () => {
    const a: ['rec', '[key]'] extends KP ? true : false = true;
    const b: ['mapNum', '[key]'] extends KP ? true : false = true;
    const c: ['st', '[key]'] extends KP ? true : false = false;
    const d: ['arr', '[key]'] extends KP ? true : false = false;
    const e: ['tupRest', '[key]'] extends KP ? true : false = false;
    expect([a, b, c, d, e]).toEqual([true, true, false, false, false]);
  });

  it('类型: [rest] 只出现在 *WithRest', () => {
    const a: ['tupRest', '[rest]'] extends KP ? true : false = true;
    const b: ['objRest', '[rest]'] extends KP ? true : false = true;
    const c: ['tup', '[rest]'] extends KP ? true : false = false;
    const d: ['rec', '[rest]'] extends KP ? true : false = false;
    const e: ['arr', '[rest]'] extends KP ? true : false = false;
    expect([a, b, c, d, e]).toEqual([true, true, false, false, false]);
  });

  it('类型: 任意 key 段下钻已移除(不再需要写假 k1)', () => {
    const a: ['rec', 'k1', 'x'] extends KP ? true : false = false;
    const b: ['mapNum', 3, 'y'] extends KP ? true : false = false;
    // 普通结构路径不受影响
    const c: ['arr', 0, 'c'] extends KP ? true : false = true;
    const d: ['tup', 1] extends KP ? true : false = true;
    expect([a, b, c, d]).toEqual([false, false, true, true]);
  });

  it('运行时: [value] 对 record 的所有 entry 生效', () => {
    const hits: string[] = [];
    const merged = typedFieldPipe(keyRoot, (d) => [
      d(
        ['rec', '[value]', 'x'],
        [
          d.props.patchAsync({
            tag: (field) => {
              hits.push(field.fullPath.join('/'));
              return 'a';
            },
          }),
        ],
      ),
    ]);

    const builder = createBuilder(merged);
    builder.form.control?.updateValue({
      rec: { k1: { x: 1 }, k2: { x: 2 }, k3: { x: 3 } },
    });

    expect(hits.sort()).toEqual(['rec/k1/x', 'rec/k2/x', 'rec/k3/x']);
    expect(builder.get(['rec', 'k2', 'x'])!.props()['tag']).toBe('a');
  });

  it('运行时: [value] 对 array 的每个 item 生效', () => {
    const merged = typedFieldPipe(keyRoot, (d) => [
      d(['arr', '[value]', 'c'], [d.props.patchAsync({ tag: () => 'arrTag' })]),
    ]);
    const builder = createBuilder(merged);
    builder.form.control?.updateValue({ arr: [{ c: 1 }, { c: 2 }] });

    expect(builder.get(['arr', 0, 'c'])!.props()['tag']).toBe('arrTag');
    expect(builder.get(['arr', 1, 'c'])!.props()['tag']).toBe('arrTag');
  });

  it('运行时: [key] 把 action 合进 record 的 key schema', () => {
    const merged = typedFieldPipe(keyRoot, (d) => [
      d(['rec', '[key]'], [v.metadata({ onKey: true })]),
    ]);
    const rec: any = (merged as any).entries.rec;
    expect(rec.type).toBe('record');
    // key 被重建为 pipe, 且 metadata 真的落在 key 上
    expect(Array.isArray(rec.key.pipe)).toBe(true);
    expect(v.getMetadata(rec.key)).toEqual({ onKey: true });
    // value 节点没被动过(getMetadata 无元数据时返回空对象)
    expect(v.getMetadata(rec.value)).toEqual({});
  });

  it('运行时: [rest] 把 action 合进 tupleWithRest 的 rest schema', () => {
    const merged = typedFieldPipe(keyRoot, (d) => [
      d(['tupRest', '[rest]'], [v.metadata({ onRest: true })]),
    ]);
    const t: any = (merged as any).entries.tupRest;
    expect(t.type).toBe('tuple_with_rest');
    expect(Array.isArray(t.rest.pipe)).toBe(true);
    expect(v.getMetadata(t.rest)).toEqual({ onRest: true });
    // 固定部分不受影响
    expect(t.items.length).toBe(1);
    expect(v.getMetadata(t.items[0])).toEqual({});
  });

  it('运行时: [rest] 对 objectWithRest 同样生效, 固定 entries 保留', () => {
    const merged = typedFieldPipe(keyRoot, (d) => [
      d(['objRest', '[rest]'], [v.metadata({ onRest: true })]),
    ]);
    const o: any = (merged as any).entries.objRest;
    expect(o.type).toBe('object_with_rest');
    expect(Object.keys(o.entries)).toEqual(['k']);
    expect(v.getMetadata(o.rest)).toEqual({ onRest: true });
    expect(v.getMetadata(o.entries.k)).toEqual({});
  });

  it('运行时: entries 里真有同名字段时, 真实字段优先于关键字', () => {
    const clash = v.object({ '[key]': v.string(), other: v.number() });
    const merged = typedFieldPipe(clash, (d) => [
      d(['[key]'], [d.props.patchAsync({ tag: () => 'real-field' })]),
    ]);
    const m: any = merged;
    // 仍然是普通 object, 没被当成 record 的 key 节点处理
    expect(m.type).toBe('object');
    expect(Object.keys(m.entries)).toEqual(['[key]', 'other']);

    const builder = createBuilder(merged);
    builder.form.control?.updateValue({ '[key]': 'v', other: 1 });
    expect(builder.get(['[key]'])!.props()['tag']).toBe('real-field');
  });

  it('类型: 在不支持关键字的节点上写关键字直接报错', () => {
    const plain = v.object({ a: v.object({ b: v.string() }) });
    typedFieldPipe(plain, (d) => [
      d(['a', 'b'], [d.props.patchAsync({ ok: () => 1 })]),
    ]);

    expect(() =>
      typedFieldPipe(plain, (d) => [
        // @ts-expect-error 普通 object 没有 key 节点
        d(['a', '[key]'], []),
      ]),
    ).toThrowError(/不存在 key: \[key\]/);

    expect(() =>
      typedFieldPipe(plain, (d) => [
        // @ts-expect-error 普通 object 没有 value 节点
        d(['a', '[value]'], []),
      ]),
    ).toThrowError(/不存在 key: \[value\]/);

    expect(() =>
      typedFieldPipe(plain, (d) => [
        // @ts-expect-error 普通 object 没有 rest 节点
        d(['a', '[rest]'], []),
      ]),
    ).toThrowError(/没有 rest 节点/);
  });
});

describe('强类型改造 - AsyncResult 统一 (#18)', () => {
  it('AsyncResult 展开形态与约定一致', () => {
    // 注: `T & {}` 在实例化后会归约, 所以对比的是归约后的形态
    const eq: Equal<
      AsyncResult<string>,
      Promise<string> | Observable<string> | Signal<string> | string
    > = true;
    expect(eq).toBe(true);
  });

  it('AsyncResult 可接受 Promise / Observable / Signal / 裸值', () => {
    const a: AsyncResult<number> = Promise.resolve(1);
    const b: AsyncResult<number> = of(2);
    const c: AsyncResult<number> = signal(3);
    const d: AsyncResult<number> = 4;
    expect([a, b, c, d].length).toBe(4);
  });

  it('AsyncResult 不放过值类型不匹配的异步形态', () => {
    const p: Equal<
      Promise<number> extends AsyncResult<string> ? true : false,
      false
    > = true;
    const o: Equal<
      Observable<number> extends AsyncResult<string> ? true : false,
      false
    > = true;
    expect(p).toBe(true);
    expect(o).toBe(true);
  });

  it('FieldPathsOf 与 PathsOf 完全等价', () => {
    const eq: Equal<FieldPathsOf<typeof root>, PathsOf<typeof root>> = true;
    expect(eq).toBe(true);
  });
});

describe('强类型改造 - 监听 list 路径逐位强类型 (#19)', () => {
  const listenRoot = v.object({
    flag: v.boolean(),
    name: v.string(),
    nested: v.object({ age: v.number(), city: v.string() }),
  });
  type LRoot = typeof listenRoot;

  /**
   * valueChanges 经 Angular effect 异步派发, 断言前先等到「至少 min 次发射且不再有新增」。
   */
  async function waitQuiet(emissions: unknown[], min: number) {
    let guard = 0;
    while (emissions.length < min && guard++ < 500) {
      await new Promise((r) => setTimeout(r, 0));
    }
    let last = -1;
    let stable = 0;
    while (stable < 3) {
      await new Promise((r) => setTimeout(r, 0));
      if (emissions.length === last) stable++;
      else {
        stable = 0;
        last = emissions.length;
      }
    }
  }

  it('类型: valueChange 的 list / listenFields 与路径元组逐位对齐', () => {
    typedFieldPipe(listenRoot, (d) => [
      d(
        ['nested', 'age'],
        [
          d.valueChange((fn) => {
            fn({
              list: [undefined, ['..', 'city'], ['#', 'flag'], ['#', 'name']],
            }).subscribe((s) => {
              // 值类型逐位精确, 不再是 any
              const shape: Equal<
                typeof s.list,
                [number, string, boolean, string]
              > = true;
              const notAny: IsAny<(typeof s.list)[1]> = false;
              // 字段类型与 builder.get(path) 完全等价
              const f0: Equal<
                (typeof s.listenFields)[0],
                PiFieldAtPath<LRoot, ['nested', 'age']>
              > = true;
              const f1: Equal<
                (typeof s.listenFields)[1],
                PiFieldAtPath<LRoot, ['nested', 'city']>
              > = true;
              const f2: Equal<
                (typeof s.listenFields)[2],
                PiFieldAtPath<LRoot, ['flag']>
              > = true;
              const f3: Equal<
                (typeof s.listenFields)[3],
                PiFieldAtPath<LRoot, ['name']>
              > = true;
              const lfNotAny: IsAny<(typeof s.listenFields)[2]> = false;
              expect([shape, notAny, f0, f1, f2, f3, lfNotAny]).toEqual([
                true,
                false,
                true,
                true,
                true,
                true,
                false,
              ]);
            });
          }),
        ],
      ),
    ]);
  });

  it('类型: 不传 list 时退化为「只监听自身」', () => {
    typedFieldPipe(listenRoot, (d) => [
      d(
        ['nested', 'age'],
        [
          d.valueChange((fn, field) => {
            fn().subscribe((s) => {
              const shape: Equal<typeof s.list, [number]> = true;
              const self: Equal<
                (typeof s.listenFields)[0],
                PiFieldAtPath<LRoot, ['nested', 'age']>
              > = true;
              const sameAsField: Equal<typeof s.field, typeof field> = true;
              expect([shape, self, sameAsField]).toEqual([true, true, true]);
            });
          }),
        ],
      ),
    ]);
  });

  it('类型: 路径写错会被直接拦下, 不再静默退化成 any', () => {
    typedFieldPipe(listenRoot, (d) => [
      d(
        ['nested', 'age'],
        [
          d.valueChange((fn) => {
            // @ts-expect-error 'nope' 不在父级 nested 的路径集合里
            fn({ list: [['..', 'nope']] }).subscribe((s) => {
              const wrongIsAny: IsAny<(typeof s.list)[0]> = false;
              expect(wrongIsAny).toBe(false);
            });
          }),
        ],
      ),
    ]);
  });

  it('类型: list 候选路径 = 自身往下 / # 根级 / .. 父级', () => {
    // 首段候选(即编辑器补全项)
    type Head<T> = T extends readonly [infer H, ...unknown[]] ? H : never;

    typedFieldPipe(listenRoot, (d) => [
      d(
        ['nested', 'age'],
        [
          d.valueChange((fn, field) => {
            type C = Exclude<ListenPathOf<typeof field>, undefined>;
            // 数字字段自身无子路径, 首段只剩 # 与 ..
            const heads: Equal<Head<C>, '#' | '..'> = true;
            const ok: ListenPathOf<typeof field>[] = [
              undefined,
              [],
              ['..', 'city'],
              ['..', 'age'],
              ['#', 'flag'],
              ['#', 'nested', 'age'],
            ];
            expect([heads, ok.length]).toEqual([true, 6]);
          }),
        ],
      ),
      d(
        ['nested'],
        [
          d.valueChange((fn, field) => {
            type C = Exclude<ListenPathOf<typeof field>, undefined>;
            // 对象字段自身往下的 key 同样进入候选
            const heads: Equal<Head<C>, '#' | '..' | 'age' | 'city'> = true;
            expect(heads).toBe(true);
          }),
        ],
      ),
    ]);
  });

  it('类型: 别名路径 @xxx 也在候选内, 并解析出目标字段类型', () => {
    const aliasRoot = v.object({
      key1: v.pipe(v.string(), setAlias('ss')),
      other: v.number(),
    });

    typedFieldPipe(aliasRoot, (d) => [
      d(
        ['other'],
        [
          d.valueChange((fn, field) => {
            type Head<T> = T extends readonly [infer H, ...unknown[]]
              ? H
              : never;
            type C = Exclude<ListenPathOf<typeof field>, undefined>;
            const heads: Equal<Head<C>, '#' | '..' | '@ss'> = true;
            fn({ list: [['@ss']] }).subscribe((s) => {
              const aliasValue: Equal<(typeof s.list)[0], string> = true;
              expect([heads, aliasValue]).toEqual([true, true]);
            });
          }),
        ],
      ),
    ]);
  });

  it('类型: outputChange 的 entry.list 同样获得路径候选', () => {
    typedFieldPipe(listenRoot, (d) => [
      d(
        ['nested', 'age'],
        [
          d.outputChange((fn) => {
            fn([
              { list: undefined, output: 'fire' },
              { list: ['..', 'city'], output: 'fire' },
              { list: ['#', 'flag'], output: 'fire' },
            ]).subscribe((s) => {
              const f1: Equal<
                (typeof s.listenFields)[1],
                PiFieldAtPath<LRoot, ['nested', 'city']>
              > = true;
              const f2: Equal<
                (typeof s.listenFields)[2],
                PiFieldAtPath<LRoot, ['flag']>
              > = true;
              expect([f1, f2]).toEqual([true, true]);
            });
          }),
        ],
      ),
    ]);
  });

  it('运行时: listenFields 逐位解析成真实字段, list 是对应 value', async () => {
    const emissions: any[] = [];
    const merged = typedFieldPipe(listenRoot, (d) => [
      d(
        ['nested', 'age'],
        [
          d.valueChange((fn) => {
            fn({
              list: [undefined, ['..', 'city'], ['#', 'flag']],
            }).subscribe((s) => {
              emissions.push(s);
            });
          }),
        ],
      ),
    ]);

    const builder = createBuilder(merged);
    builder.form.control?.updateValue({
      flag: true,
      name: 'n',
      nested: { age: 7, city: 'sh' },
    });
    await waitQuiet(emissions, 1);

    const s = emissions[emissions.length - 1];
    expect(s.field.fullPath).toEqual(['nested', 'age']);
    expect(s.listenFields.map((f: any) => f.fullPath)).toEqual([
      ['nested', 'age'],
      ['nested', 'city'],
      ['flag'],
    ]);
    expect(s.list).toEqual([7, 'sh', true]);
  });

  it('运行时: hideWhen 依据 list 里其他字段的值切换 hidden', async () => {
    const emissions: any[] = [];
    const merged = typedFieldPipe(listenRoot, (d) => [
      d(
        ['nested', 'city'],
        [
          d.hideWhen({
            listen: (fn) =>
              fn({ list: [['..', 'age']] }).pipe(
                map((s) => {
                  emissions.push(s.list[0]);
                  return s.list[0] > 10;
                }),
              ),
          }),
        ],
      ),
    ]);

    const builder = createBuilder(merged);
    builder.form.control?.updateValue({
      flag: true,
      name: 'n',
      nested: { age: 3, city: 'sh' },
    });
    await waitQuiet(emissions, 1);
    expect(builder.get(['nested', 'city'])!.renderConfig().hidden).toBeFalsy();

    const before = emissions.length;
    builder.form.control?.updateValue({
      flag: true,
      name: 'n',
      nested: { age: 20, city: 'sh' },
    });
    await waitQuiet(emissions, before + 1);
    expect(builder.get(['nested', 'city'])!.renderConfig().hidden).toBe(true);
  });

  it('运行时: disableWhen 依据 list 里根级字段的值切换 disabled', async () => {
    const emissions: any[] = [];
    const merged = typedFieldPipe(listenRoot, (d) => [
      d(
        ['name'],
        [
          d.disableWhen({
            listen: (fn) =>
              fn({ list: [['#', 'flag']] }).pipe(
                map((s) => {
                  emissions.push(s.list[0]);
                  return s.list[0];
                }),
              ),
          }),
        ],
      ),
    ]);

    const builder = createBuilder(merged);
    builder.form.control?.updateValue({
      flag: false,
      name: 'n',
      nested: { age: 1, city: 'c' },
    });
    await waitQuiet(emissions, 1);
    expect(builder.get(['name'])!.formConfig().disabled).toBe(false);

    const before = emissions.length;
    builder.form.control?.updateValue({
      flag: true,
      name: 'n',
      nested: { age: 1, city: 'c' },
    });
    await waitQuiet(emissions, before + 1);
    expect(builder.get(['name'])!.formConfig().disabled).toBe(true);
  });

  it('运行时: outputChange 的 listenFields 与监听项逐位对齐', async () => {
    const emissions: any[] = [];
    const merged = typedFieldPipe(listenRoot, (d) => [
      d(
        ['nested', 'age'],
        [
          d.outputs.set({ fire: () => {} }),
          d.outputChange((fn) => {
            fn([
              { list: undefined, output: 'fire' },
              { list: ['..', 'city'], output: 'fire' },
            ]).subscribe((s) => {
              emissions.push(s);
            });
          }),
        ],
      ),
    ]);

    const builder = createBuilder(merged);
    builder.form.control?.updateValue({
      flag: true,
      name: 'n',
      nested: { age: 1, city: 'c' },
    });
    builder.get(['nested', 'age'])!.outputs()['fire']('x', 2);
    await waitQuiet(emissions, 1);

    const s = emissions[emissions.length - 1];
    expect(s.listenFields.map((f: any) => f.fullPath)).toEqual([
      ['nested', 'age'],
      ['nested', 'city'],
    ]);
    // list 是 output 触发时的原始参数数组(mergeOutputFn 会在尾部追加 field)
    expect(s.list[0][0]).toBe('x');
    expect(s.list[0][1]).toBe(2);
  });

  it('类型: 门面已暴露 outputChange(与 hideWhen/disableWhen/valueChange 同族)', () => {
    type FacadeKeys = keyof import('@piying/view-angular-core').ActionFactories;
    const has: 'outputChange' extends FacadeKeys ? true : false = true;
    expect(has).toBe(true);
    expect(typeof (ɵtypedFieldActions as any).outputChange).toBe('function');
  });
});

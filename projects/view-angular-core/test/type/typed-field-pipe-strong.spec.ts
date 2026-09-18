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
      'outputChange',
      'outputs',
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
  // Equal / IsAny 这类断言只在编译期生效(运行时就是个写死的字面量),
  // 所以「类型:」用例额外驱动一次 builder, 把真实解析出的值与路径也断言掉,
  // 并用 emissions.length 兜底确认回调真的跑过(而不是 0 次静默通过)
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

  it('类型: valueChange 的 list / listenFields 与路径元组逐位对齐', async () => {
    const emissions: any[] = [];
    const merged = typedFieldPipe(listenRoot, (d) => [
      d(
        ['nested', 'age'],
        [
          d.valueChange((fn) => {
            fn({
              list: [undefined, ['..', 'city'], ['#', 'flag'], ['#', 'name']],
            }).subscribe((s) => {
              // 编译期: 值类型逐位精确, 不再是 any
              const shape: Equal<
                typeof s.list,
                [number, string, boolean, string]
              > = true;
              const notAny: IsAny<(typeof s.list)[1]> = false;
              // 编译期: 字段类型与 builder.get(path) 完全等价
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
              emissions.push({
                types: [shape, notAny, f0, f1, f2, f3, lfNotAny],
                list: s.list,
                paths: s.listenFields.map((f: any) => f.fullPath),
              });
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

    // 兜底: 内部断言确实执行过, 不是 0 次静默通过
    expect(emissions.length).toBeGreaterThan(0);
    const last = emissions[emissions.length - 1];
    expect(last.types).toEqual([true, false, true, true, true, true, false]);
    // 运行时逐位对齐: 值与字段路径一一对上
    expect(last.list).toEqual([7, 'sh', true, 'n']);
    expect(last.paths).toEqual([
      ['nested', 'age'],
      ['nested', 'city'],
      ['flag'],
      ['name'],
    ]);
  });

  it('类型: 不传 list 时退化为「只监听自身」', async () => {
    const emissions: any[] = [];
    const merged = typedFieldPipe(listenRoot, (d) => [
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
              emissions.push({
                types: [shape, self, sameAsField],
                list: s.list,
                paths: s.listenFields.map((f: any) => f.fullPath),
                sameRef: s.field === field,
              });
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

    expect(emissions.length).toBeGreaterThan(0);
    const last = emissions[emissions.length - 1];
    expect(last.types).toEqual([true, true, true]);
    // 只监听自身: 只有一位, 且就是自己
    expect(last.list).toEqual([7]);
    expect(last.paths).toEqual([['nested', 'age']]);
    expect(last.sameRef).toBe(true);
  });

  it('类型: 路径写错会被直接拦下, 不再静默退化成 any', () => {
    const merged = typedFieldPipe(listenRoot, (d) => [
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

    // 编译期把错误路径归为 never, 运行时同样解析不到
    // (用原始 schema 建 builder, 避开这条注定解不到的 action)
    const self = createBuilder(listenRoot).get(['nested', 'age'])!;
    const nope = self.get(['..', 'nope']);
    const eq: Equal<typeof nope, undefined> = true;
    expect(nope).toBeUndefined();
    expect(eq).toBe(true);
    // 对照: 合法路径确实解析得到
    expect(self.get(['..', 'city'])!.fullPath).toEqual(['nested', 'city']);
    expect(merged).toBeTruthy();
  });

  it('类型: list 候选路径 = 自身往下 / # 根级 / .. 父级', async () => {
    // 首段候选(即编辑器补全项)
    type Head<T> = T extends readonly [infer H, ...unknown[]] ? H : never;
    const declared: any[] = [];
    const resolved: any[] = [];

    const merged = typedFieldPipe(listenRoot, (d) => [
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
            declared.push({ heads, okLen: ok.length });
            // 把候选路径逐条解析, 验证运行时确实落到预期字段上
            fn({
              list: [
                undefined,
                [],
                ['..', 'city'],
                ['..', 'age'],
                ['#', 'flag'],
                ['#', 'nested', 'age'],
              ],
            }).subscribe((s) => {
              resolved.push({
                paths: s.listenFields.map((f: any) => f.fullPath),
                list: s.list,
              });
            });
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
            declared.push({ heads });
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
    await waitQuiet(resolved, 1);

    // 两个字段上的回调都跑过, 且编译期断言为预期值
    expect(declared.length).toBeGreaterThanOrEqual(2);
    expect(declared.every((c) => c.heads === true)).toBe(true);
    expect(declared.find((c) => c.okLen !== undefined)?.okLen).toBe(6);

    const last = resolved[resolved.length - 1];
    // [] 与 undefined 一样解析成自身
    expect(last.paths).toEqual([
      ['nested', 'age'],
      ['nested', 'age'],
      ['nested', 'city'],
      ['nested', 'age'],
      ['flag'],
      ['nested', 'age'],
    ]);
    expect(last.list).toEqual([7, 7, 'sh', 7, true, 7]);
  });

  it('类型: 别名路径 @xxx 也在候选内, 并解析出目标字段类型', async () => {
    const aliasRoot = v.object({
      key1: v.pipe(v.string(), setAlias('ss')),
      other: v.number(),
    });
    const emissions: any[] = [];

    const merged = typedFieldPipe(aliasRoot, (d) => [
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
              emissions.push({
                types: [heads, aliasValue],
                list: s.list,
                paths: s.listenFields.map((f: any) => f.fullPath),
              });
            });
          }),
        ],
      ),
    ]);

    const builder = createBuilder(merged);
    builder.form.control?.updateValue({ key1: 'alias-target', other: 1 });
    await waitQuiet(emissions, 1);

    expect(emissions.length).toBeGreaterThan(0);
    const last = emissions[emissions.length - 1];
    expect(last.types).toEqual([true, true]);
    // @ss 真的解到 key1 上, 值也是 key1 的值
    expect(last.list).toEqual(['alias-target']);
    expect(last.paths).toEqual([['key1']]);
  });

  it('类型: outputChange 的 entry.list 同样获得路径候选', async () => {
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
              { list: ['#', 'flag'], output: 'fire' },
              { list: [], output: 'fire' },
            ]).subscribe((s) => {
              const f1: Equal<
                (typeof s.listenFields)[1],
                PiFieldAtPath<LRoot, ['nested', 'city']>
              > = true;
              const f2: Equal<
                (typeof s.listenFields)[2],
                PiFieldAtPath<LRoot, ['flag']>
              > = true;
              // 空路径与 undefined 一样表示自身
              const f3: Equal<
                (typeof s.listenFields)[3],
                PiFieldAtPath<LRoot, ['nested', 'age']>
              > = true;
              emissions.push({
                types: [f1, f2, f3],
                paths: s.listenFields.map((f: any) => f.fullPath),
              });
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
    builder.get(['nested', 'age'])!.outputs()['fire']('x', 2);
    await waitQuiet(emissions, 1);

    expect(emissions.length).toBeGreaterThan(0);
    const last = emissions[emissions.length - 1];
    expect(last.types).toEqual([true, true, true]);
    // 三个候选路径 + 空路径, 都解到了真实字段
    expect(last.paths).toEqual([
      ['nested', 'age'],
      ['nested', 'city'],
      ['flag'],
      ['nested', 'age'],
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
    // list 是 output 触发时的原始参数数组(尾部追加的 field 已剔除, 取 field 走 listenFields)
    expect(s.list[0][0]).toBe('x');
    expect(s.list[0][1]).toBe(2);
  });

  it('运行时: 跨字段监听由「被监听字段」触发, 自身同名 output 不误触发', async () => {
    const emissions: any[] = [];
    const merged = typedFieldPipe(listenRoot, (d) => [
      d(['nested', 'city'], [d.outputs.set({ fire: () => {} })]),
      d(
        ['nested', 'age'],
        [
          // 自身也声明同名 output: 它不该被「监听 city」的这条 entry 捕获
          d.outputs.set({ fire: () => {} }),
          d.outputChange((fn) => {
            fn([{ list: ['..', 'city'], output: 'fire' }]).subscribe((s) => {
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
    await waitQuiet(emissions, 0);
    // 合成的首帧已被 skip, 目标字段没触发前不应有发射
    expect(emissions.length).toBe(0);

    builder.get(['nested', 'age'])!.outputs()['fire']('from-self');
    await waitQuiet(emissions, 0);
    expect(emissions.length).toBe(0);

    builder.get(['nested', 'city'])!.outputs()['fire']('from-city', 9);
    await waitQuiet(emissions, 1);

    expect(emissions.length).toBe(1);
    const s = emissions[0];
    // 订阅方仍是声明处字段, 监听目标是 city
    expect(s.field.fullPath).toEqual(['nested', 'age']);
    expect(s.listenFields.map((f: any) => f.fullPath)).toEqual([
      ['nested', 'city'],
    ]);
    expect(s.list[0][0]).toBe('from-city');
    expect(s.list[0][1]).toBe(9);
  });

  it('运行时: 自身监听(undefined 与空路径)仍然生效', async () => {
    const emissions: any[] = [];
    const merged = typedFieldPipe(listenRoot, (d) => [
      d(
        ['nested', 'age'],
        [
          d.outputs.set({ fire: () => {} }),
          d.outputChange((fn) => {
            fn([
              { list: undefined, output: 'fire' },
              { list: [], output: 'fire' },
            ]).subscribe((s) => {
              emissions.push(s.list.map((a: any) => a?.[0]));
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
    await waitQuiet(emissions, 0);
    expect(emissions.length).toBe(0);

    builder.get(['nested', 'age'])!.outputs()['fire']('from-self');
    await waitQuiet(emissions, 1);

    // 两条 entry 共用同一个 output 名, combineLatest 会逐个级联发射;
    // 真正要保证的是「终态」两位都拿到了自身参数
    expect(emissions.length).toBeGreaterThanOrEqual(1);
    expect(emissions[emissions.length - 1]).toEqual(['from-self', 'from-self']);
  });

  it('运行时: 多位监听逐位汇总, 未监听的 output 名不触发', async () => {
    const emissions: any[] = [];
    const merged = typedFieldPipe(listenRoot, (d) => [
      d(['flag'], [d.outputs.set({ zap: () => {} })]),
      d(
        ['nested', 'city'],
        [d.outputs.set({ pong: () => {}, other: () => {} })],
      ),
      d(
        ['nested', 'age'],
        [
          d.outputs.set({ ping: () => {} }),
          d.outputChange((fn) => {
            fn([
              { list: undefined, output: 'ping' },
              { list: ['..', 'city'], output: 'pong' },
              { list: ['#', 'flag'], output: 'zap' },
            ]).subscribe((s) => {
              emissions.push(s.list.map((a: any) => a?.[0] ?? null));
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
    await waitQuiet(emissions, 0);
    expect(emissions.length).toBe(0);

    // 目标字段上未被监听的 output 名: 不应触发
    builder.get(['nested', 'city'])!.outputs()['other']('nope');
    await waitQuiet(emissions, 0);
    expect(emissions.length).toBe(0);

    builder.get(['nested', 'city'])!.outputs()['pong']('from-city');
    await waitQuiet(emissions, 1);
    expect(emissions[emissions.length - 1]).toEqual([null, 'from-city', null]);

    builder.get(['flag'])!.outputs()['zap']('from-flag');
    await waitQuiet(emissions, 2);
    expect(emissions[emissions.length - 1]).toEqual([
      null,
      'from-city',
      'from-flag',
    ]);

    builder.get(['nested', 'age'])!.outputs()['ping']('from-self');
    await waitQuiet(emissions, 3);
    expect(emissions[emissions.length - 1]).toEqual([
      'from-self',
      'from-city',
      'from-flag',
    ]);
  });

  it('类型: 门面已暴露 outputChange(与 hideWhen/disableWhen/valueChange 同族)', () => {
    type FacadeKeys = keyof import('@piying/view-angular-core').ActionFactories;
    const has: 'outputChange' extends FacadeKeys ? true : false = true;
    expect(has).toBe(true);
    expect(typeof (ɵtypedFieldActions as any).outputChange).toBe('function');
  });

  it('类型: 非组件版的 output 名保持宽松(默认 string, 不受组件约束)', () => {
    type Entry = import('@piying/view-angular-core').OutputChangeListenEntry;
    const loose: Entry = { list: undefined, output: 'any-name' };
    const looseList: import('@piying/view-angular-core').EventChangeFn = (
      fn,
    ) => {
      fn([{ list: undefined, output: 'any-name' }]);
    };
    expect(loose.output).toBe('any-name');
    expect(typeof looseList).toBe('function');
  });
});

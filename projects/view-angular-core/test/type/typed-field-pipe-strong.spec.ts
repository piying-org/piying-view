import * as v from 'valibot';
import { signal, Signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import {
  typedFieldPipe,
  PiFieldAtPath,
  PathsOf,
  FieldPathsOf,
  AsyncResult,
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

describe('强类型改造 - record / map key 段 (#9)', () => {
  const keyRoot = v.object({
    rec: v.record(v.string(), v.object({ x: v.number() })),
    mapNum: v.map(v.number(), v.object({ y: v.number() })),
  });
  type KP = PathsOf<typeof keyRoot>;

  it('string key 的 record 只收 string 段', () => {
    const okStr: ['rec', 'anyKey', 'x'] extends KP ? true : false = true;
    const badNum: ['rec', 1, 'x'] extends KP ? true : false = false;
    expect(okStr).toBe(true);
    expect(badNum).toBe(false);
  });

  it('number key 的 map 只收 number 段', () => {
    const okNum: ['mapNum', 7, 'y'] extends KP ? true : false = true;
    const badStr: ['mapNum', 'k', 'y'] extends KP ? true : false = false;
    expect(okNum).toBe(true);
    expect(badStr).toBe(false);
  });

  it('record: key 段是运行时丢弃的占位符, action 落在 value 模板上(对所有 entry 生效)', () => {
    const hits: string[] = [];
    const merged = typedFieldPipe(keyRoot, (d) => [
      d(
        ['rec', 'k1', 'x'],
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

    // mergeAt 对 record 走 isValueSchema 分支, 直接进 s.value, key 段不参与重建;
    // record 只有一个 value 节点, 所以 action 对 k1/k2/k3 全量生效。
    expect(hits.sort()).toEqual(['rec/k1/x', 'rec/k2/x', 'rec/k3/x']);
    expect(builder.get(['rec', 'k1', 'x'])!.props()['tag']).toBe('a');
    expect(builder.get(['rec', 'k2', 'x'])!.props()['tag']).toBe('a');
    expect(builder.get(['rec', 'k3', 'x'])!.props()['tag']).toBe('a');
  });

  it('map: 类型可达但运行时不建 field —— 挂上去的 action 不会触发', () => {
    const hits: string[] = [];
    const merged = typedFieldPipe(keyRoot, (d) => [
      d(
        ['mapNum', 3, 'y'],
        [
          d.props.patchAsync({
            tag: (field) => {
              hits.push(field.fullPath.join('/'));
              return 'b';
            },
          }),
        ],
      ),
    ]);

    const builder = createBuilder(merged);
    const m = new Map<number, { y: number }>([
      [3, { y: 1 }],
      [7, { y: 2 }],
    ]);
    builder.form.control?.updateValue({ mapNum: m });

    // 现状(本次未改): map 的 entry 不会生成可寻址 field,
    // 所以类型上合法的 ['mapNum', 3, 'y'] 在运行时是空转。
    expect(hits).toEqual([]);
    expect(builder.get(['mapNum', 3, 'y'] as any)).toBeUndefined();
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

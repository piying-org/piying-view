import * as v from 'valibot';
import {
  ComponentKeyAt,
  SchemaTypeAt,
  setComponent,
} from '@piying/view-angular-core';
import { createBuilder } from './util/create-builder';

/** 类型工具: 判断两个类型是否完全相等 */
type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false;

/** setComponent 直接传组件类的形态 */
class DirectComp {}
class DirectComp2 {}

const Schema = v.object({
  radio1: v.pipe(
    v.optional(v.picklist(['v1', 'v2'])),
    setComponent('radio'),
    v.title('radio1-title'),
  ),
  text1: v.pipe(v.optional(v.string()), v.title('text1-label')),
  checkbox1: v.optional(v.boolean()),
  nestedPipe: v.pipe(
    v.optional(v.pipe(v.string(), setComponent('inner'))),
    v.title('nested-pipe'),
  ),
  lastWin: v.pipe(v.string(), setComponent('a'), setComponent('b')),
  wrapped: v.optional(v.pipe(v.string(), setComponent('inWrapped'))),
  // 多个 setComponent: 中间夹其他 action
  multiWithActions: v.pipe(
    v.string(),
    setComponent('m1'),
    v.title('t'),
    setComponent('m2'),
  ),
  // 多个 setComponent: 反过来写, 赢家跟着换
  multiReversed: v.pipe(
    v.string(),
    setComponent('m4'),
    v.description('d'),
    setComponent('m3'),
  ),
  // 多个 setComponent: 三个连写
  multiTriple: v.pipe(
    v.string(),
    setComponent('t1'),
    setComponent('t2'),
    setComponent('t3'),
  ),
  // 多个 setComponent: 嵌套 pipe, 外层覆盖内层
  nestedOverride: v.pipe(
    v.pipe(v.string(), setComponent('nInner')),
    setComponent('nOuter'),
  ),
  // 多个 setComponent: 嵌套 pipe 只有内层有
  nestedOnly: v.pipe(v.pipe(v.string(), setComponent('nOnly')), v.title('x')),
  // 多个 setComponent: wrapped 内层有, 外层 pipe 也有
  wrappedOverride: v.pipe(
    v.optional(v.pipe(v.string(), setComponent('wInner'))),
    setComponent('wOuter'),
  ),
  // 直接传组件类
  directClass: v.pipe(v.string(), setComponent(DirectComp)),
  // 组件类覆盖 string
  classOverridesString: v.pipe(
    v.string(),
    setComponent('radio'),
    setComponent(DirectComp),
  ),
  // 组件类在前、string 在后: 组件类仍赢(rawConfig 比 defineType 晚执行)
  classBeatsStringOrder: v.pipe(
    v.string(),
    setComponent(DirectComp),
    setComponent('radio'),
  ),
  // wrapped 里直接传组件类
  wrappedClass: v.optional(v.pipe(v.string(), setComponent(DirectComp2))),
});

describe('setComponent 组件名解析', () => {
  it('类型层: setComponent 覆盖 schema 自身 type', () => {
    const a1: Equal<SchemaTypeAt<typeof Schema, ['radio1']>, 'radio'> = true;
    const a2: Equal<
      SchemaTypeAt<typeof Schema, ['nestedPipe']>,
      'inner'
    > = true;
    const a3: Equal<SchemaTypeAt<typeof Schema, ['lastWin']>, 'b'> = true;
    const a4: Equal<
      SchemaTypeAt<typeof Schema, ['wrapped']>,
      'inWrapped'
    > = true;
    expect([a1, a2, a3, a4]).toEqual([true, true, true, true]);
  });

  it('类型层: 没有 setComponent 时回落到 schema 自身 type', () => {
    const a1: Equal<SchemaTypeAt<typeof Schema, ['text1']>, 'string'> = true;
    const a2: Equal<
      SchemaTypeAt<typeof Schema, ['checkbox1']>,
      'boolean'
    > = true;
    expect([a1, a2]).toEqual([true, true]);
  });

  it('类型层: 不再停在 schema 自身 type 或首成员', () => {
    const a1: Equal<
      SchemaTypeAt<typeof Schema, ['radio1']>,
      'picklist'
    > = false;
    const a2: Equal<
      SchemaTypeAt<typeof Schema, ['nestedPipe']>,
      'string'
    > = false;
    const a3: Equal<SchemaTypeAt<typeof Schema, ['lastWin']>, 'a'> = false;
    const a4: Equal<SchemaTypeAt<typeof Schema, ['wrapped']>, 'string'> = false;
    expect([a1, a2, a3, a4]).toEqual([false, false, false, false]);
  });

  it('类型层: 多个 setComponent 取最后一个', () => {
    const a1: Equal<
      SchemaTypeAt<typeof Schema, ['multiWithActions']>,
      'm2'
    > = true;
    const a2: Equal<
      SchemaTypeAt<typeof Schema, ['multiReversed']>,
      'm3'
    > = true;
    const a3: Equal<SchemaTypeAt<typeof Schema, ['multiTriple']>, 't3'> = true;
    const a4: Equal<
      SchemaTypeAt<typeof Schema, ['nestedOverride']>,
      'nOuter'
    > = true;
    const a5: Equal<
      SchemaTypeAt<typeof Schema, ['nestedOnly']>,
      'nOnly'
    > = true;
    const a6: Equal<
      SchemaTypeAt<typeof Schema, ['wrappedOverride']>,
      'wOuter'
    > = true;
    expect([a1, a2, a3, a4, a5, a6]).toEqual([
      true,
      true,
      true,
      true,
      true,
      true,
    ]);
  });

  it('类型层: 多个 setComponent 时前面的都不算', () => {
    const a1: Equal<
      SchemaTypeAt<typeof Schema, ['multiWithActions']>,
      'm1'
    > = false;
    const a2: Equal<
      SchemaTypeAt<typeof Schema, ['multiReversed']>,
      'm4'
    > = false;
    const a3: Equal<SchemaTypeAt<typeof Schema, ['multiTriple']>, 't1'> = false;
    const a4: Equal<SchemaTypeAt<typeof Schema, ['multiTriple']>, 't2'> = false;
    const a5: Equal<
      SchemaTypeAt<typeof Schema, ['nestedOverride']>,
      'nInner'
    > = false;
    const a6: Equal<
      SchemaTypeAt<typeof Schema, ['wrappedOverride']>,
      'wInner'
    > = false;
    expect([a1, a2, a3, a4, a5, a6]).toEqual([
      false,
      false,
      false,
      false,
      false,
      false,
    ]);
  });

  it('类型层: setComponent 直接传组件类时原样带出', () => {
    const a1: Equal<
      ComponentKeyAt<typeof Schema, ['directClass']>,
      typeof DirectComp
    > = true;
    const a2: Equal<
      ComponentKeyAt<typeof Schema, ['classOverridesString']>,
      typeof DirectComp
    > = true;
    const a3: Equal<
      ComponentKeyAt<typeof Schema, ['classBeatsStringOrder']>,
      typeof DirectComp
    > = true;
    const a4: Equal<
      ComponentKeyAt<typeof Schema, ['wrappedClass']>,
      typeof DirectComp2
    > = true;
    expect([a1, a2, a3, a4]).toEqual([true, true, true, true]);
  });

  it('类型层: 组件类形态在 SchemaTypeAt 的 string 视图里落到 never', () => {
    const a1: Equal<SchemaTypeAt<typeof Schema, ['directClass']>, never> = true;
    const a2: Equal<
      SchemaTypeAt<typeof Schema, ['classOverridesString']>,
      never
    > = true;
    // string 形态不受影响
    const a3: Equal<SchemaTypeAt<typeof Schema, ['radio1']>, 'radio'> = true;
    const a4: Equal<
      SchemaTypeAt<typeof Schema, ['classBeatsStringOrder']>,
      never
    > = true;
    expect([a1, a2, a3, a4]).toEqual([true, true, true, true]);
  });

  it('运行时 type 与类型层推导一致', () => {
    // 把配置项的 type 回显成 key 本身, 这样 define().type 就是真正参与查表的组件名
    const resolved = createBuilder(Schema, {
      types: {
        string: { type: 'string' },
        boolean: { type: 'boolean' },
        radio: { type: 'radio' },
        inner: { type: 'inner' },
        a: { type: 'a' },
        b: { type: 'b' },
        inWrapped: { type: 'inWrapped' },
        m1: { type: 'm1' },
        m2: { type: 'm2' },
        m3: { type: 'm3' },
        m4: { type: 'm4' },
        t1: { type: 't1' },
        t2: { type: 't2' },
        t3: { type: 't3' },
        nInner: { type: 'nInner' },
        nOuter: { type: 'nOuter' },
        nOnly: { type: 'nOnly' },
        wInner: { type: 'wInner' },
        wOuter: { type: 'wOuter' },
      },
    });

    expect(resolved.get(['radio1'])?.define!().type).toBe('radio');
    expect(resolved.get(['text1'])?.define!().type).toBe('string');
    expect(resolved.get(['checkbox1'])?.define!().type).toBe('boolean');
    expect(resolved.get(['nestedPipe'])?.define!().type).toBe('inner');
    expect(resolved.get(['lastWin'])?.define!().type).toBe('b');
    expect(resolved.get(['wrapped'])?.define!().type).toBe('inWrapped');
    expect(resolved.get(['multiWithActions'])?.define!().type).toBe('m2');
    expect(resolved.get(['multiReversed'])?.define!().type).toBe('m3');
    expect(resolved.get(['multiTriple'])?.define!().type).toBe('t3');
    expect(resolved.get(['nestedOverride'])?.define!().type).toBe('nOuter');
    expect(resolved.get(['nestedOnly'])?.define!().type).toBe('nOnly');
    expect(resolved.get(['wrappedOverride'])?.define!().type).toBe('wOuter');
  });

  it('运行时: 组件类形态不查配置, 直接用组件本身', () => {
    const resolved = createBuilder(Schema, {
      types: { string: { type: 'string' }, radio: { type: 'radio' } },
    });

    expect(resolved.get(['directClass'])?.define!().type).toBe(DirectComp);
    expect(resolved.get(['classOverridesString'])?.define!().type).toBe(
      DirectComp,
    );
    expect(resolved.get(['classBeatsStringOrder'])?.define!().type).toBe(
      DirectComp,
    );
    expect(resolved.get(['wrappedClass'])?.define!().type).toBe(DirectComp2);
  });
});

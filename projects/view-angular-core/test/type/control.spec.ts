import * as v from 'valibot';
import {
  asControl,
  asVirtualGroup,
  setAlias,
  setComponent,
  isFieldControl,
  FieldArray,
  FieldControl,
  FieldGroup,
  FieldLogicGroup,
} from '@piying/view-angular-core';
import { createBuilder } from '../util/create-builder';
import {
  assertFieldArray,
  assertFieldControl,
  assertFieldGroup,
  assertFieldLogicGroup,
} from '../util/is-field';
import { Equal } from '../util/type-assert';

describe('控件类型细分(control)', () => {
  it('v.string() => FieldControl', () => {
    const result = createBuilder(v.string());
    const ctrl = result.form.control;
    type C = NonNullable<typeof ctrl>;
    // 根级 schema 精确: 必须为 FieldControl<string>
    const equal: Equal<C, FieldControl<string>> = true;
    assertFieldControl(result.form.control);
    expect(equal).toBe(true);
  });

  it('v.array(v.string()) => FieldArray', () => {
    const result = createBuilder(v.array(v.string()));
    const ctrl = result.form.control;
    type C = NonNullable<typeof ctrl>;
    const equal: Equal<C, FieldArray<string[]>> = true;
    assertFieldArray(result.form.control);
    expect(equal).toBe(true);
  });

  it('v.pipe(v.object({o1}), asControl()) => FieldControl', () => {
    const result = createBuilder(
      v.pipe(v.object({ o1: v.string() }), asControl()),
    );
    const ctrl = result.form.control;
    type C = NonNullable<typeof ctrl>;
    // 即使底层是 object, 配置 asControl 后仍为 FieldControl
    const equal: Equal<C, FieldControl<{ o1: string }>> = true;
    assertFieldControl(result.form.control);
    expect(equal).toBe(true);
  });

  it('v.pipe(v.intersect([...]), asVirtualGroup()) => FieldGroup', () => {
    const result = createBuilder(
      v.pipe(v.intersect([v.object({ o1: v.string() })]), asVirtualGroup()),
    );
    const ctrl = result.form.control;
    type C = NonNullable<typeof ctrl>;
    // 配置 asVirtualGroup 后 intersect 变为 FieldGroup
    const equal: Equal<C, FieldGroup<{ o1: string }>> = true;
    assertFieldGroup(result.form.control);
    expect(equal).toBe(true);
  });

  it('v.intersect([...]) => FieldLogicGroup', () => {
    const result = createBuilder(v.intersect([v.object({ o1: v.string() })]));
    const ctrl = result.form.control;
    type C = NonNullable<typeof ctrl>;
    // 无 asVirtualGroup 时 intersect 为 FieldLogicGroup
    const equal: Equal<C, FieldLogicGroup<{ o1: string }>> = true;
    assertFieldLogicGroup(result.form.control);
    expect(equal).toBe(true);
  });

  it('根 object 与 union 也按 schema 细分', () => {
    // 根为 object => FieldGroup
    const objResult = createBuilder(v.object({ key1: v.string() }));
    type ObjCtrl = NonNullable<typeof objResult.form.control>;
    const equalObj: Equal<ObjCtrl, FieldGroup<{ key1: string }>> = true;
    assertFieldGroup(objResult.form.control);
    expect(equalObj).toBe(true);

    // 根为 union => FieldLogicGroup
    const unionResult = createBuilder(v.union([v.string(), v.number()]));
    type UnionCtrl = NonNullable<typeof unionResult.form.control>;
    const equalUnion: Equal<UnionCtrl, FieldLogicGroup<string | number>> = true;
    assertFieldLogicGroup(unionResult.form.control);
    expect(equalUnion).toBe(true);
  });

  it('root 属性按根 schema 细分', () => {
    const result = createBuilder(v.object({ key1: v.string() }));
    const field = result.get(['key1'])!;
    const root = field.form.root;
    type RootCtrl = typeof root;
    // 子字段的 root 仍是根级 FieldGroup<{key1:string}>
    const equal: Equal<RootCtrl, FieldGroup<{ key1: string }>> = true;
    assertFieldGroup(field.form.root);
    expect(equal).toBe(true);
  });

  it('get 子字段 value 类型按 schema 细分(与演示一致)', () => {
    const result = createBuilder(
      v.object({
        // FieldControl
        k1: v.string(),
        // FieldArray
        k2: v.array(v.string()),
        // FieldControl
        k3: v.pipe(v.object({ o1: v.string() }), asControl()),
        // FieldGroup
        k4: v.pipe(
          v.intersect([v.object({ o1: v.string() })]),
          asVirtualGroup(),
        ),
        // FieldLogicGroup
        k5: v.intersect([v.object({ o1: v.string() })]),
      }),
    );
    // 初始化值, 触发字段构建
    result.form.control?.updateValue({
      k1: 'x',
      k2: ['a'],
      k3: { o1: 'a' },
      k4: { o1: 'a' },
      k5: { o1: 'a' },
    });
    const k1 = result.get(['k1'])!;
    const v1: string = k1.form.control!.value;
    // @ts-expect-error k1 的 value 不是 number
    const w1: number = k1.form.control!.value;

    const k2 = result.get(['k2'])!;
    const v2: string[] = k2.form.control!.value;

    const k3 = result.get(['k3'])!;
    const v3: { o1: string } = k3.form.control!.value;
    // @ts-expect-error k3 的 value 不是 string
    const w3: string = k3.form.control!.value;

    const k4 = result.get(['k4'])!;
    const v4: { o1: string } = k4.form.control!.value;

    const k5 = result.get(['k5'])!;
    const v5: { o1: string } = k5.form.control!.value;
    // @ts-expect-error k5 的 value 不是 number
    const w5: number = k5.form.control!.value;

    expect(v1).toBe('x');
    expect(v2).toEqual(['a']);
    expect(v3).toEqual({ o1: 'a' });
    expect(v4).toEqual({ o1: 'a' });
    expect(v5).toEqual({ o1: 'a' });
  });

  it('parent 属性按父级 schema 细分', () => {
    // 对象子字段: 父级为 FieldGroup<{key1:string}>
    const objResult = createBuilder(v.object({ key1: v.string() }));
    const objField = objResult.get(['key1'])!;
    type ObjParent = typeof objField.form.parent;
    const equalObj: Equal<ObjParent, FieldGroup<{ key1: string }>> = true;
    assertFieldGroup(objField.form.parent);
    expect(equalObj).toBe(true);

    // 嵌套子字段: 父级为 FieldGroup<{b:string}>
    const nested = createBuilder(v.object({ a: v.object({ b: v.string() }) }));
    const bField = nested.get(['a', 'b'])!;
    type NestedParent = typeof bField.form.parent;
    const equalNested: Equal<NestedParent, FieldGroup<{ b: string }>> = true;
    assertFieldGroup(bField.form.parent);
    expect(equalNested).toBe(true);

    // 数组元素: 父级为 FieldArray<string[]>
    const arrResult = createBuilder(v.object({ tags: v.array(v.string()) }));
    arrResult.form.control?.updateValue({ tags: ['a'] });
    const tagField = arrResult.get(['tags', 0])!;
    type ArrParent = typeof tagField.form.parent;
    const equalArr: Equal<ArrParent, FieldArray<string[]>> = true;
    assertFieldArray(tagField.form.parent);
    expect(equalArr).toBe(true);
  });
});

describe('嵌套 pipe 的 action 类型可见性(对齐运行时 schemaForEach)', () => {
  const obj = v.object({ x: v.string() });

  it('asControl 埋在内层 pipe 时, 类型仍为 FieldControl(与运行时一致)', () => {
    const nest = v.pipe(v.pipe(obj, asControl()), setComponent('c'));
    const deep = v.pipe(
      v.pipe(v.pipe(obj, asControl()), setComponent('c')),
      setComponent('d'),
    );
    const b = createBuilder(v.object({ nest, deep }));
    b.form.control?.updateValue({ nest: { x: '1' }, deep: { x: '2' } });

    const n: FieldControl<{ x: string }> = b.get(['nest'])!.form.control!;
    const d: FieldControl<{ x: string }> = b.get(['deep'])!.form.control!;

    expect(isFieldControl(b.get(['nest'])!.form.control)).toBe(true);
    expect(isFieldControl(b.get(['deep'])!.form.control)).toBe(true);
    expect([n, d]).toBeTruthy();
  });

  it('未标 asControl 时仍是 FieldGroup(未被误判)', () => {
    const b = createBuilder(v.object({ plain: obj }));
    b.form.control?.updateValue({ plain: { x: '1' } });
    expect(isFieldControl(b.get(['plain'])!.form.control)).toBe(false);
  });
});

describe('嵌套 pipe 的别名可见性', () => {
  it('setAlias 埋在内层 pipe 时, @alias 仍解析到正确字段', () => {
    const nest = v.pipe(v.pipe(v.string(), setAlias('aa')), setComponent('c'));
    const b = createBuilder(v.object({ a: nest }));
    b.form.control?.updateValue({ a: 'hello' });

    const viaAlias = b.get(['@aa'])!;
    const viaKey = b.get(['a'])!;
    const val: string = viaAlias.form.control!.value;

    expect(viaAlias.keyPath).toEqual(viaKey.keyPath);
    expect(val).toBe('hello');
  });
});

describe('asControl 在 wrapped 链中的可见性(对齐运行时 schemaForEach)', () => {
  const obj = v.object({ x: v.string() });

  it('optional / nullable 包裹 asControl, 类型仍为 FieldControl', () => {
    const b = createBuilder(
      v.object({
        w1: v.optional(v.pipe(obj, asControl())),
        w2: v.pipe(v.optional(v.pipe(obj, asControl())), setComponent('c')),
        w3: v.optional(v.nullable(v.pipe(obj, asControl()))),
        w4: v.pipe(
          v.optional(v.nullable(v.pipe(obj, asControl()))),
          setComponent('c'),
        ),
      }),
    );

    const w1: FieldControl<{ x: string } | undefined> = b.get(['w1'])!.form
      .control!;
    const w2: FieldControl<{ x: string } | undefined> = b.get(['w2'])!.form
      .control!;
    const w3: FieldControl<{ x: string } | null | undefined> = b.get(['w3'])!
      .form.control!;
    const w4: FieldControl<{ x: string } | null | undefined> = b.get(['w4'])!
      .form.control!;

    expect(isFieldControl(b.get(['w1'])!.form.control)).toBe(true);
    expect(isFieldControl(b.get(['w2'])!.form.control)).toBe(true);
    expect(isFieldControl(b.get(['w3'])!.form.control)).toBe(true);
    expect(isFieldControl(b.get(['w4'])!.form.control)).toBe(true);
    expect([w1, w2, w3, w4]).toBeTruthy();
  });

  it('pipe 任意深度 asControl 仍为 FieldControl', () => {
    const deep = v.pipe(
      v.pipe(
        v.pipe(v.pipe(obj, asControl()), setComponent('c')),
        setComponent('d'),
      ),
      setComponent('e'),
    );
    const b = createBuilder(v.object({ deep }));
    const d: FieldControl<{ x: string }> = b.get(['deep'])!.form.control!;
    expect(isFieldControl(b.get(['deep'])!.form.control)).toBe(true);
    expect(d).toBeTruthy();
  });
});

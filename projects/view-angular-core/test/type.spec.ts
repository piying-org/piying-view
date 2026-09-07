import * as v from 'valibot';
import { of, map, pipe as rxPipe } from 'rxjs';
import {
  _PiResolvedCommonViewFieldConfig,
  asControl,
  asVirtualGroup,
  formConfig,
  setAlias,
  FieldArray,
  FieldControl,
  FieldGroup,
  FieldLogicGroup,
} from '@piying/view-angular-core';
import { createBuilder } from './util/create-builder';
import { getField } from './util/action';
import {
  assertFieldArray,
  assertFieldControl,
  assertFieldGroup,
  assertFieldLogicGroup,
} from './util/is-field';

/** 类型工具: 判断是否为 any */
type IsAny<T> = 0 extends 1 & T ? true : false;
/** 类型工具: 判断是否为 unknown */
type IsUnknown<T> = unknown extends T
  ? IsAny<T> extends true
    ? false
    : true
  : false;
/** 类型工具: 判断两个类型是否完全相等 */
type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false;

/** 构建一个 key1 字段并返回解析后的 field */
async function makeKeyField<Value = any>(
  fieldSchema: (
    field$: PromiseWithResolvers<_PiResolvedCommonViewFieldConfig<Value>>,
  ) => v.BaseSchema<any, any, any>,
) {
  const field$ =
    Promise.withResolvers<_PiResolvedCommonViewFieldConfig<Value>>();
  const result = createBuilder(v.object({ key1: fieldSchema(field$) }));
  result.form.control?.updateValue({ key1: '5' });
  return await field$.promise;
}

describe('强类型推断', () => {
  it('get([key]) 强类型返回对应字段', () => {
    const result = createBuilder(v.object({ key1: v.string() }));
    const key1Field = result.get(['key1']);
    // 运行时: 字段应能查询到
    expect(key1Field).toBeDefined();
    if (key1Field) {
      // get(['key1']) 应返回 value 类型为 string 的字段
      const value = key1Field.form.control!.value;
      let xxx: string = value;
      const equal: Equal<typeof value, string> = true;
      // @ts-expect-error get(['key1']) 的 value 不是 number
      let wrong: number = value;
      expect(equal).toBe(true);
    }
  });

  it('get([a, b]) 嵌套强类型返回对应字段', () => {
    const result = createBuilder(v.object({ a: v.object({ b: v.string() }) }));
    const bField = result.get(['a', 'b']);
    expect(bField).toBeDefined();
    if (bField) {
      const value = bField.form.control!.value;
      let xxx: string = value;
      const equal: Equal<typeof value, string> = true;
      // @ts-expect-error get(['a','b']) 的 value 不是 number
      let wrong: number = value;
      expect(equal).toBe(true);
    }
  });

  it('get 经过数组下标(数字) 强类型返回对象元素字段', () => {
    const result = createBuilder(
      v.object({
        key1: v.array(v.object({ sub: v.string() })),
      }),
    );
    // 先设置数组值, 触发数组元素(restChildren)构建
    result.form.control?.updateValue({ key1: [{ sub: 'x' }] });
    // 中间一级是数组, 通过数字下标 0 定位元素再取 sub
    const subField = result.get(['key1', 0, 'sub']);
    expect(subField).toBeDefined();
    if (subField) {
      const value = subField.form.control!.value;
      let xxx: string = value;
      const equal: Equal<typeof value, string> = true;
      // @ts-expect-error 数组元素字段 sub 的 value 不是 number
      let wrong: number = value;
      expect(equal).toBe(true);
    }
  });

  it('get 数组下标(数字) 强类型返回数组元素', () => {
    const result = createBuilder(v.object({ tags: v.array(v.string()) }));
    // 先设置数组值, 触发数组元素(restChildren)构建
    result.form.control?.updateValue({ tags: ['a'] });
    // 通过数字下标 0 取数组元素
    const tagField = result.get(['tags', 0]);
    expect(tagField).toBeDefined();
    if (tagField) {
      const value = tagField.form.control!.value;
      let xxx: string = value;
      const equal: Equal<typeof value, string> = true;
      // @ts-expect-error 数组元素 value 不是 number
      let wrong: number = value;
      expect(equal).toBe(true);
    }
  });

  it('get 存在 intersect 层: 通过数字下标取成员字段(强类型)', () => {
    const result = createBuilder(
      v.object({
        key1: v.intersect([
          v.object({ a: v.string() }),
          v.object({ b: v.number() }),
        ]),
      }),
    );
    // 先设置值, 触发字段构建
    result.form.control?.updateValue({ key1: { a: 'x', b: 1 } });
    // intersect 层的成员按数字下标 0/1 存放, 再进入成员对象取字段
    const aField = result.get(['key1', 0, 'a']);
    expect(aField).toBeDefined();
    if (aField) {
      const value = aField.form.control!.value;
      let xxx: string = value;
      const equal: Equal<typeof value, string> = true;
      const notAny: IsAny<typeof value> = false;
      // @ts-expect-error intersect 第 0 个成员的 a 字段是 string 不是 number
      let wrong: number = value;
      expect(equal).toBe(true);
      expect(notAny).toBe(false);
    }
    const bField = result.get(['key1', 1, 'b']);
    expect(bField).toBeDefined();
    if (bField) {
      const value = bField.form.control!.value;
      let xxx: number = value;
      const equal: Equal<typeof value, number> = true;
      const notAny: IsAny<typeof value> = false;
      // @ts-expect-error intersect 第 1 个成员的 b 字段是 number 不是 string
      let wrong: string = value;
      expect(equal).toBe(true);
      expect(notAny).toBe(false);
    }
  });

  it('get 多层 intersect: 数字下标逐层取字段(强类型)', () => {
    const result = createBuilder(
      v.object({
        key1: v.intersect([
          v.intersect([v.object({ a: v.string() })]),
          v.object({ b: v.number() }),
        ]),
      }),
    );
    result.form.control?.updateValue({ key1: { a: 'x', b: 1 } });
    // key1(intersect) -> 0(内层 intersect) -> 0(对象) -> a
    const aField = result.get(['key1', 0, 0, 'a']);
    expect(aField).toBeDefined();
    if (aField) {
      const value = aField.form.control!.value;
      let xxx: string = value;
      const equal: Equal<typeof value, string> = true;
      // @ts-expect-error 多层 intersect 内层 a 是 string 不是 number
      let wrong: number = value;
      expect(equal).toBe(true);
    }
    // key1(intersect) -> 1(对象) -> b
    const bField = result.get(['key1', 1, 'b']);
    expect(bField).toBeDefined();
    if (bField) {
      const value = bField.form.control!.value;
      let xxx: number = value;
      const equal: Equal<typeof value, number> = true;
      // @ts-expect-error 多层 intersect 外层 b 是 number 不是 string
      let wrong: string = value;
      expect(equal).toBe(true);
    }
  });

  it('get intersect 包 union: 数字下标跨层取字段(强类型)', () => {
    const result = createBuilder(
      v.object({
        key1: v.intersect([
          v.union([v.object({ a: v.string() }), v.object({ c: v.boolean() })]),
          v.object({ b: v.number() }),
        ]),
      }),
    );
    result.form.control?.updateValue({ key1: { a: 'x', b: 1 } });
    // key1(intersect) -> 0(union) -> 0(对象) -> a
    const aField = result.get(['key1', 0, 0, 'a']);
    expect(aField).toBeDefined();
    if (aField) {
      const value = aField.form.control!.value;
      let xxx: string = value;
      const equal: Equal<typeof value, string> = true;
      // @ts-expect-error intersect-union 内层 a 是 string 不是 number
      let wrong: number = value;
      expect(equal).toBe(true);
    }
    // key1(intersect) -> 0(union) -> 1(对象) -> c
    const cField = result.get(['key1', 0, 1, 'c']);
    expect(cField).toBeDefined();
    if (cField) {
      const value = cField.form.control!.value;
      let xxx: boolean = value;
      const equal: Equal<typeof value, boolean> = true;
      // @ts-expect-error intersect-union 内层 c 是 boolean 不是 string
      let wrong: string = value;
      expect(equal).toBe(true);
    }
    // key1(intersect) -> 1(对象) -> b
    const bField = result.get(['key1', 1, 'b']);
    expect(bField).toBeDefined();
    if (bField) {
      const value = bField.form.control!.value;
      let xxx: number = value;
      const equal: Equal<typeof value, number> = true;
      // @ts-expect-error intersect-union 外层 b 是 number 不是 string
      let wrong: string = value;
      expect(equal).toBe(true);
    }
  });

  it('get 根级 intersect 包 union: 数字下标取字段(强类型)', () => {
    const result = createBuilder(
      v.intersect([
        v.union([v.object({ d: v.number() })]),
        v.object({ e: v.string() }),
      ]),
    );
    result.form.control?.updateValue({ d: 1, e: 'y' });
    // 根(intersect) -> 0(union) -> 0(对象) -> d
    const dField = result.get([0, 0, 'd']);
    expect(dField).toBeDefined();
    if (dField) {
      const value = dField.form.control!.value;
      let xxx: number = value;
      const equal: Equal<typeof value, number> = true;
      // @ts-expect-error 根级 intersect-union 的 d 是 number 不是 string
      let wrong: string = value;
      expect(equal).toBe(true);
    }
    // 根(intersect) -> 1(对象) -> e
    const eField = result.get([1, 'e']);
    expect(eField).toBeDefined();
    if (eField) {
      const value = eField.form.control!.value;
      let xxx: string = value;
      const equal: Equal<typeof value, string> = true;
      // @ts-expect-error 根级 intersect-union 的 e 是 string 不是 number
      let wrong: number = value;
      expect(equal).toBe(true);
    }
  });

  it('get([#]) 返回根级字段(强类型)', () => {
    const result = createBuilder(v.object({ key1: v.string() }));
    const key1Field = result.get(['key1']);
    expect(key1Field).toBeDefined();
    if (key1Field) {
      // 从子级调用 get(['#']) 返回根级字段
      const rootField = key1Field.get(['#']);
      expect(rootField).toBeDefined();
      if (rootField) {
        // 根级 value 类型 = {key1: string}
        const value = rootField.form.control!.value;
        let xxx: { key1: string } = value;
        const equal: Equal<typeof value, { key1: string }> = true;
        // @ts-expect-error 根级 value 不是 number
        let wrong: number = value;
        expect(equal).toBe(true);
      }
    }
  });

  it('get([#, key]) 从根级查询子字段(强类型)', () => {
    const result = createBuilder(v.object({ key1: v.string() }));
    const key1Field = result.get(['key1']);
    if (key1Field) {
      // 从子级 get(['#', 'key1']) 等价于从根级查询 key1
      const rootKey1 = key1Field.get(['#', 'key1']);
      expect(rootKey1).toBeDefined();
      if (rootKey1) {
        const value = rootKey1.form.control!.value;
        let xxx: string = value;
        const equal: Equal<typeof value, string> = true;
        // @ts-expect-error 根级 key1 的 value 不是 number
        let wrong: number = value;
        expect(equal).toBe(true);
      }
    }
  });

  it('get([..]) 退回父级字段(强类型)', () => {
    const result = createBuilder(v.object({ a: v.object({ b: v.string() }) }));
    const bField = result.get(['a', 'b']);
    expect(bField).toBeDefined();
    if (bField) {
      // 从 b 字段 get(['..']) 退回父级 a 字段
      const parentField = bField.get(['..']);
      expect(parentField).toBeDefined();
      if (parentField) {
        // 父级 a 的 value 类型 = {b: string}
        const value = parentField.form.control!.value;
        let xxx: { b: string } = value;
        const equal: Equal<typeof value, { b: string }> = true;
        // @ts-expect-error 父级 a 的 value 不是 string
        let wrong: string = value;
        expect(equal).toBe(true);
      }
    }
  });

  it('get([@alias]) 通过别名返回对应字段(强类型)', () => {
    const result = createBuilder(
      v.object({
        key1: v.pipe(v.string(), setAlias('a')),
        key2: v.pipe(v.number(), setAlias('b')),
      }),
    );
    // get(['@a']) 返回别名为 'a' 的字段(key1), value 类型 string
    const aField = result.get(['@a']);
    expect(aField).toBeDefined();
    if (aField) {
      const value = aField.form.control!.value;
      let xxx: string = value;
      const equal: Equal<typeof value, string> = true;
      // @ts-expect-error @a 的 value 不是 number
      let wrong: number = value;
      expect(equal).toBe(true);
    }
    // get(['@b']) 返回别名为 'b' 的字段(key2), value 类型 number
    const bField = result.get(['@b']);
    expect(bField).toBeDefined();
    if (bField) {
      const value = bField.form.control!.value;
      let xxx: number = value;
      const equal: Equal<typeof value, number> = true;
      // @ts-expect-error @b 的 value 不是 string
      let wrong: string = value;
      expect(equal).toBe(true);
    }
  });

  it('根对象: form.control.value 精确推断为对象类型', () => {
    const result = createBuilder(v.object({ key1: v.string() }));
    const value = result.form.control!.value;
    // 正例: 正确类型可赋值
    let xxx: { key1: string } = value;
    // 类型完全相等(既不是 any 也不是 unknown, 也不是更宽的类型)
    const equal: Equal<typeof value, { key1: string }> = true;
    const notAny: IsAny<typeof value> = false;
    const notUnknown: IsUnknown<typeof value> = false;
    // 反例: 错误类型赋值必须报错
    // @ts-expect-error value 不是 number
    let wrong: number = value;
    expect(equal).toBe(true);
    expect(notAny).toBe(false);
    expect(notUnknown).toBe(false);
  });

  it('根pipe: 推断 v.transform 之后的输出类型', () => {
    const result = createBuilder(
      v.pipe(
        v.string(),
        v.transform((input) => Number(input)),
      ),
    );
    const value = result.form.control!.value;
    let xxx: number = value;
    const equal: Equal<typeof value, number> = true;
    const notAny: IsAny<typeof value> = false;
    // @ts-expect-error value 不是 string
    let wrong: string = value;
    expect(equal).toBe(true);
    expect(notAny).toBe(false);
  });

  it('根array: 推断数组类型', () => {
    const result = createBuilder(v.pipe(v.array(v.string())));
    const value = result.form.control!.value;
    let xxx: string[] = value;
    const equal: Equal<typeof value, string[]> = true;
    const notAny: IsAny<typeof value> = false;
    // @ts-expect-error value 不是 string
    let wrong: string = value;
    expect(equal).toBe(true);
    expect(notAny).toBe(false);
  });

  it('根tuple: 推断元组类型', () => {
    const result = createBuilder(v.pipe(v.tuple([v.string(), v.number()])));
    const value = result.form.control!.value;
    let xxx: [string, number] = value;
    const equal: Equal<typeof value, [string, number]> = true;
    // @ts-expect-error 元组顺序相反则报错
    let wrong: [number, string] = value;
    expect(equal).toBe(true);
  });

  it('根union: 推断联合类型', () => {
    const result = createBuilder(v.union([v.string(), v.number()]));
    const value = result.form.control!.value;
    let xxx: string | number = value;
    const equal: Equal<typeof value, string | number> = true;
    // @ts-expect-error value 不是 boolean
    let wrong: boolean = value;
    expect(equal).toBe(true);
  });

  it('根nullable: 推断可空类型', () => {
    const result = createBuilder(v.nullable(v.string()));
    const value = result.form.control!.value;
    let xxx: string | null = value;
    const equal: Equal<typeof value, string | null> = true;
    // @ts-expect-error 不能赋给非空 string
    let wrong: string = value;
    expect(equal).toBe(true);
  });

  it('getField捕获的子字段: 推断单个字段类型', async () => {
    const field$ =
      Promise.withResolvers<_PiResolvedCommonViewFieldConfig<string>>();
    const obj = v.object({
      key1: v.pipe(v.string(), getField(field$)),
    });
    const result = createBuilder(obj);
    result.form.control?.updateValue({ key1: '1' });
    const field = await field$.promise;
    const value = field.form.control!.value;
    let xxx: string = value;
    expect(xxx).toBe('1');
    const notAny: IsAny<typeof value> = false;
    // @ts-expect-error value 不是 number
    let wrong: number = value;
    expect(notAny).toBe(false);
  });

  it('getField捕获的group子字段: 推断子对象类型', async () => {
    const field$ =
      Promise.withResolvers<
        _PiResolvedCommonViewFieldConfig<{ sub: number }>
      >();
    const obj = v.object({
      key1: v.pipe(v.object({ sub: v.number() }), getField(field$)),
    });
    const result = createBuilder(obj);
    result.form.control?.updateValue({ key1: { sub: 1 } });
    const field = await field$.promise;
    const value = field.form.control!.value;
    let xxx: { sub: number } = value;
    expect(xxx).toEqual({ sub: 1 });
    // @ts-expect-error 子字段类型必须精确匹配
    let wrong: { sub: string } = value;
  });

  it('formConfig pipe.toModel 不影响最终输出类型(以schema为准)', async () => {
    const field$ =
      Promise.withResolvers<_PiResolvedCommonViewFieldConfig<string>>();
    const obj = v.object({
      key1: v.pipe(
        v.string(),
        getField(field$),
        formConfig({
          pipe: { toModel: () => of('model-value') },
        }),
      ),
    });
    const result = createBuilder(obj);
    result.form.control?.updateValue({ key1: 'view' });
    const field = await field$.promise;
    // 最终值类型仍是 schema 的输出类型 string
    const value = field.form.control!.value;
    let xxx: string = value;
    const notAny: IsAny<typeof value> = false;
    // @ts-expect-error 即使配置了 toModel, 类型仍为 string
    let wrong: number = value;
    expect(notAny).toBe(false);
  });

  it('transformer.toModel 不影响最终输出类型(以schema为准)', async () => {
    const field$ =
      Promise.withResolvers<_PiResolvedCommonViewFieldConfig<string>>();
    const obj = v.object({
      key1: v.pipe(
        v.string(),
        getField(field$),
        formConfig({
          transformer: { toModel: (value) => String(value) },
        }),
      ),
    });
    const result = createBuilder(obj);
    result.form.control?.updateValue({ key1: 'view' });
    const field = await field$.promise;
    const value = field.form.control!.value;
    let xxx: string = value;
    const notAny: IsAny<typeof value> = false;
    // @ts-expect-error 即使配置了 transformer, 类型仍为 string
    let wrong: number = value;
    expect(notAny).toBe(false);
  });

  describe('混合转换优先级 (pipe.toModel / transformer.toModel / v.transform)', () => {
    it('三者都设置: v.transform(最高) 决定最终类型', async () => {
      const field = await makeKeyField<number>((field$) =>
        v.pipe(
          v.string(),
          getField(field$),
          formConfig({
            pipe: { toModel: rxPipe(map((x) => String(x))) },
            transformer: { toModel: (x) => String(x) },
          }),
          // 最高优先级: string -> number
          v.transform((s) => Number(s)),
        ),
      );
      const value = field.form.control!.value;
      // 最终类型 = v.transform 输出 => number
      let xxx: number = value;
      const equal: Equal<typeof value, number> = true;
      const notAny: IsAny<typeof value> = false;
      // @ts-expect-error 最终类型是 number 不是 string
      let wrong: string = value;
      expect(equal).toBe(true);
      expect(notAny).toBe(false);
    });

    it('v.transform + pipe.toModel(无 transformer.toModel)', async () => {
      const field = await makeKeyField<boolean>((field$) =>
        v.pipe(
          v.string(),
          getField(field$),
          formConfig({
            pipe: { toModel: rxPipe(map((x) => String(x))) },
          }),
          v.transform((s) => s === '1'), // string -> boolean
        ),
      );
      const value = field.form.control!.value;
      let xxx: boolean = value;
      const equal: Equal<typeof value, boolean> = true;
      // @ts-expect-error 最终类型是 boolean 不是 number
      let wrong: number = value;
      expect(equal).toBe(true);
    });

    it('v.transform + transformer.toModel(无 pipe.toModel)', async () => {
      const field = await makeKeyField<number>((field$) =>
        v.pipe(
          v.string(),
          getField(field$),
          formConfig({
            transformer: { toModel: (x) => String(x) },
          }),
          v.transform((s) => s.length), // string -> number
        ),
      );
      const value = field.form.control!.value;
      let xxx: number = value;
      const equal: Equal<typeof value, number> = true;
      // @ts-expect-error 最终类型是 number 不是 string
      let wrong: string = value;
      expect(equal).toBe(true);
    });

    it('pipe.toModel 类型被 formConfig 泛型强制为 schema 输入类型', () => {
      // pipe.toModel 返回 Observable<number>, 而 schema 输入是 string => 编译报错
      createBuilder(
        v.pipe(
          v.string(),
          // @ts-expect-error pipe.toModel 类型必须匹配 schema 输入 string
          formConfig({
            pipe: { toModel: rxPipe(map((x) => Number(x))) },
          }),
        ),
      );
      expect(true).toBe(true);
    });

    it('pipe.toModel + transformer.toModel(无 v.transform): 最终类型以 schema 为准', async () => {
      const field = await makeKeyField<string>((field$) =>
        v.pipe(
          // schema 输出为 string
          v.string(),
          getField(field$),
          formConfig<string>({
            pipe: {
              toModel: rxPipe(map((x) => Number(x))) as any,
            },
            transformer: { toModel: (x) => String(x) },
          }),
        ),
      );
      const value = field.form.control!.value;
      // 最终类型 = schema 输出 = string
      let xxx: string = value;
      const equal: Equal<typeof value, string> = true;
      // @ts-expect-error 最终类型是 string 不是 number
      let wrong: number = value;
      expect(equal).toBe(true);
    });

    it('transformer 产出不同类型时, 最终类型仍以 schema 为准', async () => {
      const field = await makeKeyField<string>((field$) =>
        v.pipe(
          v.string(),
          getField(field$),
          formConfig({
            pipe: { toModel: rxPipe(map((x) => String(x))) },
            // transformer.toModel 产出 number, 但 schema(v.string) 会拒绝它
            transformer: { toModel: (x) => Number(x) },
          }),
        ),
      );
      const value = field.form.control!.value;
      // 最终类型仍是 schema 输出 string(不是 transformer 的 number)
      let xxx: string = value;
      const equal: Equal<typeof value, string> = true;
      // @ts-expect-error 最终类型是 string, 不是 transformer 产出的 number
      let wrong: number = value;
      expect(equal).toBe(true);
    });

    it('pipe.toModel 先于 transformer.toModel 执行(运行时)', async () => {
      const field = await makeKeyField<string>((field$) =>
        v.pipe(
          v.string(),
          getField(field$),
          formConfig({
            // pipe.toModel 最先执行: '5' -> 'pipe:5'
            pipe: { toModel: rxPipe(map((x) => 'pipe:' + String(x))) },
            // transformer.toModel 其次执行: 'pipe:5' -> 'transformer:pipe:5'
            transformer: { toModel: (x) => 'transformer:' + x },
          }),
        ),
      );
      assertFieldControl(field.form.control);
      field.form.control.viewValueChange('5' as any);
      // transformer 的输出包含 pipe 的输出 => 证明 pipe 先执行
      expect(field.form.control.value).toBe('transformer:pipe:5');
    });

    it('三者都设置: 运行时优先级验证(v.transform 最高)', async () => {
      const field = await makeKeyField<number>((field$) =>
        v.pipe(
          v.string(),
          getField(field$),
          formConfig({
            // pipe.toModel 最先执行: '5' -> '5'
            pipe: { toModel: rxPipe(map((x) => String(x))) },
            // transformer.toModel 其次执行
            transformer: { toModel: (x) => String(x) },
          }),
          v.transform((s) => Number(s)),
        ),
      );
      assertFieldControl(field.form.control);
      // 走 view 变更管道(view 值类型为 string, 而 control 泛型为模型类型 number)
      field.form.control.viewValueChange('5' as any);
      // pipe.toModel: '5' -> '5'; transformer.toModel: '5' -> '5'; v.transform: Number('5') = 5
      expect(field.form.control.value).toBe(5);
    });
  });
});

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
    let v1: string = k1.form.control!.value;
    // @ts-expect-error k1 的 value 不是 number
    let w1: number = k1.form.control!.value;

    const k2 = result.get(['k2'])!;
    let v2: string[] = k2.form.control!.value;

    const k3 = result.get(['k3'])!;
    let v3: { o1: string } = k3.form.control!.value;
    // @ts-expect-error k3 的 value 不是 string
    let w3: string = k3.form.control!.value;

    const k4 = result.get(['k4'])!;
    let v4: { o1: string } = k4.form.control!.value;

    const k5 = result.get(['k5'])!;
    let v5: { o1: string } = k5.form.control!.value;
    // @ts-expect-error k5 的 value 不是 number
    let w5: number = k5.form.control!.value;

    expect(v1).toBe('x');
    expect(v2).toEqual(['a']);
    expect(v3).toEqual({ o1: 'a' });
    expect(v4).toEqual({ o1: 'a' });
    expect(v5).toEqual({ o1: 'a' });
  });
});

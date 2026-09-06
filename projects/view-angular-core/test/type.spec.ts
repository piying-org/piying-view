import * as v from 'valibot';
import { of, map, pipe as rxPipe } from 'rxjs';
import {
  _PiResolvedCommonViewFieldConfig,
  formConfig,
} from '@piying/view-angular-core';
import { createBuilder } from './util/create-builder';
import { getField } from './util/action';
import { assertFieldControl } from './util/is-field';

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
    field$: PromiseWithResolvers<
      _PiResolvedCommonViewFieldConfig<Value>
    >,
  ) => v.BaseSchema<any, any, any>,
) {
  const field$ = Promise.withResolvers<
    _PiResolvedCommonViewFieldConfig<Value>
  >();
  const result = createBuilder(v.object({ key1: fieldSchema(field$) }));
  result.form.control?.updateValue({ key1: '5' });
  return await field$.promise;
}

describe('强类型推断', () => {
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
    const field$ = Promise.withResolvers<
      _PiResolvedCommonViewFieldConfig<string>
    >();
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
    const field$ = Promise.withResolvers<
      _PiResolvedCommonViewFieldConfig<{ sub: number }>
    >();
    const obj = v.object({
      key1: v.pipe(
        v.object({ sub: v.number() }),
        getField(field$),
      ),
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
    const field$ = Promise.withResolvers<
      _PiResolvedCommonViewFieldConfig<string>
    >();
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
    const field$ = Promise.withResolvers<
      _PiResolvedCommonViewFieldConfig<string>
    >();
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
          formConfig({
            // pipe.toModel 类型被 formConfig 强制为 schema 输入 string
            pipe: { toModel: rxPipe(map((x) => String(x))) },
            // transformer.toModel 产出 string 才能通过 schema 校验
            transformer: { toModel: (x) => String(x) },
          }),
        ),
      );
      const value = field.form.control!.value;
      // 最终类型 = schema 输出 = string
      // (即便 transformer 产出其他类型, schema 会拒绝它, 类型仍是 schema 输出)
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

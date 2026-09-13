import * as v from 'valibot';
import { setAlias } from '@piying/view-angular-core';
import { createBuilder } from '../util/create-builder';
import { Equal, IsAny } from '../util/type-assert';

describe('强类型推断: get 路径查询', () => {
  it('get([key]) 强类型返回对应字段', () => {
    const result = createBuilder(v.object({ key1: v.string() }));
    const key1Field = result.get(['key1']);
    // 运行时: 字段应能查询到
    expect(key1Field).toBeDefined();
    if (key1Field) {
      // get(['key1']) 应返回 value 类型为 string 的字段
      const value = key1Field.form.control!.value;
      const xxx: string = value;
      const equal: Equal<typeof value, string> = true;
      // @ts-expect-error get(['key1']) 的 value 不是 number
      const wrong: number = value;
      expect(equal).toBe(true);
    }
  });

  it('get([a, b]) 嵌套强类型返回对应字段', () => {
    const result = createBuilder(v.object({ a: v.object({ b: v.string() }) }));
    const bField = result.get(['a', 'b']);
    expect(bField).toBeDefined();
    if (bField) {
      const value = bField.form.control!.value;
      const xxx: string = value;
      const equal: Equal<typeof value, string> = true;
      // @ts-expect-error get(['a','b']) 的 value 不是 number
      const wrong: number = value;
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
      const xxx: string = value;
      const equal: Equal<typeof value, string> = true;
      // @ts-expect-error 数组元素字段 sub 的 value 不是 number
      const wrong: number = value;
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
      const xxx: string = value;
      const equal: Equal<typeof value, string> = true;
      // @ts-expect-error 数组元素 value 不是 number
      const wrong: number = value;
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
      const xxx: string = value;
      const equal: Equal<typeof value, string> = true;
      const notAny: IsAny<typeof value> = false;
      // @ts-expect-error intersect 第 0 个成员的 a 字段是 string 不是 number
      const wrong: number = value;
      expect(equal).toBe(true);
      expect(notAny).toBe(false);
    }
    const bField = result.get(['key1', 1, 'b']);
    expect(bField).toBeDefined();
    if (bField) {
      const value = bField.form.control!.value;
      const xxx: number = value;
      const equal: Equal<typeof value, number> = true;
      const notAny: IsAny<typeof value> = false;
      // @ts-expect-error intersect 第 1 个成员的 b 字段是 number 不是 string
      const wrong: string = value;
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
      const xxx: string = value;
      const equal: Equal<typeof value, string> = true;
      // @ts-expect-error 多层 intersect 内层 a 是 string 不是 number
      const wrong: number = value;
      expect(equal).toBe(true);
    }
    // key1(intersect) -> 1(对象) -> b
    const bField = result.get(['key1', 1, 'b']);
    expect(bField).toBeDefined();
    if (bField) {
      const value = bField.form.control!.value;
      const xxx: number = value;
      const equal: Equal<typeof value, number> = true;
      // @ts-expect-error 多层 intersect 外层 b 是 number 不是 string
      const wrong: string = value;
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
      const xxx: string = value;
      const equal: Equal<typeof value, string> = true;
      // @ts-expect-error intersect-union 内层 a 是 string 不是 number
      const wrong: number = value;
      expect(equal).toBe(true);
    }
    // key1(intersect) -> 0(union) -> 1(对象) -> c
    const cField = result.get(['key1', 0, 1, 'c']);
    expect(cField).toBeDefined();
    if (cField) {
      const value = cField.form.control!.value;
      const xxx: boolean = value;
      const equal: Equal<typeof value, boolean> = true;
      // @ts-expect-error intersect-union 内层 c 是 boolean 不是 string
      const wrong: string = value;
      expect(equal).toBe(true);
    }
    // key1(intersect) -> 1(对象) -> b
    const bField = result.get(['key1', 1, 'b']);
    expect(bField).toBeDefined();
    if (bField) {
      const value = bField.form.control!.value;
      const xxx: number = value;
      const equal: Equal<typeof value, number> = true;
      // @ts-expect-error intersect-union 外层 b 是 number 不是 string
      const wrong: string = value;
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
      const xxx: number = value;
      const equal: Equal<typeof value, number> = true;
      // @ts-expect-error 根级 intersect-union 的 d 是 number 不是 string
      const wrong: string = value;
      expect(equal).toBe(true);
    }
    // 根(intersect) -> 1(对象) -> e
    const eField = result.get([1, 'e']);
    expect(eField).toBeDefined();
    if (eField) {
      const value = eField.form.control!.value;
      const xxx: string = value;
      const equal: Equal<typeof value, string> = true;
      // @ts-expect-error 根级 intersect-union 的 e 是 string 不是 number
      const wrong: number = value;
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
        const xxx: { key1: string } = value;
        const equal: Equal<typeof value, { key1: string }> = true;
        // @ts-expect-error 根级 value 不是 number
        const wrong: number = value;
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
        const xxx: string = value;
        const equal: Equal<typeof value, string> = true;
        // @ts-expect-error 根级 key1 的 value 不是 number
        const wrong: number = value;
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
        const xxx: { b: string } = value;
        const equal: Equal<typeof value, { b: string }> = true;
        // @ts-expect-error 父级 a 的 value 不是 string
        const wrong: string = value;
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
      const xxx: string = value;
      const equal: Equal<typeof value, string> = true;
      // @ts-expect-error @a 的 value 不是 number
      const wrong: number = value;
      expect(equal).toBe(true);
    }
    // get(['@b']) 返回别名为 'b' 的字段(key2), value 类型 number
    const bField = result.get(['@b']);
    expect(bField).toBeDefined();
    if (bField) {
      const value = bField.form.control!.value;
      const xxx: number = value;
      const equal: Equal<typeof value, number> = true;
      // @ts-expect-error @b 的 value 不是 string
      const wrong: string = value;
      expect(equal).toBe(true);
    }
  });

  it('数组项内 @别名 命中项内同名别名(子级优先)', () => {
    const result = createBuilder(
      v.object({
        a: v.pipe(v.number(), setAlias('xx')),
        b: v.array(
          v.pipe(
            v.object({ c: v.pipe(v.string(), setAlias('xx')) }),
            setAlias('arr'),
          ),
        ),
      }),
    );
    // 创建数组项, 保证 item 存在一个
    result.form.control?.updateValue({ b: [{ c: 'v1' }] });

    const itemField = result.get(['b', 0]);
    expect(itemField).toBeDefined();
    if (!itemField) {
      return;
    }
    const cField = itemField.get(['c']);
    expect(cField).toBeDefined();
    // c 是 string
    const cValue = cField!.form.control!.value;
    const cEqual: Equal<typeof cValue, string> = true;
    expect(cValue).toBe('v1');
    expect(cEqual).toBe(true);

    // 在 item 上查 @xx: 命中项内的 c, 而不是根级的 a
    const aliased = itemField.get(['@xx']);
    expect(aliased).toBeDefined();
    expect(aliased).toBe(cField);
    expect(aliased?.keyPath).toEqual(['c']);
    expect(aliased?.alias).toBe('xx');
    // 类型层面同样精确: @xx 在 item 作用域内解析为 c 的 string
    const aliasedValue = aliased!.form.control!.value;
    const aliasEqual: Equal<typeof aliasedValue, string> = true;
    // @ts-expect-error @xx 在 item 作用域内不是 number
    const aliasWrong: number = aliasedValue;
    expect(aliasedValue).toBe('v1');
    expect(aliasEqual).toBe(true);

    // 项内另一个别名 @arr 解析为 item 自身的 { c: string }
    const arrField = itemField.get(['@arr'])!;
    const arrValue = arrField.form.control!.value;
    const arrEqual: Equal<typeof arrValue, { c: string }> = true;
    expect(arrEqual).toBe(true);

    // 根级查 @xx: 仍是 a(number), 未被数组项内的同名别名污染
    const rootAliased = result.get(['@xx'])!;
    const rootAliasValue = rootAliased.form.control!.value;
    const rootAliasEqual: Equal<typeof rootAliasValue, number> = true;
    expect(rootAliased.keyPath).toEqual(['a']);
    expect(rootAliasEqual).toBe(true);
  });
});

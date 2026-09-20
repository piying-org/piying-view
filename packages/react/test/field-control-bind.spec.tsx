import { describe, it, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import * as v from 'valibot';
import { convertToField } from '../src/util/convert-wrapper';
import { Field } from '../src/component/field-control-bind';
import { delay } from './util/delay';
import type { DotPathTokens, KeyPath } from '@piying/view-core';

type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false;

type IsAny<T> = 0 extends 1 & T ? true : false;

const Schema = v.object({
  text1: v.optional(v.string()),
  number1: v.number(),
});

const makeField = () => convertToField(() => Schema);

describe('Field - cvaa/field 按 path 推导强类型', () => {
  it('类型: text1 的 cvaa.value 是 string | undefined, 且 field 不是 any', () => {
    const el = (
      <Field field={makeField()} path={['text1']}>
        {({ cvaa, field: f }) => {
          const valueIsString: Equal<typeof cvaa.value, string | undefined> = true;
          const fieldNotAny: false = true as IsAny<typeof f>;
          const changeArgIsString: Equal<
            Parameters<typeof cvaa.valueChange>[0],
            string | undefined
          > = true;
          return <span>{String(valueIsString && fieldNotAny && changeArgIsString)}</span>;
        }}
      </Field>
    );
    expect(el).toBeTruthy();
  });

  it('类型: number1 的 cvaa.value 是 number', () => {
    const el = (
      <Field field={makeField()} path={['number1']}>
        {({ cvaa }) => {
          const valueIsNumber: Equal<typeof cvaa.value, number> = true;
          return <span>{String(valueIsNumber)}</span>;
        }}
      </Field>
    );
    expect(el).toBeTruthy();
  });

  it('类型: 值类型写错会被拦下', () => {
    const el = (
      <Field field={makeField()} path={['text1']}>
        {({ cvaa }) => {
          // @ts-expect-error text1 是 string, 不能当 number 用
          const wrong: number = cvaa.value;
          // @ts-expect-error valueChange 只接受 string
          cvaa.valueChange(123);
          return <span>{String(wrong && typeof cvaa.valueChange)}</span>;
        }}
      </Field>
    );
    expect(el).toBeTruthy();
  });

  it('类型: number1 上 valueChange 不接受 string', () => {
    const el = (
      <Field field={makeField()} path={['number1']}>
        {({ cvaa }) => {
          // @ts-expect-error number1 是 number, 不接受 string
          cvaa.valueChange('x');
          return <span>{String(cvaa.value)}</span>;
        }}
      </Field>
    );
    expect(el).toBeTruthy();
  });

  it('运行时: 原生 input 通过 cvaa 读写 text1', async () => {
    const field = makeField();
    const { container } = render(
      <Field field={field} path={['text1']}>
        {({ cvaa }) => (
          <input
            value={cvaa.value ?? ''}
            onChange={(e) => cvaa.valueChange(e.target.value)}
            onBlur={cvaa.touchedChange}
          />
        )}
      </Field>,
    );

    const input = container.querySelector('input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'hello' } });
    await delay();
    expect(field.get(['text1'])!.form.control!.value).eq('hello');
    expect(input.value).eq('hello');
  });

  it('运行时: 外部改值会同步回 cvaa', async () => {
    const field = makeField();
    const { container } = render(
      <Field field={field} path={['text1']}>
        {({ cvaa }) => <span data-testid="out">{cvaa.value ?? '(empty)'}</span>}
      </Field>,
    );

    field.get(['text1'])!.form.control!.updateValue('from-outside');
    await delay();
    expect(container.textContent).toContain('from-outside');
  });
});

describe('Field - get 过深路径不得退化成 any', () => {
  it('类型: 叶子之后再下钻直接编译报错', () => {
    const xxx = makeField();

    const unreachable = () => {
      // @ts-expect-error number1 是叶子, 没有子级
      xxx.get(['number1', 'number1']);
      // @ts-expect-error 叶子之后也不该补出兄弟键
      xxx.get(['number1', 'text1']);
    };

    expect(unreachable).toBeInstanceOf(Function);
  });

  it("类型: '#' 重置到根后再下钻到叶子以下, 同样编译报错", () => {
    const xxx = makeField();

    const unreachable = () => {
      // @ts-expect-error '#' 之后 number1 仍是叶子, 再下钻解不出字段
      xxx.get(['#', 'number1', 'number1']);
      // @ts-expect-error '#' 重置余额后再上退就是越界
      xxx.get(['#', '..', '..']);
    };

    expect(unreachable).toBeInstanceOf(Function);
  });

  it('运行时: 过深路径查不到字段', () => {
    const field = makeField();

    expect(field.get(['number1', 'number1'] as any)).toBeUndefined();
    expect(field.get(['number1', 'xx'] as any)).toBeUndefined();
    expect(field.get(['#', 'number1', 'number1'] as any)).toBeUndefined();
  });

  it('运行时: 根级再上退直接抛错', () => {
    const field = makeField();

    expect(() => field.get(['..'] as any)).toThrowError(/无法继续上溯/);
    expect(() => field.get(['#', '..'] as any)).toThrowError(/无法继续上溯/);
  });

  it('类型: 动态 KeyPath 走 get, 拿通用字段类型而不是 any', () => {
    const field = makeField();
    field.form.control?.updateValue({ number1: 3 });

    const path: KeyPath = ['number1'];
    const dyn = field.get(path);
    const notAny: IsAny<typeof dyn> = false;
    expect(dyn?.form.control?.value).toBe(3);
    expect(notAny).toBe(false);
  });

  it('类型: 正常路径依旧精确, 未被收紧误伤', () => {
    const xxx = makeField();
    const f = xxx.get(['number1'])!;
    const value = f.form.control!.value;
    const isNumber: Equal<typeof value, number> = true;
    const isNotString: Equal<typeof value, string> = false;
    expect(isNumber).toBe(true);
    expect(isNotString).toBe(false);
  });

  it('类型: 叶子之后的补全集合里没有字段键, 只剩 # / ..', () => {
    type Tok = DotPathTokens<typeof Schema, typeof Schema, any, {}>;

    const ok: Tok[] = [['number1'], ['number1', '..'], ['number1', '#']];
    // @ts-expect-error 叶子之后没有字段键
    const bad: Tok = ['number1', 'number1'];

    expect(ok.length).toBe(3);
    expect(bad).toEqual(['number1', 'number1']);
  });
});

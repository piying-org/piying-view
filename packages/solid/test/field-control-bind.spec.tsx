import { describe, it, expect } from 'vitest';
import { render, fireEvent } from '@solidjs/testing-library';
import * as v from 'valibot';
import type { Accessor } from 'solid-js';
import { convertToField } from '../src/util/convert-wrapper';
import { Field } from '../src/component/field-control-bind';
import { delay } from './util/delay';

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
  it('类型: text1 的 cvaa.value 是 Accessor<string | undefined>, 且 field 不是 any', () => {
    const el = (
      <Field field={makeField()} path={['text1']}>
        {({ cvaa, field: f }) => {
          const valueIsString: Equal<
            typeof cvaa.value,
            Accessor<string | undefined>
          > = true;
          const fieldNotAny: false = true as IsAny<typeof f>;
          const changeArgIsString: Equal<
            Parameters<typeof cvaa.valueChange>[0],
            string | undefined
          > = true;
          return (
            <span>
              {String(valueIsString && fieldNotAny && changeArgIsString)}
            </span>
          );
        }}
      </Field>
    );
    expect(el).toBeTruthy();
  });

  it('类型: number1 的 cvaa.value 是 Accessor<number>', () => {
    const el = (
      <Field field={makeField()} path={['number1']}>
        {({ cvaa }) => {
          const valueIsNumber: Equal<typeof cvaa.value, Accessor<number>> = true;
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
          const wrong: Accessor<number> = cvaa.value;
          // @ts-expect-error valueChange 只接受 string
          cvaa.valueChange(123);
          return <span>{String(wrong) + String(cvaa.valueChange)}</span>;
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
          return <span>{String(cvaa.value())}</span>;
        }}
      </Field>
    );
    expect(el).toBeTruthy();
  });

  it('运行时: 原生 input 通过 cvaa 读写 text1', async () => {
    const field = makeField();
    const { container } = render(() => (
      <Field field={field} path={['text1']}>
        {({ cvaa }) => (
          <input
            value={cvaa.value() ?? ''}
            onInput={(e) => cvaa.valueChange(e.currentTarget.value)}
            onBlur={cvaa.touchedChange}
          />
        )}
      </Field>
    ));
    await delay();

    const input = container.querySelector('input') as HTMLInputElement;
    fireEvent.input(input, { target: { value: 'hello' } });
    await delay();
    expect(field.get(['text1'])!.form.control!.value).eq('hello');
    expect(input.value).eq('hello');
  });

  it('运行时: 外部改值会同步回 cvaa', async () => {
    const field = makeField();
    const { container } = render(() => (
      <Field field={field} path={['text1']}>
        {({ cvaa }) => <span>{cvaa.value() ?? '(empty)'}</span>}
      </Field>
    ));
    await delay();

    field.get(['text1'])!.form.control!.updateValue('from-outside');
    await delay();
    expect(container.textContent).toContain('from-outside');
  });
});

import { describe, expectTypeOf, it } from 'vitest';
import type { ShallowRef } from 'vue';
import type { KeyPath, PiFieldGet, PiFieldValueOf } from '@piying/view-core';
import type { ControlValueAccessorAdapter } from '@piying/view-vue';
import type { TestField } from '../__tests__/util/field-fixture';

describe('类型测试 - Field 的 path 决定 field/cvaa 推导', () => {
  it('不写 path (P 默认 []) 时, PiFieldGet 收敛为字段自身', () => {
    expectTypeOf<PiFieldGet<TestField, []>>().toEqualTypeOf<TestField>();
  });

  it('path=["text1"] 时, value 为 string | undefined', () => {
    expectTypeOf<PiFieldValueOf<PiFieldGet<TestField, ['text1']>>>().toEqualTypeOf<
      string | undefined
    >();
  });

  it('path=["number1"] 时, value 为 number', () => {
    expectTypeOf<PiFieldValueOf<PiFieldGet<TestField, ['number1']>>>().toEqualTypeOf<number>();
  });

  it('cvaa.value 始终是 ShallowRef<V>', () => {
    expectTypeOf<ControlValueAccessorAdapter<string>['value']>().toEqualTypeOf<ShallowRef<string>>();
  });

  it('cvaa.valueChange 的参数与 value 一致', () => {
    expectTypeOf<ControlValueAccessorAdapter<number>['valueChange']>().toEqualTypeOf<
      (value: number) => void
    >();
  });

  it('path 为宽泛 KeyPath 时退化为宽松类型而非报错', () => {
    expectTypeOf<PiFieldValueOf<PiFieldGet<TestField, KeyPath>>>().toBeAny();
  });
});

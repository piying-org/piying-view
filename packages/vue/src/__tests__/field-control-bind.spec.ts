import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { makeField } from './util/field-fixture';
import { delay } from './util/delay';
import FieldBindTest from './component/field-bind-test.vue';

const setup = () => {
  const field = makeField();
  const wrapper = mount(FieldBindTest, { props: { field } });
  return { field, wrapper };
};

describe('Field - cvaa/field 按 path 推导强类型', () => {
  it('运行时: 类型断言全部成立 (组件内 Equal/IsAny 均为 ok)', async () => {
    const { wrapper } = setup();
    await delay();
    expect(wrapper.find('.t-assert').text()).toBe('ok');
    expect(wrapper.find('.t-change').text()).toBe('ok');
    expect(wrapper.find('.t-num').text()).toBe('ok');
  });

  it('运行时: 原生 input 通过 cvaa 写回 text1', async () => {
    const { field, wrapper } = setup();
    await delay();

    await wrapper.find('.t-text').setValue('hello');
    await delay();
    expect(field.get(['text1'])!.form.control!.value).eq('hello');
    expect(wrapper.find('.t-out').text()).toBe('hello');
  });

  it('运行时: 外部改值会同步回 cvaa', async () => {
    const { field, wrapper } = setup();
    await delay();

    field.get(['text1'])!.form.control!.updateValue('from-outside');
    await delay();
    expect(wrapper.find('.t-out').text()).toBe('from-outside');
  });

  it('运行时: 不写 path 时类型断言成立 (P 落到默认值 [])', async () => {
    const { wrapper } = setup();
    await delay();
    expect(wrapper.find('.t-nopath').text()).toBe('ok');
    expect(wrapper.find('.t-nopath-field').text()).toBe('ok');
    expect(wrapper.find('.t-nopath-change').text()).toBe('ok');
  });

  it('运行时: 不写 path 时直接绑定传入的叶子字段', async () => {
    const { field, wrapper } = setup();
    await delay();

    await wrapper.find('.t-nopath-input').setValue('no-path');
    await delay();
    expect(field.get(['text1'])!.form.control!.value).toBe('no-path');
    expect(wrapper.find('.t-nopath-out').text()).toBe('no-path');
  });
});

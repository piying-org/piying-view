import { mount } from '@vue/test-utils';
import TestDestroy from './component/test-destroy.vue';
import { describe, expect, it } from 'vitest';
import { nextTick } from 'vue';
describe('销毁测试', () => {
  it('组件销毁', async () => {
    const instance = mount(TestDestroy, { props: { open: true } });
    const el1 = instance.find('.wrapper');
    expect(el1.exists()).ok;
    await nextTick();
    const field = (instance.emitted()['getField'] as any)[0][0];
    let isEnd = false;
    field.form.control.valueChanges.subscribe({
      complete: () => {
        isEnd = true;
      },
    });
    instance.setProps({ open: false });
    expect(isEnd).eq(false);
    await nextTick();
    const el2 = instance.find('.wrapper');

    expect(el2.exists()).eq(false);
    expect(isEnd).eq(true);
  });
});

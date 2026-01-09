import { describe, it, expect } from 'vitest';

import * as v from 'valibot';
import { createComponent } from './util/create-component';
import { shallowRef } from 'vue';
import { nextTick } from 'vue';
import { delay } from './util/delay';
import { getField } from './util/actions';
import type { PiResolvedViewFieldConfig } from '../type/group';

describe('输入参数变化', () => {
  it('string变number', async () => {
    const field$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const value = shallowRef('init');
    const { instance } = await createComponent(v.string(), value);
    const inputEl = instance.find('input');
    expect(inputEl.element.value).eq('init');
    inputEl.setValue('123');
    expect(inputEl.element.value).eq('123');
    await nextTick();
    await delay();
    console.log('准备设置');
    instance.setProps({
      ...instance.props(),
      schema: v.pipe(v.number(), getField(field$)),
      modelValue: 1234,
    });
    console.log('设置完成');
    
    await nextTick();
    await delay();
    const inputEl2 = instance.find('input');
    expect(inputEl2.element.value).eq('1234');
    inputEl2.setValue('456');
    expect(inputEl2.element.value).eq('456');
    await nextTick();
    await delay();
    const field = await field$.promise;
    expect(field.form.control!.value$$()).eq(456);
  });
});

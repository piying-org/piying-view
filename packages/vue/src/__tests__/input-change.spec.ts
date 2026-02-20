import { describe, it, expect } from 'vitest';

import * as v from 'valibot';
import { createComponent } from './util/create-component';
import { ref, shallowRef } from 'vue';
import { nextTick } from 'vue';
import { delay } from './util/delay';
import { getField } from './util/actions';
import type { PiResolvedViewFieldConfig } from '../type/group';
import { actions } from '@piying/view-core';

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
  it('allFieldsResolved不被ref影响', async () => {
    let testRef1 = ref(1);
    const value = shallowRef(1);
    let count = 0;
    const { instance } = await createComponent(
      v.pipe(
        v.string(),
        actions.hooks.merge({
          allFieldsResolved: (field) => {
            testRef1.value
            count++;
          },
        }),
      ),
      value,
      { context: { test1: testRef1 } },
    );

    await nextTick();
    await delay();
    value.value = 2;
    testRef1.value = 2;
    await nextTick();
    await delay();
    expect(count).eq(1);
  });
});

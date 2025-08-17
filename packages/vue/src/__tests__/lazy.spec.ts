import { describe, it, expect } from 'vitest';

import * as v from 'valibot';
import { createComponent } from './util/create-component';
import { shallowRef } from 'vue';
import { nextTick } from 'vue';
import { modelValueEqual } from './util/model-value-equal';
import { delay } from './util/delay';
import { markAsLazy, setComponent } from '@piying/view-core';

describe('lazy-import', () => {
  it('string', async () => {
    const schema = v.pipe(v.string(), setComponent('lazy-string'));
    const value = shallowRef('init');
    const { instance } = await createComponent(schema, value, {
      defaultConfig: { types: { 'lazy-string': { type: () => import('./component/input.vue') } } },
    });
    await nextTick();
    // 懒加载组件需要时间
    await delay(50);
    const inputEl = instance.find('input');
    expect(inputEl.element.value).eq('init');
    inputEl.setValue('123');
    expect(inputEl.element.value).eq('123');
    await nextTick();
    await delay();
    modelValueEqual(instance, '123');
  });
  it('string-mark', async () => {
    const schema = v.pipe(v.string(), setComponent('lazy-string'));
    const value = shallowRef('init');
    const { instance } = await createComponent(schema, value, {
      defaultConfig: {
        types: { 'lazy-string': { type: markAsLazy(() => import('./component/input.vue')) } },
      },
    });
    await nextTick();
    // 懒加载组件需要时间
    await delay(50);
    const inputEl = instance.find('input');
    expect(inputEl.element.value).eq('init');
    inputEl.setValue('123');
    expect(inputEl.element.value).eq('123');
    await nextTick();
    await delay();
    modelValueEqual(instance, '123');
  });
});

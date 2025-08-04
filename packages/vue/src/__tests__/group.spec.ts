import { describe, it, expect } from 'vitest';

import * as v from 'valibot';
import { createComponent } from './util/create-component';
import { shallowRef } from 'vue';
import { componentClass, patchAsyncInputs, setComponent } from '@piying/view-core';
import type { PiResolvedViewFieldConfig } from '../formly/type/group';
import { signal } from 'static-injector';
import GroupSwap from './component/group-swap.vue';
import { delay } from './util/delay';
import GroupAttr from './component/group-attributes.vue';
describe('group', () => {
  it('切换', async () => {
    const field$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const index$ = signal(0);
    const schema = v.pipe(
      v.object({
        k1: v.string(),
        k2: v.string(),
      }),
      setComponent('groupSwap'),
      patchAsyncInputs({
        activateIndex: () => index$,
      }),
    );

    const value = shallowRef({ k1: '', k2: '2222' });
    const { instance } = await createComponent(schema, value, {
      defaultConfig: { types: { groupSwap: { type: GroupSwap } } },
    });
    let el = instance.find('input');
    el.setValue('1111');
    expect(el.element.value).eq('1111');
    index$.set(1);
    await delay(0);
    el = instance.find('input');
    expect(el.element.value).eq('2222');
    index$.set(0);
    await delay(0);
    el = instance.find('input');
    expect(el.element.value).eq('1111');
  });
  it('attribute', async () => {
    const schema = v.pipe(
      v.object({
        k1: v.string(),
      }),
      setComponent('group1'),
      componentClass('test1'),
    );

    const value = shallowRef({ k1: '' });
    const { instance } = await createComponent(schema, value, {
      defaultConfig: { types: { group1: { type: GroupAttr } } },
    });
    const el = instance.find('.test1.group-attr');
    expect(el.exists()).true;
  });
});

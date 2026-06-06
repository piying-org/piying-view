import { describe, it, expect } from 'vitest';

import * as v from 'valibot';
import { createComponent } from './util/create-component.ts';
import { markRaw, nextTick, shallowRef } from 'vue';
import { actions } from '@piying/view-core';
import { getField } from './util/actions.ts';
import type { PiResolvedViewFieldConfig } from '../type/group.ts';
import { delay } from './util/delay.ts';
import { convertToField } from '../util/convert-wrapper.ts';
import { DOMWrapper, mount } from '@vue/test-utils';
import InputCustomBind from './component/input-custom-bind.vue';
import HybridGroup from './component/hybrid-group.vue';

describe('custom-bind', () => {
  it('直接绑定', async () => {
    const field = convertToField(() => v.string());
    const instance = mount(InputCustomBind, {
      props: {
        field: markRaw(field),
      },
    });
    await nextTick();
    await delay();
    expect(instance.exists()).toBe(true);
    const inputEl = instance.find('input');
    inputEl.setValue('inputvalue1');
    expect(inputEl.element.value).eq('inputvalue1');
    expect(field.form.root.value).eq('inputvalue1');
    inputEl.setValue('inputvalue2');
    expect(inputEl.element.value).eq('inputvalue2');
    expect(field.form.root.value).eq('inputvalue2');
  });

  it('赋值', async () => {
    const field1$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const field2$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const schema = v.pipe(
      v.object({
        k1: v.pipe(v.string(), getField(field1$)),
        k2: v.pipe(v.string(), actions.class.top('mode2'), getField(field2$)),
      }),
    );
    const value = shallowRef();
    const { instance } = await createComponent(schema, value, {
      defaultConfig: {
        types: {
          object: {
            type: HybridGroup,
          },
        },
      },
    });
    const list = instance.findAll('input');
    expect(list.length).eq(2);
    const el1 = instance.find('.mode1') as DOMWrapper<HTMLInputElement>;
    el1.setValue('inputValue1');
    expect(el1.element.value).eq('inputValue1');
    const field1 = await field1$.promise;
    expect(field1.form.control!.value).eq('inputValue1');
    const el2 = instance.find('.mode2') as DOMWrapper<HTMLInputElement>;
    el2.setValue('inputValue2');
    expect(el2.element.value).eq('inputValue2');
    const field2 = await field2$.promise;
    expect(field2.form.control!.value).eq('inputValue2');
    expect(instance.find('.mode1-wrapper')).ok;
  });
});

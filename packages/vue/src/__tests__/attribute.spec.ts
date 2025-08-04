import { describe, it, expect } from 'vitest';

import * as v from 'valibot';
import { createComponent } from './util/create-component';
import { nextTick, shallowRef } from 'vue';
import { getField } from './util/actions';
import type { PiResolvedViewFieldConfig } from '../type/group';
import { NFCSchema, setAttributes, setComponent, setInputs } from '@piying/view-core';
import EmptyCmp from './component/empty-cmp.vue';
import { delay } from './util/delay';
describe('attribute', () => {
  it('通用属性', async () => {
    const field$ = Promise.withResolvers<PiResolvedViewFieldConfig>();

    const schema = v.pipe(
      NFCSchema,
      getField(field$),
      setComponent('inputTest'),
      setAttributes({ class: 'hello' }),
    );
    const value = shallowRef();
    const { instance } = await createComponent(schema, value, {
      defaultConfig: {
        types: {
          inputTest: {
            type: EmptyCmp,
          },
        },
      },
    });
    const field = await field$.promise;
    expect(field.form.control).toBeFalsy();
    const inputEl = instance.find('.empty-cmp');
    expect(inputEl.classes()).contain('hello');
    // 更新input
    field.inputs.update(() => ({ input1: 'xxxx' }));
    await nextTick();
    await delay();
    expect(inputEl.text()).eq('xxxx');
    // 更新attr
    field.attributes.update(() => ({ class: 'world' }));
    await nextTick();
    await delay();
    expect(inputEl.classes()).contain('world');
  });
  it('混合输入', async () => {
    const field$ = Promise.withResolvers<PiResolvedViewFieldConfig>();

    const schema = v.pipe(
      NFCSchema,
      getField(field$),
      setComponent('inputTest'),
      setAttributes({ class: 'hello' }),
      setInputs({ input1: 'input1-input' }),
    );
    const value = shallowRef();
    const { instance } = await createComponent(schema, value, {
      defaultConfig: {
        types: {
          inputTest: {
            type: EmptyCmp,
          },
        },
      },
    });
    const field = await field$.promise;
    expect(field.form.control).toBeFalsy();
    const inputEl = instance.find('.empty-cmp');
    expect(inputEl.text()).contain('input1-input');
  });
});

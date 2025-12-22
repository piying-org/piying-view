import { describe, it, expect } from 'vitest';

import * as v from 'valibot';
import { createComponent } from './util/create-component';
import { nextTick, shallowRef } from 'vue';
import InputsTest from './component/inputs-test.vue';
import { rawConfig } from '../action';
import { NFCSchema } from '@piying/view-core';
import { getField } from './util/actions';
import type { PiResolvedViewFieldConfig } from '../type/group';
import { delay } from './util/delay';

describe('inputs', () => {
  it('赋值', async () => {
    const field$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const schema = v.pipe(
      NFCSchema,
      rawConfig((value) => {
        value.type = 'inputTest';
        value.inputs.set({ value1: '111', value2: '222' });
      }),
      getField(field$),
    );
    const value = shallowRef();
    const { instance } = await createComponent(schema, value, {
      defaultConfig: {
        types: {
          inputTest: {
            type: InputsTest,
          },
        },
      },
    });
    const inputEl = instance.find('.inputs-test');
    expect(inputEl.element.innerHTML).eq('111222');
    const field = await field$.promise;
    field.inputs.update((value) => ({ ...value, value1: '333' }));
    await nextTick();
    await delay();
    expect(inputEl.element.innerHTML).eq('333222');
  });
});

import { describe, it, expect } from 'vitest';

import * as v from 'valibot';
import { createComponent } from './util/create-component';

import { NFCSchema, actions, setComponent } from '@piying/view-core';
import { delay } from './util/delay';
import { getField } from './util/actions';
import type { PiResolvedViewFieldConfig } from '../src/type';
import { EmptyCmp } from './component/empty-cmp';
describe('attribute', () => {
  it('通用属性', async () => {
    const field$ = Promise.withResolvers<PiResolvedViewFieldConfig>();

    const schema = v.pipe(NFCSchema, getField(field$), setComponent('inputTest'), actions.attributes.set({ class: 'hello' }));
    const value = undefined;
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
    const inputEl = instance.container.querySelector('.empty-cmp');

    expect(inputEl?.classList.contains('hello')).true;
    // 更新input
    field.inputs.update(() => ({ input1: 'xxxx' }));
    await delay(10);
    expect(inputEl?.textContent).eq('xxxx');
    // 更新attr
    field.attributes.update(() => ({ class: 'world' }));
    await delay(10);
    expect(inputEl?.classList.contains('world')).true;
  });
});

import { describe, it, expect } from 'vitest';

import * as v from 'valibot';
import { createComponent } from './util/create-component';
import { NFCSchema, setComponent, actions } from '@piying/view-core';
import { getField } from './util/actions';
import type { PiResolvedViewFieldConfig } from '../type/group';
import OutputTest from './component/output-test.vue';
import { shallowRef } from './util/stub-ref';
describe('output', () => {
  it('赋值', async () => {
    let emitIndex = 0;
    const field$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const schema = v.pipe(
      NFCSchema,
      setComponent('outputTest'),
      actions.outputs.set({
        emit1: (value) => {
          expect(value).eq('value1');
          emitIndex++;
        },
        emit2: (value) => {
          expect(value).eq('value2');
          emitIndex++;
        },
      }),
      getField(field$),
    );
    const value = shallowRef();
    const { instance } = await createComponent(schema, value, {
      defaultConfig: {
        types: {
          outputTest: {
            type: OutputTest,
          },
        },
      },
    });
    const inputEl = instance.find('.btn1');
    inputEl.trigger('click');
    expect(emitIndex).eq(1);
    const inputEl2 = instance.find('.btn2');
    inputEl2.trigger('click');
    expect(emitIndex).eq(2);
  });
});

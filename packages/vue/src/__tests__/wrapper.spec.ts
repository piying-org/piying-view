import { describe, it, expect } from 'vitest';

import * as v from 'valibot';
import { createComponent } from './util/create-component';
import { nextTick, shallowRef, type ComputedRef } from 'vue';
import InputsTest from './component/inputs-test.vue';
import { getField } from './util/actions';
import type { PiResolvedViewFieldConfig } from '../type/group';
import { NFCSchema, setComponent, setWrappers } from '@piying/view-core';
import Wrapper1 from './component/wrapper1.vue';
import Wrapper2 from './component/wrapper2.vue';
import WrapperField from './component/wrapper-field.vue';
import { delay } from './util/delay';
import WrapperOutput from './component/wrapper-output.vue';
const WrapperObj = {
  'wrapper-field': {
    type: WrapperField,
  },
  wrapper1: {
    type: Wrapper1,
  },
  wrapper2: {
    type: Wrapper2,
  },
};
describe('wrapper', () => {
  it('1层wrapper', async () => {
    const field$ = Promise.withResolvers<PiResolvedViewFieldConfig>();

    const schema = v.pipe(
      NFCSchema,
      getField(field$),
      setComponent('inputTest'),
      setWrappers(['wrapper1']),
    );
    const value = shallowRef();
    const { instance } = await createComponent(schema, value, {
      defaultConfig: {
        types: {
          inputTest: {
            type: InputsTest,
          },
        },
        wrappers: WrapperObj,
      },
    });
    const field = await field$.promise;
    expect(field.form.control).toBeFalsy();
    const inputEl = instance.find('.inputs-test');
    expect(inputEl).ok;
    expect(instance.find('.wrapper1').exists()).ok;
  });
  it('2层wrapper', async () => {
    const field$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const schema = v.pipe(
      NFCSchema,
      getField(field$),
      setComponent('inputTest'),
      setWrappers(['wrapper1', 'wrapper2']),
    );
    const value = shallowRef();
    const { instance } = await createComponent(schema, value, {
      defaultConfig: {
        types: {
          inputTest: {
            type: InputsTest,
          },
        },
        wrappers: WrapperObj,
      },
    });
    const field = await field$.promise;
    expect(field.form.control).toBeFalsy();
    const inputEl = instance.find('.inputs-test');
    expect(inputEl).ok;
    expect(instance.find('.wrapper1').exists()).ok;
    expect(instance.find('.wrapper2').exists()).ok;
    expect(instance.find('.wrapper1').find('.wrapper2').exists()).ok;
  });

  it('wrapper-input', async () => {
    const field$ = Promise.withResolvers<PiResolvedViewFieldConfig>();

    const schema = v.pipe(
      NFCSchema,
      getField(field$),
      setComponent('inputTest'),
      setWrappers([{ type: 'wrapper1', inputs: { input1: 'input1-value' } }]),
    );
    const value = shallowRef();
    const { instance } = await createComponent(schema, value, {
      defaultConfig: {
        types: {
          inputTest: {
            type: InputsTest,
          },
        },
        wrappers: WrapperObj,
      },
    });
    const field = await field$.promise;
    expect(field.form.control).toBeFalsy();
    const inputEl = instance.find('.inputs-test');
    expect(inputEl).ok;
    expect(instance.find('.wrapper1').text()).contain('input1-value');
    field.wrappers
      .items()[0]()
      .inputs.update((inputs) => ({ ...inputs, input1: 'input2-value' }));
    await nextTick();
    await delay();
    expect(instance.find('.wrapper1').text()).contain('input2-value');
  });
  it('wrapper-attr', async () => {
    const field$ = Promise.withResolvers<PiResolvedViewFieldConfig>();

    const schema = v.pipe(
      NFCSchema,
      getField(field$),
      setComponent('inputTest'),
      setWrappers([
        { type: 'wrapper1', inputs: { input1: 'input1-value' }, attributes: { class: 'hello' } },
      ]),
    );
    const value = shallowRef();
    const { instance } = await createComponent(schema, value, {
      defaultConfig: {
        types: {
          inputTest: {
            type: InputsTest,
          },
        },
        wrappers: WrapperObj,
      },
    });
    const field = await field$.promise;
    expect(field.form.control).toBeFalsy();
    const inputEl = instance.find('.inputs-test');
    expect(inputEl).ok;
    const el = instance.find('.wrapper1');
    expect(el.text()).contain('input1-value');
    expect(el.classes()).contain('hello');
  });
  it('wrapper-output', async () => {
    const field$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    let isEmit = false;
    const schema = v.pipe(
      NFCSchema,
      getField(field$),
      setComponent('inputTest'),
      setWrappers([
        {
          type: 'wrapper1',
          outputs: {
            output1: (value) => {
              expect(value).eq('1');
              isEmit = true;
            },
          },
        },
      ]),
    );
    const value = shallowRef();
    const { instance } = await createComponent(schema, value, {
      defaultConfig: {
        types: {
          inputTest: {
            type: InputsTest,
          },
        },
        wrappers: {
          wrapper1: {
            type: WrapperOutput,
          },
        },
      },
    });
    const field = await field$.promise;
    expect(field.form.control).toBeFalsy();
    const inputEl = instance.find('.inputs-test');
    expect(inputEl).ok;
    instance.find('.wrapper-btn').trigger('click');
    expect(isEmit).eq(true);
  });

  it('wrapper中获得field', async () => {
    let isEmit = false;
    const schema = v.pipe(
      v.string(),
      setWrappers([
        {
          type: 'wrapper-field',
          outputs: {
            emitField: (value: ComputedRef<PiResolvedViewFieldConfig>) => {
              expect(value).ok;
              expect(value.value.form.control?.value).eq('1234');
              isEmit = true;
            },
          },
        },
      ]),
    );
    const value = shallowRef('1234');
    const { instance } = await createComponent(schema, value, {
      defaultConfig: {
        wrappers: WrapperObj,
      },
    });

    expect(isEmit).eq(true);
  });
});

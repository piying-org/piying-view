import { describe, it, expect } from 'vitest';

import * as v from 'valibot';
import { createComponent } from './util/create-component';

import { NFCSchema, setComponent } from '@piying/view-core';
import { getField } from './util/actions';
import type { PiResolvedViewFieldConfig } from '../src/type';
import { InputsTest } from './component/inputs-test';

describe('no-form-control', () => {
  it('赋值', async () => {
    const field$ = Promise.withResolvers<PiResolvedViewFieldConfig>();

    const schema = v.pipe(NFCSchema, getField(field$), setComponent('inputTest'));
    const value = undefined;
    const { instance } = await createComponent(schema, value, {
      defaultConfig: {
        types: {
          inputTest: {
            type: InputsTest,
          },
        },
      },
    });
    const field = await field$.promise;
    expect(field.form.control).toBeFalsy();
    const inputEl = instance.container.querySelector('.inputs-test');
    expect(inputEl).ok;
  });
});

import { getField } from '@piying/view-core/test';
import type { PiResolvedViewFieldConfig } from '@piying/view-solid';
import { createComponent } from './util/create-component';
import { delay } from './util/delay';
import { describe, expect, it } from 'vitest';
import * as v from 'valibot';
import { NFCSchema, rawConfig } from '@piying/view-core';
import { InputsTest } from './component/inputs-test';
describe('inputs', () => {
  it('赋值', async () => {
    const field$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const schema = v.pipe(
      NFCSchema,
      rawConfig((value) => {
        value.type = 'inputTest';
        value.inputs = { value1: '111', value2: '222' };
      }),
      getField(field$),
    );
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

    const inputEl = instance.container.querySelector('.inputs-test')!;
    expect(inputEl.innerHTML).eq('111222');
    const field = await field$.promise;
    field.inputs.update((value) => ({ ...value, value1: '333' }));
    await delay(10);
    expect(inputEl.innerHTML).eq('333222');
  });
});

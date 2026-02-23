import { describe, it, expect } from 'vitest';

import * as v from 'valibot';
import { createComponent } from './util/create-component';
import { nextTick, shallowRef } from 'vue';
import { NFCSchema, setComponent, actions } from '@piying/view-core';
import { signal } from 'static-injector';
import PciP1 from './component/parent-change-injector/pci-p1.vue';
import { delay } from './util/delay';
import { PciTestService } from './component/parent-change-injector/pci-test.service';

describe('nest', () => {
  it('初始化注入', async () => {
    const inputs$ = signal({ value: 1 });
    const schema = v.pipe(
      NFCSchema,
      setComponent(PciP1),
      actions.inputs.patchAsync({
        inputs: () => inputs$,
      }),
      actions.providers.patch([PciTestService]),
    );
    const value = shallowRef();
    const { instance, el } = await createComponent(schema, value, {});

    expect(el.querySelector('.test1')!.textContent).eq('1');
    inputs$.set({ value: 2 });
    await nextTick();
    await delay();
    expect(el.querySelector('.test1')!.textContent).eq('2');
  });
});

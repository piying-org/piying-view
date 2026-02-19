import { describe, it, expect } from 'vitest';

import * as v from 'valibot';
import { createComponent } from './util/create-component';
import { nextTick, shallowRef } from 'vue';
import { NFCSchema, setComponent, actions } from '@piying/view-core';
import Token from './component/token.vue';
import InjectorTest from './component/injector-test.vue';
import { Test1Token } from './util/token';
import {
  ChangeDetectionScheduler,
  ChangeDetectionSchedulerImpl,
  createRootInjector,
  signal,
} from 'static-injector';
import InjectorTest2 from './component/injector-test2.vue';
import PciP1 from './component/parent-change-injector/pci-p1.vue';
import { delay } from './util/delay';

describe('nest', () => {
  it('初始化注入', async () => {
    let inputs$ = signal({ value: 1 });
    const schema = v.pipe(
      NFCSchema,
      setComponent(PciP1),
      actions.inputs.patchAsync({
        inputs: () => inputs$,
      }),
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

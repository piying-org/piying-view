import { describe, it, expect } from 'vitest';

import * as v from 'valibot';
import { createComponent } from './util/create-component';
import { shallowRef } from 'vue';
import { NFCSchema, setComponent, actions, renderConfig } from '@piying/view-core';
import Token from './component/token.vue';
import InjectorTest from './component/injector-test.vue';
import { Test1Token } from './util/token';
import {
  ChangeDetectionScheduler,
  ChangeDetectionSchedulerImpl,
  createRootInjector,
} from 'static-injector';
import InjectorTest2 from './component/injector-test2.vue';

describe('render', () => {
  it('none', async () => {
    const schema = v.pipe(v.any(), setComponent(''), renderConfig({ hidden: true }));
    const value = shallowRef();
    const { instance } = await createComponent(schema, value, {});
  });
});

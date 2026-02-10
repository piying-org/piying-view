import { describe, it, expect } from 'vitest';

import * as v from 'valibot';
import { createComponent } from './util/create-component';
import { shallowRef } from 'vue';
import { NFCSchema, setComponent, actions } from '@piying/view-core';
import Token from './component/token.vue';
import InjectorTest from './component/injector-test.vue';
import { Test1Token } from './util/token';
import {
  ChangeDetectionScheduler,
  ChangeDetectionSchedulerImpl,
  createRootInjector,
} from 'static-injector';
import InjectorTest2 from './component/injector-test2.vue';

describe('token', () => {
  it('初始化注入', async () => {
    let check = false;
    const schema = v.pipe(
      NFCSchema,
      setComponent(Token),
      actions.outputs.patch({
        tokenChange: (event: any) => {
          expect(event.options.value).ok;
          expect(event.schema.value).ok;
          expect(event.model).ok;
          check = true;
        },
      }),
    );
    const value = shallowRef();
    const { instance } = await createComponent(schema, value, {});

    expect(check).ok;
  });
  it('输入注入器', async () => {
    let check = false;
    const schema = v.pipe(
      NFCSchema,
      setComponent(InjectorTest),
      actions.outputs.patch({
        tokenChange: (event: any) => {
          expect(event.value).eq(123);
          check = true;
        },
      }),
      actions.providers.patch([{ provide: Test1Token, useValue: 123 }]),
    );
    const value = shallowRef();
    const { instance } = await createComponent(schema, value, {});

    expect(check).ok;
  });
  it('输入injector', async () => {
    let check = false;
    const schema = v.pipe(
      NFCSchema,
      setComponent(InjectorTest2),
      actions.outputs.patch({
        tokenChange: (event: any) => {
          expect(event.value).eq(123);
          check = true;
        },
      }),
      actions.providers.patch([{ provide: Test1Token, useValue: 123 }]),
    );
    const value = shallowRef();
    const { instance } = await createComponent(schema, value, {
      injector: createRootInjector({
        providers: [
          {
            provide: ChangeDetectionScheduler,
            useClass: ChangeDetectionSchedulerImpl,
          },
          { provide: Test1Token, useValue: 123 },
        ],
      }),
    });

    expect(check).ok;
  });
});

import { describe, it, expect } from 'vitest';

import * as v from 'valibot';
import { createComponent } from './util/create-component';

import { delay } from './util/delay';
import { setComponent } from '@piying/view-core';
import { setInputValue } from './util/event.ts';
import { lazy } from 'react';

describe('lazy-import', () => {
  it('string', async () => {
    const schema = v.pipe(v.string(), setComponent('lazy-string'));
    const value = 'init';
    const { instance, modelChange$ } = await createComponent(schema, value, {
      defaultConfig: {
        types: { 'lazy-string': { type: lazy(() => import('./component/input.tsx').then(({ PiInput }) => ({ default: PiInput }))) } },
      },
    });
    // 懒加载组件需要时间
    await delay(50);
    const inputEl = instance.container.querySelector('input')!;
    expect(inputEl.value).eq('init');
    setInputValue(inputEl, '123');
    expect(inputEl.value).eq('123');
    await delay();
    expect(modelChange$.value).eq('123');
  });
});

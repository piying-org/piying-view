import { describe, it, expect } from 'vitest';

import * as v from 'valibot';

import { delay } from './util/delay';
import { markAsLazy, setComponent } from '@piying/view-core';
import { setInputValue } from './util/event';
import { createComponent } from './util/create-component.svelte';

describe('lazy-import', () => {
	it('string', async () => {
		const schema = v.pipe(v.string(), setComponent('lazy-string'));
		const value = 'init';
		const { instance, modelChange$ } = await createComponent(schema, value, {
			defaultConfig: {
				types: {
					'lazy-string': {
						type: markAsLazy(() => import('./component/input.svelte').then((a) => a.default))
					}
				}
			}
		});
		// 懒加载组件需要时间
		await delay(50);
		const inputEl = instance.container.querySelector('input')!;
		expect(inputEl.value).eq('init');
		setInputValue(inputEl, '123');
		expect(inputEl.value).eq('123');
		await delay();
		expect(modelChange$()).eq('123');
	});
});

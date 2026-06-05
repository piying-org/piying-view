import { describe, it, expect } from 'vitest';

import * as v from 'valibot';
import { createComponent } from './util/create-component.svelte';
import { actions } from '@piying/view-core';
import { getField } from './util/actions';
import type { PiResolvedViewFieldConfig } from '@piying/view-svelte';
import { delay } from './util/delay';
import { convertToField } from '@piying/view-svelte';
import { render } from '@testing-library/svelte';
import InputCustomBind from './component/input-custom-bind.svelte';
import HybridGroup from './component/hybrid-group.svelte';
import { setInputValue } from './util/event';

describe('custom-bind', () => {
	it('直接绑定', async () => {
		const field = convertToField(() => v.string());
		const { container } = render(InputCustomBind, {
			props: { field }
		});
		await delay();
		const inputEl = container.querySelector('input') as HTMLInputElement;
		expect(inputEl).toBeTruthy();
		setInputValue(inputEl, 'inputvalue1');
		await delay();
		expect(field.form.root.value).eq('inputvalue1');
		setInputValue(inputEl, 'inputvalue2');
		await delay();
		expect(field.form.root.value).eq('inputvalue2');
	});

	it('赋值', async () => {
		const field1$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
		const field2$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
		const schema = v.pipe(
			v.object({
				k1: v.pipe(v.string(), getField(field1$)),
				k2: v.pipe(v.string(), actions.attributes.set({ class: 'mode2' }), getField(field2$))
			})
		);
		const value = { k1: '', k2: '' };
		const { instance } = await createComponent(schema, value, {
			defaultConfig: {
				types: {
					object: {
						type: HybridGroup
					}
				}
			}
		});
		const inputs = instance.container.querySelectorAll('input');
		expect(inputs.length).eq(2);
		const el1 = instance.container.querySelector<HTMLInputElement>('.mode1')!;
		setInputValue(el1, 'inputValue1');
		await delay();
		const field1 = await field1$.promise;

		expect(field1.form.control!.value).eq('inputValue1');
		const el2 = instance.container.querySelector<HTMLInputElement>('.mode2')!;
		setInputValue(el2, 'inputValue2');
		await delay();
		const field2 = await field2$.promise;
		expect(field2.form.control!.value).eq('inputValue2');

		expect(instance.container.querySelector('.mode1-wrapper')).toBeTruthy();
	});
});

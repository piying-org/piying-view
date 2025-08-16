import { describe, it, expect } from 'vitest';
import * as v from 'valibot';
import { createComponent } from './util/create-component.svelte';
import { setInputValue } from './util/event';
import { delay } from './util/delay';
describe('hello', () => {
	it('string', async () => {
		const schema = v.string();
		const model = $state('init');

		let { instance, modelChange$ } = await createComponent(schema, model);
		const el = instance.container.querySelector('input')!;
		expect(el.value).eq('init');
		setInputValue(el, '123');
		await delay();
		expect(el.value).eq('123');
		expect(modelChange$()).eq('123');
	});
});

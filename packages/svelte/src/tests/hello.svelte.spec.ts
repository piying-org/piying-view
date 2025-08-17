import { describe, it, expect } from 'vitest';
import * as v from 'valibot';
import { createComponent } from './util/create-component.svelte';
import { setInputValue } from './util/event';
import { delay } from './util/delay';
import { fireEvent } from '@testing-library/svelte';
import { setComponent } from '@piying/view-core';
import { userEvent } from '@testing-library/user-event';

describe('hello', () => {
	it('string', async () => {
		const schema = v.string();
		const model = 'init';

		const { instance, modelChange$, destroy } = await createComponent(schema, model);
		const el = instance.container.querySelector('input')!;
		expect(el.value).eq('init');
		setInputValue(el, '123');
		await delay();
		expect(el.value).eq('123');
		expect(modelChange$()).eq('123');
		destroy();
	});

	it('group=>string', async () => {
		const schema = v.object({
			k1: v.string()
		});
		const model = { k1: 'init' };
		const { instance, modelChange$, destroy } = await createComponent(schema, model);
		const el = instance.container.querySelector('input')!;
		expect(el.value).eq('init');
		setInputValue(el, '123');
		await delay();
		expect(el.value).eq('123');
		expect(modelChange$()).deep.eq({ k1: '123' });
		destroy();
	});

	it('group=>group=>string', async () => {
		const schema = v.object({
			o1: v.object({ k1: v.string() })
		});
		const model = { o1: { k1: 'init' } };
		const { instance, modelChange$, destroy } = await createComponent(schema, model);
		const el = instance.container.querySelector('input')!;
		expect(el.value).eq('init');
		setInputValue(el, '123');
		await delay();
		expect(el.value).eq('123');
		expect(modelChange$()).deep.eq({ o1: { k1: '123' } });
		destroy();
	});

	it('arry=>string', async () => {
		const schema = v.array(v.string());
		const value = ['init'];
		const { instance, modelChange$, destroy } = await createComponent(schema, value);
		const el = instance.container.querySelector('input')!;
		expect(el.value).eq('init');
		setInputValue(el, '123');
		await delay();
		expect(el.value).eq('123');
		expect(modelChange$()).deep.eq(['123']);
		destroy();
	});

	it('boolean', async () => {
		const schema = v.boolean();
		const model = true;
		const { instance, modelChange$, destroy } = await createComponent(schema, model);
		const el = instance.container.querySelector('input')!;
		expect(el.checked).eq(true);
		fireEvent.click(el);
		expect(el.checked).eq(false);
		await delay();
		expect(modelChange$()).eq(false);
		destroy();
	});

	it('radio', async () => {
		const schema = v.pipe(v.picklist(['v1', 'v2']), setComponent('radio'));
		const model = 'v1';
		const { instance, modelChange$, destroy } = await createComponent(schema, model);
		const el1 = instance.container.querySelector('.r1')!;
		const el2 = instance.container.querySelector('.r2')!;
		expect((el1 as any).checked).eq(true);
		expect((el2 as any).checked).eq(false);
		fireEvent.click(el2);
		await delay();
		expect((el1 as any).checked).eq(false);
		expect((el2 as any).checked).eq(true);
		await delay();
		expect(modelChange$()).eq('v2');
		destroy();
	});
	it('number', async () => {
		const schema = v.number();
		const model = 123;
		const { instance, modelChange$, destroy } = await createComponent(schema, model);
		const el = instance.container.querySelector('input')!;
		expect(el.value).eq('123');
		setInputValue(el, '456');
		await delay();
		expect(el.value).eq('456');
		expect(modelChange$()).eq(456);
		destroy();
	});

	it('select', async () => {
		const schema = v.pipe(v.picklist(['v1', 'v2']));
		const model = 'v1';
		const { instance, modelChange$, destroy } = await createComponent(schema, model);
		const selectEl = instance.container.querySelector('select')!;
		const el1 = instance.container.querySelector('.r1')!;
		const el2 = instance.container.querySelector('.r2')! as HTMLOptionElement;
		expect((el1 as any).selected).eq(true);
		expect((el2 as any).selected).eq(false);
		await userEvent.selectOptions(selectEl, el2);
		fireEvent.change(selectEl);
		expect((el1 as any).selected).eq(false);
		expect((el2 as any).selected).eq(true);
		await delay();
		expect(modelChange$()).eq('v2');
		destroy();
	});
});

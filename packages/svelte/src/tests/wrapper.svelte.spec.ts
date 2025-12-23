import { describe, it, expect } from 'vitest';

import * as v from 'valibot';

import { NFCSchema, setComponent, actions } from '@piying/view-core';

import { delay } from './util/delay';
import Wrapper1 from './component/wrapper1.svelte';
import Wrapper2 from './component/wrapper2.svelte';
import WrapperField from './component/wrapper-field.svelte';
import { getField } from './util/actions';
import InputsTest from './component/inputs-test.svelte';
import WrapperOutput from './component/wrapper-output.svelte';
import { fireEvent } from '@testing-library/dom';
import type { PiResolvedViewFieldConfig } from '@piying/view-svelte';
import { createComponent } from './util/create-component.svelte';
const WrapperObj = {
	'wrapper-field': {
		type: WrapperField
	},
	wrapper1: {
		type: Wrapper1
	},
	wrapper2: {
		type: Wrapper2
	}
};
describe('wrapper', () => {
	it('1层wrapper', async () => {
		const field$ = Promise.withResolvers<PiResolvedViewFieldConfig>();

		const schema = v.pipe(
			NFCSchema,
			getField(field$),
			setComponent('inputTest'),
			actions.wrappers.set(['wrapper1'])
		);
		const value = undefined;
		const { instance } = await createComponent(schema, value, {
			defaultConfig: {
				types: {
					inputTest: {
						type: InputsTest
					}
				},
				wrappers: WrapperObj
			}
		});
		const field = await field$.promise;
		expect(field.form.control).toBeFalsy();
		const inputEl = instance.container.querySelector('.inputs-test');
		expect(inputEl).ok;
		expect(instance.container.querySelector('.wrapper1')).ok;
	});
	it('2层wrapper', async () => {
		const field$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
		const schema = v.pipe(
			NFCSchema,
			getField(field$),
			setComponent('inputTest'),
			actions.wrappers.set(['wrapper1', 'wrapper2'])
		);
		const value = undefined;
		const { instance } = await createComponent(schema, value, {
			defaultConfig: {
				types: {
					inputTest: {
						type: InputsTest
					}
				},
				wrappers: WrapperObj
			}
		});
		const field = await field$.promise;
		expect(field.form.control).toBeFalsy();
		const inputEl = instance.container.querySelector('.inputs-test');
		expect(inputEl).ok;
		expect(instance.container.querySelector('.wrapper1')).ok;
		expect(instance.container.querySelector('.wrapper2')).ok;
		expect(instance.container.querySelector('.wrapper1')?.querySelector('.wrapper2')).ok;
	});

	it('wrapper-input', async () => {
		const field$ = Promise.withResolvers<PiResolvedViewFieldConfig>();

		const schema = v.pipe(
			NFCSchema,
			getField(field$),
			setComponent('inputTest'),
			actions.wrappers.set([{ type: 'wrapper1', inputs: { input1: 'input1-value' } }])
		);
		const value = undefined;
		const { instance } = await createComponent(schema, value, {
			defaultConfig: {
				types: {
					inputTest: {
						type: InputsTest
					}
				},
				wrappers: WrapperObj
			}
		});
		const field = await field$.promise;
		expect(field.form.control).toBeFalsy();
		const inputEl = instance.container.querySelector('.inputs-test');
		expect(inputEl).ok;
		expect(instance.container.querySelector('.wrapper1')?.textContent).contain('input1-value');
		field.wrappers
			.items()[0]()
			.inputs.update((inputs) => ({ ...inputs, input1: 'input2-value' }));
		await delay(10);
		expect(instance.container.querySelector('.wrapper1')?.textContent).contain('input2-value');
	});
	it('wrapper-attr', async () => {
		const field$ = Promise.withResolvers<PiResolvedViewFieldConfig>();

		const schema = v.pipe(
			NFCSchema,
			getField(field$),
			setComponent('inputTest'),
			actions.wrappers.set([
				{ type: 'wrapper1', inputs: { input1: 'input1-value' }, attributes: { class: 'hello' } }
			])
		);
		const value = undefined;
		const { instance } = await createComponent(schema, value, {
			defaultConfig: {
				types: {
					inputTest: {
						type: InputsTest
					}
				},
				wrappers: WrapperObj
			}
		});
		const field = await field$.promise;
		expect(field.form.control).toBeFalsy();
		const inputEl = instance.container.querySelector('.inputs-test');
		expect(inputEl).ok;
		const el = instance.container.querySelector('.wrapper1');
		expect(el?.textContent).contain('input1-value');
		expect(el?.classList.contains('hello')).true;
	});
	it('wrapper-output', async () => {
		const field$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
		let isEmit = false;
		const schema = v.pipe(
			NFCSchema,
			getField(field$),
			setComponent('inputTest'),
			actions.wrappers.set([
				{
					type: 'wrapper1',
					outputs: {
						output1: (value) => {
							expect(value).eq('1');
							isEmit = true;
						}
					}
				}
			])
		);
		const value = undefined;
		const { instance } = await createComponent(schema, value, {
			defaultConfig: {
				types: {
					inputTest: {
						type: InputsTest
					}
				},
				wrappers: {
					wrapper1: {
						type: WrapperOutput
					}
				}
			}
		});
		const field = await field$.promise;
		expect(field.form.control).toBeFalsy();
		const inputEl = instance.container.querySelector('.inputs-test');
		expect(inputEl).ok;
		const btnwrapper = instance.container.querySelector('.wrapper-btn')!;
		fireEvent.click(btnwrapper);
		expect(isEmit).eq(true);
	});

	it('wrapper中获得field', async () => {
		let isEmit = false;
		const schema = v.pipe(
			v.string(),
			actions.wrappers.set([
				{
					type: 'wrapper-field',
					outputs: {
						emitField: (value: any) => {
							expect(value).ok;
							expect(value.form.control?.value).eq('1234');
							isEmit = true;
						}
					}
				}
			])
		);
		const value = '1234';
		await createComponent(schema, value, {
			defaultConfig: {
				wrappers: WrapperObj
			}
		});

		expect(isEmit).eq(true);
	});
});

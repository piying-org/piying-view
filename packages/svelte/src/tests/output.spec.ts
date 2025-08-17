import { describe, it, expect } from 'vitest';

import * as v from 'valibot';
import { NFCSchema, setComponent, setOutputs } from '@piying/view-core';
import { getField } from './util/actions';
import OutputTest from './component/output-test.svelte';
import { fireEvent } from '@testing-library/dom';
import type { PiResolvedViewFieldConfig } from '@piying/view-svelte';
import { createComponent } from './util/create-component.svelte';
describe('output', () => {
	it('赋值', async () => {
		let emitIndex = 0;
		const field$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
		const schema = v.pipe(
			NFCSchema,
			setComponent('outputTest'),
			setOutputs({
				emit1: (value) => {
					expect(value).eq('value1');
					emitIndex++;
				},
				emit2: (value) => {
					expect(value).eq('value2');
					emitIndex++;
				}
			}),
			getField(field$)
		);
		const value = undefined;
		const { instance } = await createComponent(schema, value, {
			defaultConfig: {
				types: {
					outputTest: {
						type: OutputTest
					}
				}
			}
		});
		const inputEl = instance.container.querySelector('.btn1')!;
		fireEvent.click(inputEl);
		expect(emitIndex).eq(1);
		const inputEl2 = instance.container.querySelector('.btn2')!;
		fireEvent.click(inputEl2);
		expect(emitIndex).eq(2);
	});
});

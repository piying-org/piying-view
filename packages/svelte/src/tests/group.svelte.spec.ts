import { describe, it, expect } from 'vitest';

import * as v from 'valibot';

import { actions, setComponent } from '@piying/view-core';

import GroupAttr from './component/group-attributes.svelte';
import RestGroup from './component/group/rest-group.svelte';
import { delay } from './util/delay';
import { createComponent } from './util/create-component.svelte';
describe('group', () => {
	it('attributes', async () => {
		const schema = v.pipe(
			v.object({
				k1: v.string()
			}),
			setComponent('group1'),
			actions.class.component('test1')
		);
		const value = { k1: '' };
		const { instance } = await createComponent(schema, value, {
			defaultConfig: {
				types: {
					group1: {
						type: GroupAttr
					}
				}
			}
		});
		const inputEl = instance.container.querySelector('.test1.group-attr');
		expect(inputEl).ok;
	});
	it('rest', async () => {
		const define = v.pipe(
			v.objectWithRest(
				{
					k1: v.pipe(v.string())
				},
				v.pipe(v.string())
			),
			setComponent(RestGroup)
		);
		const value = { k1: 'value1', k2: '22' };
		const { instance, setModel } = await createComponent(define, value, {
			defaultConfig: {}
		});
		expect(instance.container.querySelector('.fields input')).ok;
		expect(instance.container.querySelector('.rest-fields input')).ok;
		setModel({ k1: 'value1' });
		await delay(10);
		expect(instance.container.querySelector('.fields input')).ok;
		expect(instance.container.querySelector('.rest-fields input')).not.ok;
	});
});

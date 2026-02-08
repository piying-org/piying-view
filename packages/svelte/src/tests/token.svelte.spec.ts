import { describe, it, expect } from 'vitest';

import * as v from 'valibot';

import { NFCSchema, setComponent, actions } from '@piying/view-core';

import { createComponent } from './util/create-component.svelte';
import Token from './component/token.svelte';

describe('token', () => {
	it('初始化注入', async () => {
		let check = false;
		const schema = v.pipe(
			NFCSchema,
			setComponent(Token),
			actions.inputs.patch({
				tokenChange: (event: any) => {
					expect(event.options()).ok;
					expect(event.schema()).ok;
					expect(event.model).ok;
					check = true;
				}
			})
		);
		const value = undefined;
		const { instance } = await createComponent(schema, value, {});
		expect(check).ok;
	});
});

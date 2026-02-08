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
import Token from './component/token.svelte';
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

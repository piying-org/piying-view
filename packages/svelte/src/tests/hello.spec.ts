import { describe, it, expect } from 'vitest';
import * as v from 'valibot';
import { createComponent } from './util/create-component';
describe('hello', () => {
	it('string', async () => {
		const schema = v.string();
	});
});

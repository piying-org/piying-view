import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import { makeField } from './util/field-fixture';
import { delay } from './util/delay';
import { setInputValue } from './util/event';
import FieldBindTest from './component/field-bind-test.svelte';

describe('Field - cvaa/field 按 path 推导强类型', () => {
	it('运行时: 类型断言全部成立 (组件内 Equal/IsAny 均为 true)', async () => {
		const { container } = render(FieldBindTest, { props: { field: makeField() } });
		await delay();
		expect(container.querySelector('.t-assert')?.textContent).toBe('true');
		expect(container.querySelector('.t-num')?.textContent).toBe('true');
	});

	it('运行时: 原生 input 通过 cvaa 写回 text1', async () => {
		const field = makeField();
		const { container } = render(FieldBindTest, { props: { field } });
		await delay();

		setInputValue(container.querySelector('.t-text') as HTMLInputElement, 'hello');
		await delay();
		expect(field.get(['text1'])!.form.control!.value).eq('hello');
		expect(container.querySelector('.t-out')?.textContent).toBe('hello');
	});

	it('运行时: 外部改值会同步回 cvaa', async () => {
		const field = makeField();
		const { container } = render(FieldBindTest, { props: { field } });
		await delay();

		field.get(['text1'])!.form.control!.updateValue('from-outside');
		await delay();
		expect(container.querySelector('.t-out')?.textContent).toBe('from-outside');
	});
});

import { fireEvent } from '@testing-library/svelte';

export function setInputValue(el: HTMLInputElement, value: string) {
	el.value = value;
	fireEvent.input(el, { target: { value: value } });
}

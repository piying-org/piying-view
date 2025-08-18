import { fireEvent } from '@solidjs/testing-library';

export function setInputValue(el: HTMLInputElement, value: string) {
  el.value = value;
  fireEvent.input(el, { target: { value: value } });
}

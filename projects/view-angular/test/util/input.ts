export function htmlInput(el: HTMLInputElement, value: string) {
  el.value = value;
  el.dispatchEvent(new Event('input'));
}

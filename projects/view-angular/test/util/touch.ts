export function htmlBlur(el: HTMLInputElement) {
  el.dispatchEvent(new Event('blur'));
}

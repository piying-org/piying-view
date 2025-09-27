import { parseSelectorToR3Selector } from './selector';

export function createElement(selector: string, document: Document) {
  const [item] = parseSelectorToR3Selector(selector);
  const [element, ...rest] = item;
  if (!element || typeof element !== 'string') {
    throw new Error(`tag must be string;selector: ${selector}`);
  }
  const el = document.createElement(element);
  let index = 0;
  for (; index < rest.length; index += 2) {
    const key = rest[index];
    const value = rest[index + 1];
    if (typeof key !== 'string') {
      break;
    }
    el.setAttribute(key, value as string);
  }
  let type;
  for (; index < rest.length; index++) {
    const item = rest[index];
    if (typeof item === 'number') {
      type = item;
      continue;
    }
    // class
    if (type === 8) {
      el.classList.add(item);
    }
  }
  return el;
}

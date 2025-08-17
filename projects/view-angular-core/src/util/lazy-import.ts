export type LazyImport<T> = () => Promise<T>;
const markSymbol = Symbol();
export function markAsLazy(fn: () => Promise<any>) {
  return { [markSymbol]: fn };
}
export function isLazyType(input: any): boolean {
  return markSymbol in input;
}
export function getLazyType<T>(input: any) {
  return input[markSymbol] as T;
}

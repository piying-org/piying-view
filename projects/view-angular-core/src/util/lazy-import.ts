export type LazyImport<T> = () => Promise<T>;
const markSymbol = Symbol();
export function lazyMark<T>(fn: LazyImport<T>) {
  return { [markSymbol]: fn };
}
export type LazyMarkType<T> = ReturnType<typeof lazyMark<T>>;
export function isLazyMark(input: any): boolean {
  return markSymbol in input;
}
export function getLazyImport<T>(input: any) {
  return (input[markSymbol] ??
    (typeof input === 'function' ? input : undefined)) as T | undefined;
}

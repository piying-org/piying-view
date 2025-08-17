export type LazyImport<T> = () => Promise<T>;
const markSymbol = Symbol();
export function markAsLazy<T>(fn: () => Promise<T>) {
  return { [markSymbol]: fn };
}
export type LazyImportType<T> = ReturnType<typeof markAsLazy<T>>;
export function isLazyType(input: any): boolean {
  return markSymbol in input;
}
export function getLazyType<T>(input: any) {
  return (input[markSymbol] ??
    (typeof input === 'function' ? input : undefined)) as T | undefined;
}

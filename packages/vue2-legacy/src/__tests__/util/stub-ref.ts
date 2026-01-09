export function shallowRef<T>(value?: T) {
  return {
    value,
  };
}
export type ShallowRef = ReturnType<typeof shallowRef>;

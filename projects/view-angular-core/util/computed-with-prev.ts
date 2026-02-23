import { computed, CreateComputedOptions, Signal } from '@angular/core';

export function computedWithPrev<T>(
  computation: (prev: T | undefined) => T,
  options?: CreateComputedOptions<T>,
): Signal<T> {
  let previous: T | undefined;
  return computed(() => {
    const newValue = computation(previous);
    previous = newValue;
    return newValue;
  }, options);
}

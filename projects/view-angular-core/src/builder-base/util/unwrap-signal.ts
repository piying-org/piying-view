import { isSignal, Signal } from '@angular/core';

export function unWrapSignal<T>(value?: T | Signal<T>) {
  return isSignal(value) ? value() : value;
}

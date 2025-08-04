import { isSignal, Signal, WritableSignal } from '@angular/core';

export function unWrapSignal<T>(value?: T | Signal<T>) {
  return isSignal(value) ? value() : value;
}

export type UnWrapSignal<T> = T extends Signal<infer Value> ? Value : T;

export type SignalInputValue<T> = T | Signal<T> | WritableSignal<T> | undefined;

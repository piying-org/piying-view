import { Signal, WritableSignal } from '@angular/core';

export type UnWrapSignal<T> = T extends Signal<infer Value> ? Value : T;

export type SignalInputValue<T> = T | Signal<T> | WritableSignal<T> | undefined;

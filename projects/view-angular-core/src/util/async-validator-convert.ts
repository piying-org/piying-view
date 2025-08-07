import { computed, signal } from '@angular/core';
import { isObservable, Observable } from 'rxjs';
import { isPromise } from '../convert/util/is-promise';
export const ValidatorPending = Symbol('PENDING');
export type AsyncValidatorEvent =
  | {
      value: any;
    }
  | {
      error: Error;
    }
  | typeof ValidatorPending;
function promiseToSignal<T>(input: Promise<T>) {
  const value$ = signal<AsyncValidatorEvent>(ValidatorPending);
  input.then((value) => {
    value$.set({ value });
  });
  return value$;
}
function observableToSignal<T>(input: Observable<T>) {
  const value$ = signal<AsyncValidatorEvent>(ValidatorPending);
  input.subscribe({
    next: (value) => {
      value$.set({ value });
    },
    error: (error) => {
      value$.set({ error });
    },
  });
  return value$;
}

export function asyncValidatorToSignal(input: any) {
  if (isPromise(input)) {
    return promiseToSignal(input);
  } else if (isObservable(input)) {
    return observableToSignal(input);
  } else {
    return computed(() => {
      return { value: input() };
    });
  }
}

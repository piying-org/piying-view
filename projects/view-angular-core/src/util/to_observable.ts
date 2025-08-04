import { Injector, Signal, inject, untracked, DestroyRef } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { effectListen } from './effect-listen';

/**
 * Options for `toObservable`.
 *
 * @publicApi 20.0
 */
export interface ToObservableOptions {
  /**
   * The `Injector` to use when creating the underlying `effect` which watches the signal.
   *
   * If this isn't specified, the current [injection context](guide/di/dependency-injection-context)
   * will be used.
   */
  injector?: Injector;
}

/**
 * Exposes the value of an Angular `Signal` as an RxJS `Observable`.
 *
 * The signal's value will be propagated into the `Observable`'s subscribers using an `effect`.
 *
 * `toObservable` must be called in an injection context unless an injector is provided via options.
 *
 * @publicApi 20.0
 */
export function toObservable<T>(
  listen: Signal<any>,
  source: Signal<T>,
  options?: ToObservableOptions,
): Observable<T> {
  const injector = options?.injector ?? inject(Injector);
  const subject = new BehaviorSubject<T>(source());

  const watcher = effectListen(
    listen,
    () => {
      let value: T;
      try {
        value = source();
      } catch (err) {
        untracked(() => subject.error(err));
        return;
      }
      untracked(() => subject.next(value));
    },
    { injector, manualCleanup: true },
  );

  injector.get(DestroyRef).onDestroy(() => {
    watcher.destroy();
    subject.complete();
  });

  return subject.asObservable();
}

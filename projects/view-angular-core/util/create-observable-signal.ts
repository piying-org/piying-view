import { CreateSignalOptions, Signal, signal } from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  OperatorFunction,
  shareReplay,
} from 'rxjs';
type ObservableSignal<T> = Signal<T> & {
  asObservable: () => Observable<T>;
  pipe: Observable<T>['pipe'];
  subscribe: Observable<T>['subscribe'];
};
export function observableSignal<T, R>(
  initialValue: T,
  options?: CreateSignalOptions<T> & { pipe: OperatorFunction<T, R> },
): ObservableSignal<T> {
  const value$ = signal(initialValue, options);
  const value2$ = new BehaviorSubject(initialValue);
  const a = value2$.pipe(shareReplay());
  const oldSet = value$.set;
  a.subscribe((value) => {
    oldSet(value);
  });
  value$.set = (value: T) => {
    value2$.next(value);
  };

  value$.update = (fn: (value: T) => T) => {
    const result = fn(value$());
    value2$.next(result);
  };
  (value$ as any as ObservableSignal<T>).asObservable = () =>
    value2$.asObservable();
  (value$ as any as ObservableSignal<T>).pipe = ((...args: any[]) =>
    (value2$.pipe as any)(...args)) as any;
  (value$ as any as ObservableSignal<T>).subscribe = ((...args: any[]) =>
    (value2$.subscribe as any)(...args)) as any;
  return value$ as any;
}

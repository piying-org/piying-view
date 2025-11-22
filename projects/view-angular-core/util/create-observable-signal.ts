import { CreateSignalOptions, signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export function createObSignal<T>(
  initialValue: T,
  options?: CreateSignalOptions<T>,
) {
  const value$ = signal(initialValue, options);
  const value2$ = new BehaviorSubject(initialValue);
}

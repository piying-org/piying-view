import { observableSignal } from '../util';
import { isSignal, signal } from '@angular/core';

describe('observable-signal', () => {
  it('hello', async () => {
    const value$ = observableSignal('1');
    expect(value$()).toEqual('1');
    expect(isSignal(value$)).toBeTrue();
    const result$ = signal<string | undefined>(undefined);
    value$.subscribe((value) => {
      result$.set(value);
    });
    expect(result$()).toEqual('1');
  });
});

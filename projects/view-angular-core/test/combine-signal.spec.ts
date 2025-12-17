import { signal } from '@angular/core';
import { combineSignal } from '../util/create-combine-signal';

describe('combine-signal', () => {
  it('hello', async () => {
    const value$ = combineSignal<number>();
    expect(value$()).toEqual([]);
    const a = signal(1);
    value$.add(a);
    expect(value$()).toEqual([1]);
    value$.remove(a);
    expect(value$()).toEqual([]);
  });
});

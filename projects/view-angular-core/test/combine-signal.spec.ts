import { map, pipe } from 'rxjs';
import { observableSignal } from '../util';
import { isSignal, signal } from '@angular/core';
import { combineSignal } from '../util/create-combine-signal';
import { computed } from 'static-injector';

describe('combine-signal', () => {
  it('hello', async () => {
    const value$ = combineSignal<number>();
    expect(value$()).toEqual([]);
    let a = signal(1);
    value$.add(a);
    expect(value$()).toEqual([1]);
    value$.remove(a);
    expect(value$()).toEqual([]);
  });
});

import { signal } from '@angular/core';
import { asyncObjectSignal } from '../util/create-async-object-signal';
import { delay } from './util/delay';
import { Subject } from 'rxjs';

describe('async-object-signal', () => {
  it('hello', async () => {
    const value$ = asyncObjectSignal<any>({ value: 1 });
    expect(value$()).toEqual({ value: 1 });
    value$.update((data) => ({
      ...data,
      value2: 2,
    }));
    expect(value$()).toEqual({ value: 1, value2: 2 });
    value$.set({ value3: 3 });
    expect(value$()).toEqual({ value3: 3 });
  });
  it('promise', async () => {
    const value$ = asyncObjectSignal<any>({ value: 1 });
    value$.connect('k1', Promise.resolve(20));
    await delay(0);
    expect(value$()).toEqual({ value: 1, k1: 20 });
  });
  it('promise-remove', async () => {
    const value$ = asyncObjectSignal<any>({ value: 1 });
    value$.connect('k1', Promise.resolve(20));
    value$.disconnect('k1');
    await delay(0);
    expect(value$()).toEqual({ value: 1 });
  });
  it('rxjs', async () => {
    const value1$ = new Subject();
    const value$ = asyncObjectSignal<any>({ value: 1 });
    value$.connect('k1', value1$);
    value1$.next(1);
    expect(value$()).toEqual({ value: 1, k1: 1 });
    value1$.next(2);
    expect(value$()).toEqual({ value: 1, k1: 2 });
  });
  it('rxjs-remove', async () => {
    const value1$ = new Subject();
    const value$ = asyncObjectSignal<any>({ value: 1 });
    value$.connect('k1', value1$);
    value$.disconnect('k1');
    value1$.next(1);
    expect(value$()).toEqual({ value: 1 });
  });
  it('signal', async () => {
    const value1$ = signal(0);
    const value$ = asyncObjectSignal<any>({ value: 1 });
    value$.connect('k1', value1$);
    expect(value$()).toEqual({ value: 1, k1: 0 });
    value1$.set(1);
    expect(value$()).toEqual({ value: 1, k1: 1 });
    value1$.set(2);
    expect(value$()).toEqual({ value: 1, k1: 2 });
  });
  it('signal-remove', async () => {
    const value1$ = signal(0);
    const value$ = asyncObjectSignal<any>({ value: 1 });
    value$.connect('k1', value1$);
    value$.disconnect('k1');
    expect(value$()).toEqual({ value: 1 });
  });
  it('rxjs-conect2', async () => {
    const value1$ = new Subject();
    const value2$ = new Subject();
    const value$ = asyncObjectSignal<any>({ value: 1 });
    value$.connect('k1', value1$);
    value$.connect('k1', value2$);
    value1$.next(1);
    expect(value$()).toEqual({ value: 1 });
    value2$.next(2);
    expect(value$()).toEqual({ value: 1, k1: 2 });
  });
});

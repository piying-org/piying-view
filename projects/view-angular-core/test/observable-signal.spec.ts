import { map, pipe } from 'rxjs';
import { observableSignal } from '../util';
import { isSignal, signal } from '@angular/core';

describe('observable-signal', () => {
  it('hello', async () => {
    const value$ = observableSignal('1', { autoDestroy: false });
    expect(value$()).toEqual('1');
    expect(isSignal(value$)).toBeTrue();
    const result$ = signal<string | undefined>(undefined);
    value$.input$$.subscribe((value) => {
      result$.set(value);
    });
    expect(result$()).toEqual('1');
  });
  it('pipe', async () => {
    const value$ = observableSignal(1 as number, {
      pipe: pipe(map((value) => value * 2)),
      autoDestroy: false,
    });
    expect(value$()).toEqual(1);
    expect(value$.output()).toEqual(2);
    value$.set(2);
    expect(value$()).toEqual(2);
    expect(value$.output()).toEqual(4);
    let input: any;
    value$.input$$.subscribe((value) => {
      input = value;
    });
    expect(input).toEqual(2);
    let output: any;
    value$.output$$.subscribe((value) => {
      output = value;
    });
    expect(output).toEqual(4);
  });
});

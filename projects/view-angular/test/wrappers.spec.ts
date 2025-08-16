import { signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { htmlInput } from './util/input';
import { Wrapper1Component } from './wrapper1/component';
import * as v from 'valibot';
import { setInputs, setOutputs } from '@piying/view-angular-core';

import { createSchemaComponent } from './util/create-component';
import { setComponent, setWrappers } from '@piying/view-angular-core';

describe('带异步wrappers', () => {
  it('存在', async () => {
    const define = v.object({
      key1: v.pipe(
        v.string(),
        setComponent('test1'),
        setWrappers(['wrapper1', 'wrapper2']),
        setInputs({
          input1: 'div-display',
        }),
      ),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal({ key1: 'value1' }),

      {
        types: {
          test1: {
            type: () =>
              import('./test1/test1.component').then(
                (a) => a.Test1Component,
              ) as any,
          },
        },
        wrappers: {
          wrapper1: {
            type: Wrapper1Component,
            inputs: { wInput1: 'wInput1' },
          },
          wrapper2: {
            type: () =>
              import('./wrapper2/component').then((a) => a.Wrapper2Component),
          },
        },
      },
    );
    await fixture.whenStable();
    fixture.detectChanges();
    expect(true).toBe(true);
    expect(element).toBeTruthy();
    const input1Div = element.querySelector('.test1-div-input1') as HTMLElement;
    expect(input1Div).toBeTruthy();
    expect(input1Div.innerHTML).toEqual('div-display');
    expect(element.querySelector('.wrapper1-div-label')).toBeTruthy();
    expect(element.querySelector('.wrapper1-div-label')?.innerHTML).toBe(
      'wInput1',
    );
    expect(element.querySelector('.wrapper2-div-label')).toBeTruthy();
  });
  it('输入', async () => {
    const define = v.object({
      key1: v.pipe(
        v.string(),
        setComponent('test1'),
        setWrappers(['wrapper1', 'wrapper2']),
        setInputs({
          input1: 'div-display',
        }),
      ),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal({ key1: 'value1' }),

      {
        types: {
          test1: {
            type: () =>
              import('./test1/test1.component').then(
                (a) => a.Test1Component,
              ) as any,
          },
        },
        wrappers: {
          wrapper1: {
            type: Wrapper1Component,
            inputs: { wInput1: 'wInput1' },
          },
          wrapper2: {
            type: () =>
              import('./wrapper2/component').then((a) => a.Wrapper2Component),
          },
        },
      },
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const input1Div = element.querySelector('.test1-div-input1') as HTMLElement;
    expect(input1Div).toBeTruthy();
    expect(input1Div.innerHTML).toEqual('div-display');
  });
  it('输出', async () => {
    const subject1 = new BehaviorSubject<string>('');
    const subject2 = new BehaviorSubject<string>('');
    const define = v.object({
      key1: v.pipe(
        v.string(),
        setComponent('test1'),
        setWrappers(['wrapper1', 'wrapper2']),
        setInputs({
          input1: 'div-display',
        }),
        setOutputs({
          output1: (value) => {
            subject1.next(value);
          },
          output2: (value) => {
            subject2.next(value);
          },
        }),
      ),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal({ key1: 'value1' }),

      {
        types: {
          test1: {
            type: () =>
              import('./test1/test1.component').then(
                (a) => a.Test1Component,
              ) as any,
          },
        },
        wrappers: {
          wrapper1: {
            type: Wrapper1Component,
            inputs: { wInput1: 'wInput1' },
          },
          wrapper2: {
            type: () =>
              import('./wrapper2/component').then((a) => a.Wrapper2Component),
          },
        },
      },
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const inputEl = element.querySelector('input')!;
    const displayValueEl = element.querySelector('.test1-div-modelValue')!;

    expect(displayValueEl.innerHTML).toBe('value1');
    expect(inputEl).toBeTruthy();
    htmlInput(inputEl, 'value2');
    expect(subject1.value).toBe('value2');
    expect(subject2.value).toBe('value2');
    await fixture.whenStable();
    fixture.detectChanges();
    expect(instance.model$()).toEqual({ key1: 'value2' });
  });
  it('取消wrapper', async () => {
    const define = v.object({
      key1: v.pipe(
        v.string(),
        setComponent('test1'),
        setWrappers(['wrapper1', 'wrapper2']),
        setInputs({
          input1: 'div-display',
        }),
      ),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal({ key1: 'value1' }),

      {
        types: {
          test1: {
            type: () =>
              import('./test1/test1.component').then(
                (a) => a.Test1Component,
              ) as any,
          },
        },
        wrappers: {
          wrapper1: {
            type: Wrapper1Component,
            inputs: { wInput1: 'wInput1' },
          },
          wrapper2: {
            type: () =>
              import('./wrapper2/component').then((a) => a.Wrapper2Component),
          },
        },
      },
    );
    await fixture.whenStable();
    fixture.detectChanges();
    expect(
      element.querySelector('.wrapper1-div-label')?.innerHTML,
    ).toBeTruthy();
    const define2 = v.object({
      key1: v.pipe(v.string(), setComponent('test1')),
    });
    instance.fields$.set(define2);
    await fixture.whenStable();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const inputEl = element.querySelector('input')!;
    expect(inputEl).toBeTruthy();
    expect(element.querySelector('.wrapper1-div-label')?.innerHTML).toBeFalsy();
  });
  it('修改wrapper', async () => {
    const define = v.object({
      key1: v.pipe(
        v.string(),
        setComponent('test1'),
        setWrappers(['wrapper1', 'wrapper2']),
        setInputs({
          input1: 'div-display',
        }),
      ),
    });

    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal({ key1: 'value1' }),

      {
        types: {
          test1: {
            type: () =>
              import('./test1/test1.component').then(
                (a) => a.Test1Component,
              ) as any,
          },
        },
        wrappers: {
          wrapper1: {
            type: Wrapper1Component,
            inputs: { wInput1: 'wInput1' },
          },
          wrapper2: {
            type: () =>
              import('./wrapper2/component').then((a) => a.Wrapper2Component),
          },
        },
      },
    );
    await fixture.whenStable();
    fixture.detectChanges();
    expect(
      element.querySelector('.wrapper1-div-label')?.innerHTML,
    ).toBeTruthy();
    const define2 = v.object({
      key1: v.pipe(
        v.string(),
        setComponent('test1'),
        setWrappers(['wrapper2', 'wrapper1']),
      ),
    });

    await fixture.whenStable();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const inputEl = element.querySelector('input')!;
    expect(inputEl).toBeTruthy();
    expect(
      element.querySelector('.wrapper1-div-label')?.innerHTML,
    ).toBeTruthy();
  });
});

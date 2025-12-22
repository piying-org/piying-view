import { computed, signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { htmlInput } from './util/input';
import { Wrapper1Component } from './wrapper1/component';
import * as v from 'valibot';
import {
  NFCSchema,
  patchAsyncAttributes,
  patchAsyncInputs,
  patchAsyncOutputs,
  patchAsyncWrapper,
  setInputs,
  setOutputs,
} from '@piying/view-angular-core';

import { createSchemaComponent } from './util/create-component';
import { setComponent, setWrappers } from '@piying/view-angular-core';
import { Test1Component } from './test1/test1.component';
import { Wrapper2Component } from './wrapper2/component';
import { WrapperChange } from './wrapper-change/component';
import { ChangeInputWrapper } from './wrapper-change/change-input/component';

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
            actions: [patchAsyncInputs({ wInput1: () => 'wInput1' })],
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
            actions: [patchAsyncInputs({ wInput1: () => 'wInput1' })],
          },
          wrapper2: { type: Wrapper2Component },
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
            actions: [patchAsyncInputs({ wInput1: () => 'wInput1' })],
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
            actions: [patchAsyncInputs({ wInput1: () => 'wInput1' })],
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
      ),
    });

    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal({ key1: 'value1' }),

      {
        types: {
          test1: {
            type: Test1Component,
          },
        },
        wrappers: {
          wrapper1: {
            type: Wrapper1Component,
            actions: [patchAsyncInputs({ wInput1: () => 'wInput1' })],
          },
          wrapper2: {
            type: Wrapper2Component,
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
  it('patchAsyncWrapper', async () => {
    let outputed = false;
    const define = v.pipe(
      v.string(),
      setComponent('test1'),
      patchAsyncWrapper('wrapper1', [
        patchAsyncAttributes({
          class: () => 'test1',
        }),
        patchAsyncInputs({
          wInput1: (filed) => 'div-display',
        }),
        patchAsyncOutputs({
          output1: (field) => (event: any) => {
            outputed = true;
            expect(event).toBeTruthy();
            expect(field).toBeTruthy();
          },
        }),
      ]),
    );
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal(''),
      {
        types: {
          test1: {
            type: Test1Component,
          },
        },
        wrappers: {
          wrapper1: {
            type: Wrapper1Component,
          },
        },
      },
    );
    await fixture.whenStable();
    fixture.detectChanges();
    expect(element).toBeTruthy();
    expect(element.querySelector('.test1')).toBeTruthy();
    const input1Div = element.querySelector(
      '.wrapper1-div-label',
    ) as HTMLElement;
    expect(input1Div).toBeTruthy();
    expect(input1Div.innerHTML).toEqual('div-display');
    input1Div.click();
    expect(outputed).toEqual(true);
  });
  it('patchAsyncWrapper dynamic change input', async () => {
    const data$ = signal('div-display1');
    const define = v.pipe(
      v.string(),
      setComponent('test1'),
      patchAsyncWrapper('wrapper1', [
        patchAsyncInputs({
          wInput1: (filed) => data$,
        }),
      ]),
    );
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal(''),
      {
        types: {
          test1: {
            type: Test1Component,
          },
        },
        wrappers: {
          wrapper1: {
            type: Wrapper1Component,
          },
        },
      },
    );
    await fixture.whenStable();
    fixture.detectChanges();
    expect(element).toBeTruthy();
    const input1Div = element.querySelector(
      '.wrapper1-div-label',
    ) as HTMLElement;
    expect(input1Div).toBeTruthy();
    expect(input1Div.innerHTML).toEqual('div-display1');
    data$.set('div-display2');
    await fixture.whenStable();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(input1Div.innerHTML).toEqual('div-display2');
  });
  it('wrapper change input', async () => {
    const input2$ = signal('2');
    const define = v.pipe(
      NFCSchema,
      setComponent(WrapperChange),
      setWrappers([
        {
          type: ChangeInputWrapper,
        },
      ]),
      patchAsyncInputs({
        input2: () => computed(() => input2$()),
      }),
    );
    const { fixture, instance, element, field$$ } = await createSchemaComponent(
      signal(define),
      signal(''),
      {},
    );
    expect(field$$()?.inputs()['input1']).toEqual('123');
    expect(field$$()?.inputs()['input2']).toEqual('2');
    input2$.set('22');
    await fixture.whenStable();
    fixture.detectChanges();
    expect(element).toBeTruthy();
    expect(field$$()?.inputs()['input1']).toEqual('123');
    expect(field$$()?.inputs()['input2']).toEqual('22');
  });
});

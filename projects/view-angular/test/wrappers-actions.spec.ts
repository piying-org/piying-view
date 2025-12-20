import { signal } from '@angular/core';
import { createSchemaComponent } from './util/create-component';
import * as v from 'valibot';
import {
  changeAsyncWrapper2,
  patchAsyncAttributesCommon,
  patchAsyncClassCommon,
  patchAsyncEventsCommon,
  patchAsyncInputsCommon,
  patchAsyncWrapper2,
  setComponent,
} from '@piying/view-angular-core';
import { Wrapper3Component } from './wrapper3/component';
import { Test1Component } from './test1/test1.component';

describe('wrappers-actions', () => {
  const Define = {
    types: {
      test1: {
        type: Test1Component,
      },
    },
    wrappers: {
      wrapper1: {
        type: Wrapper3Component,
      },
    },
  };
  it('inputs', async () => {
    const define = v.pipe(
      v.string(),
      setComponent('test1'),
      patchAsyncWrapper2('wrapper1', [
        patchAsyncInputsCommon({
          wInput1: (field) => signal('input1'),
        }),
      ]),
    );
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal(''),
      Define,
    );
    await fixture.whenStable();
    fixture.detectChanges();
    expect(element).toBeTruthy();
    const input1Div = element.querySelector(
      '.wrapper1-div-label',
    ) as HTMLElement;
    expect(input1Div).toBeTruthy();
    expect(input1Div.innerHTML.trim()).toEqual('input1');
  });
  it('attrs', async () => {
    const define = v.pipe(
      v.string(),
      setComponent('test1'),
      patchAsyncWrapper2('wrapper1', [
        patchAsyncAttributesCommon({
          class: (field) => 'input1',
        }),
      ]),
    );
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal(''),
      Define,
    );
    await fixture.whenStable();
    fixture.detectChanges();
    expect(element).toBeTruthy();
    const input1Div = element.querySelector(
      'app-wrapper3.input1',
    ) as HTMLElement;

    expect(input1Div).toBeTruthy();
  });
  it('events', async () => {
    let eventRun = false;
    const define = v.pipe(
      v.string(),
      setComponent('test1'),
      patchAsyncWrapper2('wrapper1', [
        patchAsyncEventsCommon({
          click: (field) => () => {
            eventRun = true;
          },
        }),
      ]),
    );
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal(''),
      Define,
    );
    await fixture.whenStable();
    fixture.detectChanges();
    expect(element).toBeTruthy();
    const input1Div = element.querySelector('app-wrapper3') as HTMLElement;
    input1Div.click();

    expect(eventRun).toBe(true);
  });
  it('class', async () => {
    const define = v.pipe(
      v.string(),
      setComponent('test1'),
      patchAsyncWrapper2('wrapper1', [patchAsyncClassCommon(() => 'input1')]),
    );
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal(''),
      Define,
    );
    await fixture.whenStable();
    fixture.detectChanges();
    expect(element).toBeTruthy();
    const input1Div = element.querySelector(
      'app-wrapper3.input1',
    ) as HTMLElement;

    expect(input1Div).toBeTruthy();
  });
  it('change', async () => {
    const define = v.pipe(
      v.string(),
      setComponent('test1'),
      patchAsyncWrapper2('wrapper1', [patchAsyncClassCommon(() => 'input1')]),
      changeAsyncWrapper2(
        (list) => {
          return list.find((item) => item().type === 'wrapper1');
        },
        [patchAsyncClassCommon(() => 'input2')],
      ),
    );
    const { fixture, instance, element, field$$ } = await createSchemaComponent(
      signal(define),
      signal(''),
      Define,
    );
    await fixture.whenStable();
    fixture.detectChanges();
    expect(element).toBeTruthy();
    expect(field$$()?.wrappers().length).toEqual(1);
    const input1Div = element.querySelector(
      'app-wrapper3.input2',
    ) as HTMLElement;

    expect(input1Div).toBeTruthy();
  });
});

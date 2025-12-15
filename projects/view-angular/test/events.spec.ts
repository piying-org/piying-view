import { signal } from '@angular/core';
import { Wrapper1Component } from './wrapper1/component';
import * as v from 'valibot';
import {
  componentClass,
  NFCSchema,
  patchAsyncEvents,
  topClass,
} from '@piying/view-angular-core';

import { createSchemaComponent } from './util/create-component';
import { setComponent, setWrappers } from '@piying/view-angular-core';
import { Test1Component } from './test1/test1.component';
import { Event1Component } from './event1/component';
import { Event2Component } from './event2/component';

describe('events', () => {
  it('click-selectorless', async () => {
    let checked = false;
    const define = v.pipe(
      NFCSchema,
      setComponent('test1'),
      patchAsyncEvents({
        click: (field) => {
          return (event: Event) => {
            expect(event).toBeTruthy();
            expect(field).toBeTruthy();
            expect(event instanceof Event).toBeTruthy();
            checked = true;
          };
        },
      }),
    );
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal(undefined),
      {
        types: {
          test1: {
            type: Event1Component,
          },
        },
      },
    );
    await fixture.whenStable();
    fixture.detectChanges();
    let btn = element.querySelector('.click-btn')! as HTMLButtonElement;
    btn.click();
    expect(checked).toBeTruthy();
  });
  it('click', async () => {
    let checked = false;
    const define = v.pipe(
      NFCSchema,
      setComponent('test1'),
      patchAsyncEvents({
        click: (field) => {
          return (event: Event) => {
            expect(event).toBeTruthy();
            expect(field).toBeTruthy();
            expect(event instanceof Event).toBeTruthy();
            checked = true;
          };
        },
      }),
    );
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal(undefined),
      {
        types: {
          test1: {
            type: Event2Component,
          },
        },
      },
    );
    await fixture.whenStable();
    fixture.detectChanges();
    let btn = element.querySelector('events2')! as HTMLButtonElement;
    btn.click();
    expect(checked).toBeTruthy();
  });
});

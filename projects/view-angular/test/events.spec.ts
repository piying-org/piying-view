import { signal } from '@angular/core';
import * as v from 'valibot';
import { NFCSchema, actions } from '@piying/view-angular-core';

import { createSchemaComponent } from './util/create-component';
import { setComponent } from '@piying/view-angular-core';
import { Event1Component } from './event1/component';
import { Event2Component } from './event2/component';

describe('events', () => {
  it('click-selectorless', async () => {
    let checked = false;
    const define = v.pipe(
      NFCSchema,
      setComponent('test1'),
      actions.events.patchAsync({
        click: (field) => (event: Event) => {
          expect(event).toBeTruthy();
          expect(field).toBeTruthy();
          expect(event instanceof Event).toBeTruthy();
          checked = true;
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
    const btn = element.querySelector('.click-btn')! as HTMLButtonElement;
    btn.click();
    expect(checked).toBeTruthy();
  });
  it('click', async () => {
    let checked = false;
    const define = v.pipe(
      NFCSchema,
      setComponent('test1'),
      actions.events.patchAsync({
        click: (field) => (event: Event) => {
          expect(event).toBeTruthy();
          expect(field).toBeTruthy();
          expect(event instanceof Event).toBeTruthy();
          checked = true;
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
    const btn = element.querySelector('events2')! as HTMLButtonElement;
    btn.click();
    expect(checked).toBeTruthy();
  });
});

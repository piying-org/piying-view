import { signal } from '@angular/core';
import * as v from 'valibot';

import { createSchemaComponent } from './util/create-component';
import { actions, setComponent, setWrappers } from '@piying/view-angular-core';
import { Test1Component } from './test1/test1.component';
import { SelectorLessW } from './wrapper-unless/component';
import { Test1SelectorlessComponent } from './test1-selectorless/component';
import { Group1SelectorlessComponent } from './group1-selectorless/component';

describe('selectorless', () => {
  it('selectorless group', async () => {
    const define = v.object({
      t1: v.string(),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal(undefined),

      {
        types: {
          object: {
            type: Group1SelectorlessComponent,
          },
          string: {
            type: Test1Component,
          },
        },
      },
    );
    await fixture.whenStable();
    fixture.detectChanges();
    expect(element.querySelector('app-group1-selectorless')).toBeFalsy();
    expect(element.querySelector('.selectorless-wrapper')).toBeTruthy();
  });
  it('selectorless wrapper', async () => {
    const define = v.pipe(
      v.string(),
      setComponent('test1'),
      setWrappers(['selectorless-wrapper']),
    );
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal(undefined),

      {
        types: {
          test1: {
            type: Test1SelectorlessComponent,
          },
        },
        wrappers: {
          'selectorless-wrapper': {
            type: SelectorLessW,
            actions: [
              actions.inputs.patchAsync({ wInput1: () => 'inputClass' }),
            ],
          },
        },
      },
    );
    await fixture.whenStable();
    fixture.detectChanges();
    expect(element).toBeTruthy();
    expect(element.querySelector('app-test1-selectorless')).toBeFalsy();
    expect(element.querySelector('selectorless-wrapper')).toBeFalsy();
    expect(element.querySelector('.wrapper1')).toBeTruthy();
    expect(element.querySelector('.inputClass')).toBeTruthy();
  });
});

import { signal } from '@angular/core';
import { createSchemaComponent } from './util/create-component';
import * as v from 'valibot';
import {
  patchAsyncInputsCommon,
  patchAsyncWrapper2,
  setComponent,
} from '@piying/view-angular-core';
import { Wrapper3Component } from './wrapper3/component';
import { Test1Component } from './test1/test1.component';

describe('wrappers-actions', () => {
  it('存在', async () => {
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

      {
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
      },
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
});

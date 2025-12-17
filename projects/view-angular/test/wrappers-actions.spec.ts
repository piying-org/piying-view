import { Signal, signal } from '@angular/core';
import { createSchemaComponent } from './util/create-component';
import { PiResolvedViewFieldConfig } from '../lib/type';
import * as v from 'valibot';
import { getField } from './util/action';
import {
  patchAsyncInputsCommon,
  patchAsyncWrapper2,
  setComponent,
  setWrappers,
  topClass,
} from '@piying/view-angular-core';
import { setOutputs } from '@piying/view-angular-core';
import { keyEqual } from '@piying/view-angular-core/test';
import { Wrapper3Component } from './wrapper3/component';
import { Wrapper4Component } from './wrapper4/component';
import { Test1Component } from './test1/test1.component';

fdescribe('wrappers-actions', () => {
  it('存在', async () => {
    const define = v.pipe(
      v.string(),
      setComponent('test1'),
      patchAsyncWrapper2('wrapper1', [
        patchAsyncInputsCommon({
          wInput1: (field) => {
            return signal('input1');
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

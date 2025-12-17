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
    const define = v.object({
      key1: v.pipe(
        v.string(),
        setComponent('test1'),
        patchAsyncWrapper2('test1', [
          patchAsyncInputsCommon({
            wInput1: (field) => {
              return signal('input1');
            },
          }),
        ]),
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
            type: Wrapper3Component,
          },
        },
      },
    );
    await fixture.whenStable();
    fixture.detectChanges();
    expect(element).toBeTruthy();
    const input1Div = element.querySelector('.test1-div-input1') as HTMLElement;
    expect(input1Div).toBeTruthy();
    // todo
    expect(input1Div.innerHTML).toEqual('div-display');
  });
});

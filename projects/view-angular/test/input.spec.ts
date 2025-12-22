import { signal } from '@angular/core';
import * as v from 'valibot';
import { actions } from '@piying/view-angular-core';

import { createSchemaComponent } from './util/create-component';
import { setComponent } from '@piying/view-angular-core';
import { Test1Component } from './test1/test1.component';

describe('input', () => {
  it('signal', async () => {
    const a = signal('signal-value');
    const define = v.object({
      key1: v.pipe(
        v.string(),
        setComponent('test1'),
        actions.inputs.patchAsync({
          input1: (field) => {
            expect(field.form).toBeTruthy();
            return a;
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
            type: Test1Component,
          },
        },
      },
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const el = element.querySelector('.test1-div-input1');
    expect(el).toBeTruthy();
    expect(el?.textContent).toEqual('signal-value');
    a.set('signal-value2');
    await fixture.whenStable();
    fixture.detectChanges();
    expect(el?.textContent).toEqual('signal-value2');
  });
  it('signal-merge', async () => {
    const a = signal('signal-value');
    const define = v.object({
      key1: v.pipe(
        v.string(),
        setComponent('test1'),
        actions.inputs.set({ input2: 'test2' }),
        actions.inputs.patchAsync({ input1: () => a }),
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
      },
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const el = element.querySelector('.test1-div-input1');
    expect(el).toBeTruthy();
    expect(el?.textContent).toEqual('signal-value');
    a.set('signal-value2');
    const el2 = element.querySelector('.test1-div-input2');
    expect(el2?.textContent).toEqual('test2');
  });
});

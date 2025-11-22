import { Signal, signal } from '@angular/core';
import { PiResolvedViewFieldConfig } from '../lib/type';
import { createSchemaComponent } from './util/create-component';
import * as v from 'valibot';
import { NFCSchema, patchOutputs, setOutputs } from '@piying/view-angular-core';
import { setComponent } from '@piying/view-angular-core';
import { keyEqual } from '@piying/view-angular-core/test';
import { InjectTokenComponent } from './input-options/component';

describe('inject', () => {
  it('field注入', async () => {
    const field$ = Promise.withResolvers<Signal<PiResolvedViewFieldConfig>>();
    const define = v.object({
      v1: v.pipe(
        v.string(),
        setComponent('test1'),
        setOutputs({
          output3: (value) => {
            field$.resolve(value);
          },
        }),
      ),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal({ v1: 'd1' }),
    );
    await fixture.whenStable();
    fixture.detectChanges();
    keyEqual((await field$.promise)().keyPath, 'v1');
    expect((await field$.promise)().form).toBeTruthy();
  });
  it('获得注入参数', async () => {
    const output1$ = Promise.withResolvers<any>();
    const define = v.pipe(
      NFCSchema,
      setComponent('inject-token'),
      patchOutputs({
        output1: (data) => {
          output1$.resolve(data);
        },
      }),
    );
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal(undefined),
      {
        types: {
          'inject-token': { type: InjectTokenComponent },
        },
      },
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const output1 = await output1$.promise;
    expect(output1.model).toEqual(undefined);
    expect(output1.schema).toBe(define);
    expect(output1.options).toBeTruthy();
  });
  it('获得注入参数-obj', async () => {
    const output1$ = Promise.withResolvers<any>();
    const define = v.object({
      a: v.pipe(
        NFCSchema,
        setComponent('inject-token'),
        patchOutputs({
          output1: (data) => {
            output1$.resolve(data);
          },
        }),
      ),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal(undefined),
      {
        types: {
          'inject-token': { type: InjectTokenComponent },
        },
      },
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const output1 = await output1$.promise;
    expect(output1.model).toEqual(undefined);
    expect(output1.schema).toBe(define);
    expect(output1.options).toBeTruthy();
  });
});

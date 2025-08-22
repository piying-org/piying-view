import { signal } from '@angular/core';
import { createSchemaComponent } from './util/create-component';
import { PiResolvedViewFieldConfig } from '../lib/type';
import * as v from 'valibot';
import { getField } from './util/action';
import { setComponent, formConfig } from '@piying/view-angular-core';
import { keyEqual } from '@piying/view-angular-core/test';

describe('hook', () => {
  it('fieldResolved', async () => {
    const fields$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const define = v.object({
      v1: v.pipe(
        v.string(),
        setComponent('test2'),
        formConfig({
          disabled: true,
        }),
        getField(fields$, 'fieldResolved'),
      ),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal({ v1: 'd1' }),

      {
        types: {
          test2: {
            type: () =>
              import('./test1/test1.component').then(
                (a) => a.Test1Component,
              ) as any,
          },
        },
      },
    );
    await fixture.whenStable();
    fixture.detectChanges();
    keyEqual((await fields$.promise).keyPath, 'v1');
    expect((await fields$.promise).form).toBeTruthy();
  });
  it('beforeCreateComponent', async () => {
    const fields$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const define = v.object({
      v1: v.pipe(
        v.string(),
        setComponent('test2'),
        formConfig({
          disabled: true,
        }),
        getField(fields$, 'beforeCreateComponent'),
      ),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal({ v1: 'd1' }),

      {
        types: {
          test2: {
            type: () =>
              import('./test1/test1.component').then(
                (a) => a.Test1Component,
              ) as any,
          },
        },
      },
    );
    await fixture.whenStable();
    fixture.detectChanges();
    keyEqual((await fields$.promise).keyPath, 'v1');
    expect((await fields$.promise).form).toBeTruthy();
  });
  it('afterCreateComponent', async () => {
    const fields$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const define = v.object({
      v1: v.pipe(
        v.string(),
        setComponent('test2'),
        formConfig({
          disabled: true,
        }),
        getField(fields$, 'afterCreateComponent'),
      ),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal({ v1: 'd1' }),

      {
        types: {
          test2: {
            type: () =>
              import('./test1/test1.component').then(
                (a) => a.Test1Component,
              ) as any,
          },
        },
      },
    );
    await fixture.whenStable();
    fixture.detectChanges();
    keyEqual((await fields$.promise).keyPath, 'v1');
    expect((await fields$.promise).form).toBeTruthy();
  });
  it('allFieldsResolved', async () => {
    const fields$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const define = v.object({
      v1: v.pipe(
        v.string(),
        formConfig({
          disabled: true,
        }),
        getField(fields$),
      ),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal({ v1: 'd1' }),

      {},
    );
    await fixture.whenStable();
    fixture.detectChanges();
    keyEqual((await fields$.promise).keyPath, 'v1');
    expect((await fields$.promise).form).toBeTruthy();
  });
});

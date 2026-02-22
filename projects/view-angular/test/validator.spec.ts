import { signal } from '@angular/core';
import { createSchemaComponent } from './util/create-component';
import { PiResolvedViewFieldConfig } from '../lib/type';
import * as v from 'valibot';
import { getField } from './util/action';
import {
  findError,
  formConfig,
  ValidationErrorsLegacy,
} from '@piying/view-angular-core';
import { of, Subject } from 'rxjs';

describe('验证', () => {
  it('异步验证', async () => {
    const field$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const define = v.object({
      v1: v.pipe(
        v.number(),
        formConfig({
          asyncValidators: [
            async (control) => {
              if (control.value === 1) {
                return {
                  value: '1',
                };
              }
              return undefined;
            },
          ],
        }),
        getField(field$),
      ),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal({ v1: 0 }),

      {
        types: {},
      },
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const field = await field$.promise;
    expect(field.form.control?.valid).toEqual(true);
    field.form.control?.updateValue(1);
    expect(field.form.control?.pending).toEqual(true);
    await fixture.whenStable();
    fixture.detectChanges();
    expect(instance.form$().value$$()).toEqual(undefined as any);
    expect(field.form.control?.valid).toEqual(false);
    expect(findError(field.form.control?.errors, 'value')?.metatdata).toEqual(
      '1',
    );
    field.form.control?.updateValue(2);
    // 因为惰性的原因
    field.form.control?.rawError$$();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(instance.model$()).toEqual({ v1: 2 });
    expect(field.form.control?.valid).toEqual(true);
  });
  it('异步验证-observable', async () => {
    const field$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const define = v.object({
      v1: v.pipe(
        v.number(),
        formConfig({
          asyncValidators: [
            (control) => {
              if (control.value === 1) {
                const subject = new Subject<ValidationErrorsLegacy>();
                Promise.resolve().then(() => {
                  subject.next({
                    value: '1',
                  });
                });
                return subject;
              }
              return of(undefined);
            },
          ],
        }),
        getField(field$),
      ),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal({ v1: 0 }),

      {
        types: {},
      },
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const field = await field$.promise;
    expect(field.form.control?.valid).toEqual(true);
    field.form.control?.updateValue(1);
    expect(field.form.control?.pending).toEqual(true);
    await fixture.whenStable();
    fixture.detectChanges();
    expect(instance.form$().value$$()).toEqual(undefined as any);
    expect(field.form.control?.valid).toEqual(false);
    expect(findError(field.form.control?.errors, 'value')?.metatdata).toEqual(
      '1',
    );
    field.form.control?.updateValue(2);
    // 因为惰性的原因
    field.form.control?.rawError$$();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(instance.model$()).toEqual({ v1: 2 });
    expect(field.form.control?.valid).toEqual(true);
  });
  it('异步验证-signal', async () => {
    const testSignal = signal({ value: '1' });
    const field$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const define = v.object({
      v1: v.pipe(
        v.number(),
        formConfig({
          asyncValidators: [(control) => testSignal],
        }),
        getField(field$),
      ),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal({ v1: 0 }),
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const field = await field$.promise;
    expect(field.form.control?.valid).toEqual(false);
    expect(findError(field.form.control?.errors, 'value')?.metatdata).toEqual(
      '1',
    );
  });
  it('同步验证', async () => {
    const field$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const define = v.object({
      v1: v.pipe(
        v.number(),
        formConfig({
          validators: [
            (control) => {
              if (control.value === 1) {
                return {
                  value: '1',
                };
              }
              return undefined;
            },
          ],
        }),
        getField(field$),
      ),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal({ v1: 0 }),

      {
        types: {},
      },
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const field = await field$.promise;
    expect(field.form.control?.valid).toEqual(true);
    expect(field.form.control?.invalid).toEqual(false);
    field.form.control?.updateValue(1);
    await fixture.whenStable();
    fixture.detectChanges();
    expect(instance.form$().value$$()).toEqual(undefined as any);
    expect(field.form.control?.valid).toEqual(false);
    expect(field.form.control?.invalid).toEqual(true);
    expect(findError(field.form.control?.errors, 'value')?.metatdata).toEqual(
      '1',
    );

    field.form.control?.updateValue(2);
    await fixture.whenStable();
    fixture.detectChanges();
    expect(instance.model$()).toEqual({ v1: 2 });
    expect(field.form.control?.valid).toEqual(true);
    field.form.control?.disable();
    expect(field.form.control?.disabled).toEqual(true);
  });
});

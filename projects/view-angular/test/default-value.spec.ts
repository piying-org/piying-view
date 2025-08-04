import { signal } from '@angular/core';
import { createSchemaComponent } from './util/create-component';
import { PiResolvedViewFieldConfig } from '../lib/type';
import * as v from 'valibot';
import { getField } from './util/action';
describe('默认值', () => {
  it('默认', async () => {
    const fields$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const define = v.object({
      v1: v.pipe(v.optional(v.number(), 9999)),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal<Record<string, any>>({}),
    );
    await fixture.whenStable();
    fixture.detectChanges();

    expect(instance.model$()).toEqual({ v1: 9999 });
  });
  it('undefined', async () => {
    const fields$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const define = v.object({
      v1: v.pipe(v.optional(v.number())),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal<Record<string, any>>({}),
    );
    await fixture.whenStable();
    fixture.detectChanges();

    expect(instance.model$()).toEqual({ v1: undefined });
  });
  it('有值,但是null', async () => {
    const fields$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const define = v.object({
      v1: v.pipe(v.nullable(v.number())),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal<Record<string, any>>({ v1: null }),
    );
    await fixture.whenStable();
    fixture.detectChanges();
    expect(instance.model$()).toEqual({ v1: null });
  });

  it('reset测试', async () => {
    // nonNullable为false时默认值失效,因为默认值始终为null不可修改
    const fields$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const define = v.object({
      v1: v.pipe(v.optional(v.number(), 9999), getField(fields$)),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal<Record<string, any>>({ v1: 1 }),
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const field = await fields$.promise;
    expect(instance.model$()).toEqual({ v1: 1 });
    field.form.control?.reset();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(instance.model$()).toEqual({ v1: 9999 });
  });
});

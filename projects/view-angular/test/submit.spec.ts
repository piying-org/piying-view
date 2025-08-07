import { signal } from '@angular/core';
import { PiResolvedViewFieldConfig } from '../index';
import * as v from 'valibot';
import { getField } from './util/action';
import { createSchemaComponent } from './util/create-component';
import { formConfig, setComponent } from '@piying/view-angular-core';
import {
  assertFieldArray,
  assertFieldControl,
  assertFieldGroup,
  assertFieldLogicGroup,
} from '@piying/view-angular-core/test';
import { htmlInput } from './util/input';
import { htmlBlur } from './util/touch';

describe('submit', () => {
  it('control', async () => {
    const field$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const define = v.pipe(
      v.string(),
      formConfig({ updateOn: 'submit' }),
      getField(field$),
      setComponent('test1'),
    );
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal(undefined),
    );

    await fixture.whenStable();
    fixture.detectChanges();
    const field = await field$.promise;
    assertFieldControl(field.form.control);
    const inputEl = element.querySelector('input')!;
    htmlInput(inputEl as any, '1234');
    htmlBlur(inputEl);
    await fixture.whenStable();
    fixture.detectChanges();
    expect(field.form.control.value).toEqual(undefined);
    expect(field.form.control.touched).toBeFalse()
    field.form.control.emitSubmit();
    expect(field.form.control.value).toEqual('1234');
    expect(field.form.control.touched).toBeTrue()
  });
  it('in group', async () => {
    const field$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const define = v.pipe(
      v.object({
        k1: v.pipe(
          v.string(),
          formConfig({ updateOn: 'submit' }),

          setComponent('test1'),
        ),
      }),
      getField(field$),
    );
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal(undefined),
    );

    await fixture.whenStable();
    fixture.detectChanges();
    const field = await field$.promise;
    assertFieldGroup(field.form.control);
    const inputEl = element.querySelector('input');
    htmlInput(inputEl as any, '1234');
    await fixture.whenStable();
    fixture.detectChanges();
    expect(field.form.control.value).toEqual(undefined);
    field.form.control.emitSubmit();
    expect(field.form.control.value).toEqual({ k1: '1234' });
    await fixture.whenStable();
    fixture.detectChanges();
    expect(instance.model$()).toEqual({ k1: '1234' });
  });
  it('in array', async () => {
    const field$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const define = v.pipe(
      v.array(
        v.pipe(
          v.string(),
          formConfig({ updateOn: 'submit' }),
          setComponent('test1'),
        ),
      ),
      getField(field$),
    );
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal(['1']),
    );

    await fixture.whenStable();
    fixture.detectChanges();
    const field = await field$.promise;
    assertFieldArray(field.form.control);
    const inputEl = element.querySelector('input');
    htmlInput(inputEl as any, '1234');
    await fixture.whenStable();
    fixture.detectChanges();
    expect(field.form.control.value).toEqual(['1']);
    expect(field.form.control.dirty).toEqual(false);
    field.form.control.emitSubmit();
    expect(field.form.control.value).toEqual(['1234']);
    expect(field.form.control.dirty).toEqual(true);
    await fixture.whenStable();
    fixture.detectChanges();
    expect(instance.model$()).toEqual(['1234']);
  });
  it('in logicgroup', async () => {
    const field$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const define = v.pipe(
      v.intersect([
        v.object({
          k1: v.pipe(
            v.string(),
            formConfig({ updateOn: 'submit' }),
            setComponent('test1'),
          ),
        }),
      ]),
      getField(field$),
    );
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal(undefined),
    );

    await fixture.whenStable();
    fixture.detectChanges();
    const field = await field$.promise;
    assertFieldLogicGroup(field.form.control);
    const inputEl = element.querySelector('input');
    htmlInput(inputEl as any, '1234');
    await fixture.whenStable();
    fixture.detectChanges();
    expect(field.form.control.value).toEqual(undefined);
    expect(field.form.control.dirty).toEqual(false);

    field.form.control.emitSubmit();
    expect(field.form.control.value).toEqual({ k1: '1234' });
    expect(field.form.control.dirty).toEqual(true);

    await fixture.whenStable();
    fixture.detectChanges();
    expect(instance.model$()).toEqual({ k1: '1234' });
  });
});

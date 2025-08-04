import { signal } from '@angular/core';
import { createSchemaComponent } from './util/create-component';
import { PiResolvedViewFieldConfig } from '../lib/type';
import { htmlInput } from './util/input';
import {
  isFieldArray,
  isFieldControl,
  NFCSchema,
} from '@piying/view-angular-core';
import * as v from 'valibot';
import { getField } from './util/action';
import { setComponent } from '@piying/view-angular-core';

describe('通用化表单类型', () => {
  it('array', async () => {
    const define = v.array(v.pipe(v.string(), setComponent('test1')));
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal<Record<string, any>>(['v1']),
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const form = instance.form$();
    expect(isFieldArray(form)).toBeTrue();
    const inputEl = element.querySelector('input')!;
    htmlInput(inputEl, 'd2');
    await fixture.whenStable();
    fixture.detectChanges();
    expect(instance.model$()).toEqual(['d2']);
  });
  it('control', async () => {
    const define = v.pipe(v.string(), setComponent('test1'));

    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal('v1'),
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const form = instance.form$();
    expect(isFieldControl(form)).toBeTrue();
    const inputEl = element.querySelector('input')!;
    htmlInput(inputEl, 'd2');
    await fixture.whenStable();
    fixture.detectChanges();
    expect(instance.model$()).toEqual('d2');
  });
  it('control外部变更监听', async () => {
    const define = v.pipe(v.string(), setComponent('test1'));

    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal('v1'),
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const form = instance.form$();
    const listen$ = Promise.withResolvers<boolean>();
    form.valueChanges.subscribe(() => {
      listen$.resolve(true);
    });
    instance.model$.set('v2');
    await fixture.whenStable();
    fixture.detectChanges();
    await listen$.promise;
    expect(form.value).toBe('v2');
  });
  it('fields二次设置销毁监听测试', async () => {
    const field$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const define = v.pipe(v.string(), getField(field$));
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal('v1'),
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const field = await field$.promise;
    const isComplete$ = Promise.withResolvers<true>();
    field.form.control!.valueChanges.subscribe({
      complete: () => {
        isComplete$.resolve(true);
      },
    });
    instance.fields$.set(v.pipe(v.string()));

    await fixture.whenStable();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(await isComplete$.promise).toBe(true);
  });

  it('no field control', async () => {
    const define = v.pipe(NFCSchema, setComponent('test1'));

    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal(undefined),
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const form = instance.form$();
    expect(isFieldControl(form)).toBeFalse();
  });
});

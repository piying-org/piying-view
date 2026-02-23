import { signal } from '@angular/core';
import { PiResolvedViewFieldConfig } from '../lib/type';
import { Test1Component } from './test1/test1.component';
import { getField } from './util/action';
import { createSchemaComponent } from './util/create-component';
import * as v from 'valibot';
import { setComponent } from '@piying/view-angular-core';
import { assertFieldControl } from '@piying/view-angular-core/test';

describe('error', () => {
  it('view输出异常拦截', async () => {
    const field$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const define = v.pipe(
      v.string(),
      setComponent(Test1Component),
      getField(field$),
    );
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal('1'),
    );
    await fixture.whenStable();
    fixture.detectChanges();
    expect(element).toBeTruthy();
    const field = await field$.promise;
    assertFieldControl(field.form.control);
    field.form.control.viewValueChange(2);
    await fixture.whenStable();
    fixture.detectChanges();
    expect(field.form.control?.value$$()).toBe('1');
    expect(instance.model$()).toBe('1');
  });
  it('model输入', async () => {
    const field$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const define = v.pipe(
      v.string(),
      v.check((value) => value !== '1'),
      setComponent(Test1Component),
      getField(field$),
    );
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal('2'),
    );
    await fixture.whenStable();
    fixture.detectChanges();
    expect(element).toBeTruthy();
    const field = await field$.promise;
    assertFieldControl(field.form.control);
    let lastValue: any;
    field.form.control.valueChanges.subscribe((value) => {
      lastValue = value;
    });

    instance.model$.set('1');
    await fixture.whenStable();
    fixture.detectChanges();
    expect(lastValue).toBe('2');
    expect(field.form.control.valueNoError$$()).toBeFalse();
  });
});

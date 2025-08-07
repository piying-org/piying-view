import { signal } from '@angular/core';
import { createSchemaComponent } from './util/create-component';
import { PiResolvedViewFieldConfig } from '../lib/type';
import { htmlInput } from './util/input';
import { FieldGroup } from '@piying/view-angular-core';
import * as v from 'valibot';
import { getField } from './util/action';
import { setComponent, formConfig } from '@piying/view-angular-core';

describe('禁用操作', () => {
  it('禁用维持', async () => {
    const define = v.object({
      v1: v.pipe(
        v.string(),
        setComponent('test1'),
        formConfig({
          disabled: true,
          disabledValue: 'reserve',
        }),
      ),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal<Record<string, any>>({ v1: 'd1' }),
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const inputEl = element.querySelector('input')!;
    expect(inputEl.disabled).toBeTrue();
    htmlInput(inputEl, 'd2');
    await fixture.whenStable();
    fixture.detectChanges();
    expect(instance.model$()).toEqual({ v1: 'd1' });
  });
  it('禁用删除', async () => {
    const define = v.object({
      v1: v.pipe(
        v.string(),
        setComponent('test1'),
        formConfig({
          disabled: true,
          disabledValue: 'delete',
        }),
      ),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal<Record<string, any>>({ v1: 'd1' }),
    );
    await fixture.whenStable();
    fixture.detectChanges();

    const inputEl = element.querySelector('input')!;
    expect(inputEl.disabled).toBeTrue();
    htmlInput(inputEl, 'd2');
    await fixture.whenStable();
    fixture.detectChanges();
    expect(instance.form$().value$$()).toEqual(undefined as any);
  });

  it('group正常子级禁用', async () => {
    const fields$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const define = v.object({
      k1: v.pipe(
        v.object({
          v1: v.pipe(
            v.string(),
            formConfig({
              disabled: true,
            }),
          ),
        }),
        getField(fields$),
      ),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal<Record<string, any>>({}),
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const field = await fields$.promise;
    expect(field.form.control?.disabled).toBeFalse();
    expect((field.form.control as FieldGroup).get('v1')?.disabled).toBeTrue();
  });
  it('数组禁用时删除值', async () => {
    // 禁用前数组内没有值,禁用后不需要移除
    const fields$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const define = v.object({
      k1: v.pipe(
        v.object({
          v1: v.pipe(v.tuple([v.pipe(v.string(), getField(fields$))])),
        }),
        getField(fields$),
      ),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal<Record<string, any>>({}),
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const field = await fields$.promise;
    expect(field.form.control!.enabled).toEqual(true);
    field.form.control!.disable();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(true).toEqual(true);
  });
});

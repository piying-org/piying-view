import { signal } from '@angular/core';
import { createSchemaComponent } from './util/create-component';
import { PiResolvedViewFieldConfig } from '../lib/type';
import {
  asVirtualGroup,
  componentClass,
  FieldGroup,
  isFieldGroup,
} from '@piying/view-angular-core';
import * as v from 'valibot';
import { getField, hooksConfig } from './util/action';
import { UFCC } from './util/schema';
import {
  setComponent,
  formConfig,
  renderConfig,
} from '@piying/view-angular-core';
import { assertFieldGroup } from '@piying/view-angular-core/test';

describe('group相关', () => {
  it('4级变化', async () => {
    const field$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const define = v.object({
      p1: v.object({
        p2: v.object({
          p3: v.object({ v1: v.pipe(v.string(), getField(field$)) }),
        }),
      }),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal<Record<string, any>>({ p1: { p2: { p3: { v1: '1' } } } }),
    );
    await fixture.whenStable();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const field = await field$.promise;
    expect(field.form.control?.value).toBe('1');
    const field2$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const define2 = v.object({
      p1: v.object({
        p2: v.object({ v1: v.pipe(v.string(), getField(field2$)) }),
      }),
    });
    instance.fields$.set(define2);
    instance.model$.set({ p1: { p2: { v1: '2' } } });

    await fixture.whenStable();
    fixture.detectChanges();
    const field2 = await field2$.promise;
    expect(field2.form.control?.value).toBe('2');

    expect(field2.form.control!.parent).toBeTruthy();
  });

  it('fieldGroup空移除', async () => {
    const define = v.object({
      '1': v.pipe(v.string(), setComponent('test1')),
      p1: v.pipe(v.object({}), componentClass('hello')),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal<Record<string, any>>({ p1: {} }),
    );
    await fixture.whenStable();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(element.querySelectorAll('piying-view-group').length).toBe(1);
  });
  it('空group继承父级control', async () => {
    const field$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const define = v.pipe(
      v.intersect([
        v.pipe(
          v.intersect([
            v.pipe(v.object({ '1': v.string() }), getField(field$)),
          ]),
          asVirtualGroup(),
        ),
      ]),
      asVirtualGroup(),
    );
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal<Record<string, any>>({ p1: {} }),
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const field = await field$.promise;
    expect(field.form.control).toBeTruthy();
    expect(isFieldGroup(field.form.control)).toBeTruthy();
    expect((field.form.control as FieldGroup).controls['1']).toBeTruthy();
  });
  it('空group继承父级control-普通空控件', async () => {
    const field$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const field2$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const define = v.pipe(
      v.intersect([
        v.pipe(
          v.intersect([
            v.pipe(
              v.object({
                '1': v.string(),
                __: v.pipe(UFCC, getField(field2$), setComponent('test1')),
              }),
              getField(field$),
            ),
          ]),
          asVirtualGroup(),
        ),
      ]),
      asVirtualGroup(),
    );
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal<Record<string, any>>({ p1: {} }),
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const field = await field$.promise;
    expect(field.form.control).toBeTruthy();
    assertFieldGroup(field.form.control);
    expect(field.form.control.controls['1']).toBeTruthy();
    const field2 = await field2$.promise;
    expect(field2.form.control).toBeFalsy();
  });
  it('group子级全隐藏时隐藏group', async () => {
    const field$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const define = v.object({
      l1: v.object({
        l21: v.pipe(
          v.string(),
          setComponent('test1'),
          renderConfig({ hidden: true }),
          getField(field$),
        ),
      }),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal<Record<string, any>>({ p1: {} }),
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const field = await field$.promise;
    expect(element.querySelector('piying-view-group')).toBeFalsy();
    field.renderConfig.update((value) => ({ ...value, hidden: false }));
    await fixture.whenStable();
    fixture.detectChanges();
    expect(element.querySelector('piying-view-group')).toBeTruthy();
  });
  it('group子级全隐藏时隐藏group-无define也算隐藏', async () => {
    const define = v.object({
      l1: v.object({
        l21: v.pipe(v.string()),
      }),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal<Record<string, any>>({ p1: {} }),
    );
    await fixture.whenStable();
    fixture.detectChanges();
    expect(element.querySelector('piying-view-group')).toBeFalsy();
  });
  // 仅用来测试索引问题,因为只报警告没异常所以没法缺点
  // 目前的

  it('部分禁用时同时更新值', async () => {
    const define = v.object({
      enable: v.boolean(),
      value: v.pipe(
        v.number(),
        formConfig({ disabled: true }),
        hooksConfig({
          allFieldsResolved(field) {
            field
              .get(['..', 'enable'])!
              .form.control?.valueChanges.subscribe((value: any) => {
                if (value) {
                  field.form.control?.enable();
                }
              });
          },
        }),
      ),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal<Record<string, any>>({}),
    );
    await fixture.whenStable();
    fixture.detectChanges();
    instance.model$.set({ enable: true, value: 1 });
    await fixture.whenStable();
    fixture.detectChanges();
    fixture.detectChanges();

    expect(instance.model$()).toEqual({ enable: true, value: 1 });
  });

  it('对象附加值', async () => {
    const field$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const define = v.pipe(
      v.looseObject({ k1: v.pipe(v.string(), getField(field$)) }),
      setComponent('object'),
    );
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal<Record<string, any>>({ k1: 'v1', k2: 'v2' }),
    );
    await fixture.whenStable();
    fixture.detectChanges();
    expect(instance.model$()).toEqual({ k1: 'v1', k2: 'v2' });
    const field = await field$.promise;
    field.form.control?.updateValue('v2');
    await fixture.whenStable();
    fixture.detectChanges();
    expect(instance.model$()).toEqual({ k1: 'v2', k2: 'v2' });
  });
});

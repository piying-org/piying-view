import { signal } from '@angular/core';
import { createSchemaComponent } from './util/create-component';
import { PiResolvedViewFieldConfig } from '../lib/type';
import { htmlInput } from './util/input';
import {
  FieldFormConfig$,
  FieldGroup,
  findError,
  isFieldControl,
  layout,
} from '@piying/view-angular-core';
import * as v from 'valibot';
import { getField, hooksConfig } from './util/action';
import { setComponent, formConfig } from '@piying/view-angular-core';

describe('表单控件配置', () => {
  it('singal', async () => {
    const define = v.object({
      v1: v.pipe(
        v.string(),
        setComponent('test1'),
        formConfig({
          disabled: true,
        }),
      ),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal({ v1: 'd1' }),
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
  it('信号变更', async () => {
    const field$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const define = v.object({
      v1: v.pipe(
        v.string(),
        setComponent('test1'),
        formConfig({
          disabled: true,
        }),
        getField(field$),
      ),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal({ v1: 'd1' }),
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const field = await field$.promise;
    const formConfig2 = field.formConfig! as FieldFormConfig$;

    formConfig2.update((config) => ({ ...config, disabled: false }));
    await fixture.whenStable();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const inputEl = element.querySelector('input')!;
    expect(inputEl.disabled).toBeFalse();
    // 输入影响ngOnChanges?
    htmlInput(inputEl, 'd2');
    await fixture.whenStable();
    fixture.detectChanges();
    expect(instance.model$()).toEqual({ v1: 'd2' });
  });
  it('配置更新泄露', async () => {
    const field$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const define = v.object({
      v1: v.pipe(
        v.string(),
        setComponent('test1'),
        formConfig({
          disabled: true,
        }),
        getField(field$),
      ),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal({ v1: 'd1' }),
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const define2 = v.object({
      v1: v.pipe(
        v.string(),
        setComponent('test1'),
        formConfig({
          disabled: false,
        }),
        getField(field$),
      ),
    });
    instance.fields$.set(define2);
    await fixture.whenStable();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const inputEl = element.querySelector('input')!;
    expect(inputEl.disabled).toBeFalse();
    // 输入影响ngOnChanges?
    htmlInput(inputEl, 'd2');
    await fixture.whenStable();
    fixture.detectChanges();
    expect(instance.model$()).toEqual({ v1: 'd2' });
  });
  it('a.b / a 销毁测试', async () => {
    const define = v.object({
      a: v.object({
        b: v.pipe(v.string(), setComponent('test1')),
      }),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal({ v1: 'd1' }),
    );
    await fixture.whenStable();
    fixture.detectChanges();
    let group = instance.form$();
    expect(group.get('a')).toBeTruthy();
    expect((group.get('a') as unknown as FieldGroup).find('b')).toBeTruthy();
    instance.fields$.set(
      v.object({
        a: v.object({}),
      }),
    );

    await fixture.whenStable();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    group = instance.form$();
    expect(instance.form$().get('a')).toBeTruthy();
    expect(instance.form$().get('a.b')).toBeFalsy();
  });
  it('a.b / a a不同', async () => {
    const field$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const define = v.object({
      a: v.object({
        b: v.pipe(v.string(), setComponent('test1')),
      }),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal({ v1: 'd1' }),
    );
    await fixture.whenStable();
    fixture.detectChanges();
    let group = instance.form$();
    expect(group.get('a')).toBeTruthy();
    expect((group.get('a') as unknown as FieldGroup).find('b')).toBeTruthy();
    instance.fields$.set(
      v.object({
        a: v.pipe(v.string(), setComponent('test1')),
      }),
    );

    await fixture.whenStable();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    group = instance.form$();
    expect(group.get('a')).toBeTruthy();
    expect(isFieldControl(group.get('a'))).toBeTruthy();
  });
  it('a.b / a.b.c 删除', async () => {
    const field$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const define = v.object({
      a: v.object({
        b: v.pipe(v.object({})),
      }),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal({ v1: 'd1' }),
    );
    await fixture.whenStable();
    fixture.detectChanges();
    let group = instance.form$();

    expect(group.get('a')).toBeTruthy();
    expect((group.get('a') as unknown as FieldGroup).find('b')).toBeTruthy();
    const define2 = v.object({
      a: v.object({
        b: v.pipe(v.object({ c: v.pipe(v.string(), setComponent('test1')) })),
      }),
    });
    instance.fields$.set(define2);

    await fixture.whenStable();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    group = instance.form$();
    expect(group.get('a')).toBeTruthy();
    expect(group.get('a.b.c')).toBeTruthy();
  });
  it('全局默认配置', async () => {
    const field$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const define = v.object({
      v1: v.pipe(
        v.string(),
        setComponent('test1'),
        getField(field$),
        formConfig({
          disabled: true,
          disabledValue: 'delete',
        }),
      ),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal({ v1: 'd1' }),

      {},
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const inputEl = element.querySelector('input')!;
    expect(inputEl.disabled).toBeTrue();
    const field = await field$.promise;
    field.form.control?.updateValue('xxx');
    await fixture.whenStable();
    fixture.detectChanges();

    expect(instance.form$().value$$()).toEqual(undefined as any);
  });
  // 防止 a的配置被重置
  it('a.b a 共存', async () => {
    const field$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const define = v.object({
      a: v.pipe(
        v.object({
          b: v.pipe(v.string(), layout({ keyPath: ['#'], priority: -1 })),
          c: v.pipe(v.string()),
        }),
        formConfig({
          disabled: true,
        }),
        getField(field$),
      ),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal({ a: { b: '1', c: '1' } }),
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const field = await field$.promise;
    expect(field.form.control!.disabled).toBeTrue();
    expect(field.form.control!.parent).toBeTruthy();
  });
  it('a.b a 共存顺序交换', async () => {
    const field$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const define = v.object({
      a: v.pipe(
        v.object({
          b: v.pipe(v.string(), layout({ keyPath: ['#'], priority: 1 })),
          c: v.pipe(v.string()),
        }),
        formConfig({
          disabled: true,
        }),
        getField(field$),
      ),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal({ a: { b: '1', c: '1' } }),
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const field = await field$.promise;
    expect(field.form.control!.disabled).toBeTrue();
    expect(field.form.control!.parent).toBeTruthy();
  });
  it('二次禁用', async () => {
    const field$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const define = v.object({
      a: v.pipe(
        v.string(),
        hooksConfig({
          allFieldsResolved(field) {
            field.formConfig.update((value: any) => ({
              ...value,
              disabled: true,
            }));
            field$.resolve(field);
          },
        }),
      ),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal({}),
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const field = await field$.promise;
    expect(field.form.control!.disabled).toBeTrue();
  });

  it('出现异常时禁止发射', async () => {
    const field$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const define = v.object({
      v1: v.pipe(
        v.string(),
        setComponent('test1'),
        formConfig({
          validators: [
            (control) => {
              if (control.value % 2 === 0) {
                return undefined;
              }
              return { error1: true };
            },
          ],
        }),
        getField(field$),
      ),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal({ v1: 2 }),
    );
    await fixture.whenStable();
    fixture.detectChanges();

    const field = await field$.promise;
    field.form.control?.updateValue(3);
    await fixture.whenStable();
    fixture.detectChanges();
    expect(field.form.control?.invalid).toBeTrue();
    expect(
      findError(field.form.control!.errors, 'error1')?.metadata,
    ).toBeTrue();
    expect(instance.form$().value$$()).toEqual(undefined as any);
  });
});

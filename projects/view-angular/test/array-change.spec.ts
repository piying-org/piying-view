import { signal } from '@angular/core';
import { createSchemaComponent } from './util/create-component';
import { PiResolvedViewFieldConfig } from '../lib/type';
import {
  componentClass,
  FieldArray,
  isFieldArray,
  isFieldGroup,
} from '@piying/view-angular-core';
import * as v from 'valibot';
import { getField, hooksConfig } from './util/action';
import { keyEqual } from '@piying/view-angular-core/test';
import { setComponent, formConfig } from '@piying/view-angular-core';
// 用于测试fields和model变动时,数值是否正确
describe('数组配置切换', () => {
  it('数量相等', async () => {
    const field$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const define = v.object({
      a1: v.pipe(
        v.array(v.pipe(v.string(), setComponent('test1'))),
        getField(field$),
      ),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal({ a1: ['v1'] }),
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const field = await field$.promise;
    expect(field.restChildren?.().length).toBe(1);
  });
  it('model添加后删除', async () => {
    const field$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const define = v.object({
      a1: v.pipe(
        v.array(v.pipe(v.string(), setComponent('test1'))),
        getField(field$),
      ),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal({ a1: ['v1'] }),
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const field = await field$.promise;
    expect(field.restChildren?.().length).toBe(1);
    instance.model$.set({ a1: ['v1', 'v2'] });
    await fixture.whenStable();
    fixture.detectChanges();
    expect(field.restChildren?.().length).toBe(2);
    expect(instance.model$()).toEqual({ a1: ['v1', 'v2'] });
    expect((field.form.control as FieldArray).controls.length).toBe(2);
    instance.model$.set({ a1: ['v1'] });
    await fixture.whenStable();
    fixture.detectChanges();
    expect(field.restChildren?.().length).toBe(1);
    expect(instance.model$()).toEqual({ a1: ['v1'] });
    expect((field.form.control as FieldArray).controls.length).toBe(1);
  });
  it('model删除后添加', async () => {
    const field$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const define = v.object({
      a1: v.pipe(
        v.array(v.pipe(v.string(), setComponent('test1'))),
        getField(field$),
      ),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal({ a1: ['v1', 'v2'] }),
    );
    await fixture.whenStable();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const field = await field$.promise;
    expect(field.restChildren?.().length).toBe(2);
    expect((field.form.control as FieldArray).controls.length).toBe(2);
    instance.model$.set({ a1: ['v1'] });
    await fixture.whenStable();
    fixture.detectChanges();
    expect(field.restChildren?.().length).toBe(1);
    expect(instance.model$()).toEqual({ a1: ['v1'] });
    expect((field.form.control as FieldArray).controls.length).toBe(1);
  });
  it('model删除多个', async () => {
    const field$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const define = v.object({
      a1: v.pipe(
        v.array(v.pipe(v.string(), setComponent('test1'))),
        getField(field$),
      ),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal({ a1: ['v1', 'v2', 'v3', 'v4'] }),
    );
    await fixture.whenStable();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const field = await field$.promise;
    expect(field.restChildren?.().length).toBe(4);
    expect((field.form.control as FieldArray).controls.length).toBe(4);
    instance.model$.set({ a1: ['v1'] });
    await fixture.whenStable();
    fixture.detectChanges();
    expect(field.restChildren?.().length).toBe(1);
    expect(instance.model$()).toEqual({ a1: ['v1'] });
    expect((field.form.control as FieldArray).controls.length).toBe(1);
  });
  it('api添加后删除', async () => {
    const field$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const define = v.object({
      a1: v.pipe(
        v.array(v.pipe(v.string(), setComponent('test1'))),
        getField(field$),
      ),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal({ a1: ['v1'] }),
    );
    await fixture.whenStable();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const field = await field$.promise;
    expect(field.restChildren?.().length).toBe(1);
    expect((field.form.control as FieldArray).controls.length).toBe(1);
    field.action.set('v2');
    await fixture.whenStable();
    fixture.detectChanges();
    expect(field.restChildren?.().length).toBe(2);
    expect(instance.model$()).toEqual({ a1: ['v1', 'v2'] });
    expect((field.form.control as FieldArray).controls.length).toBe(2);
    field.action.remove(1);
    await fixture.whenStable();
    fixture.detectChanges();
    expect(field.restChildren?.().length).toBe(1);
    expect(instance.model$()).toEqual({ a1: ['v1'] });
    expect((field.form.control as FieldArray).controls.length).toBe(1);
  });
  it('数组字段切换', async () => {
    const field$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const define = v.object({
      a1: v.pipe(
        v.array(v.pipe(v.string(), setComponent('test1'))),
        getField(field$),
      ),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal({ a1: ['v1'] }),
    );
    await fixture.whenStable();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const field = await field$.promise;
    expect(field.restChildren?.().length).toBe(1);
    expect((field.form.control as FieldArray).controls.length).toBe(1);
    field.action.set('v2');
    await fixture.whenStable();
    fixture.detectChanges();

    const field2$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    instance.fields$.set(
      v.object({
        a1: v.pipe(
          v.array(v.pipe(v.object({ v1: v.string(), v2: v.string() }))),
          getField(field2$),
        ),
      }),
    );
    instance.model$.set({ a1: [{ v1: '1', v2: '2' }] });
    await fixture.whenStable();
    fixture.detectChanges();

    const field2 = await field2$.promise;
    expect(field2.restChildren?.().length).toBe(1);
    expect((field2.form.control as FieldArray).controls.length).toBe(1);

    expect(isFieldGroup(field2.form.root)).toBeTrue();
    expect(isFieldArray(field2.form.root.get('a1'))).toBeTrue();
    expect(field.form.control!.parent).toBeTruthy();
    expect(field2.form.control!.parent).toBeTruthy();
  });
  it('array使用class', async () => {
    const define = v.object({
      a1: v.pipe(
        v.array(v.pipe(v.string(), setComponent('test1'))),
        componentClass('hello'),
      ),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal({ a1: ['v1'] }),
    );
    await fixture.whenStable();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(element.querySelector('piying-view-group.hello')).toBeTruthy();
  });
  it('array嵌套使用class', async () => {
    const define = v.object({
      a1: v.pipe(
        v.array(
          v.pipe(v.string(), setComponent('test1'), componentClass('hello')),
        ),
      ),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal({ a1: ['v1'] }),
    );
    await fixture.whenStable();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(element.querySelector('piying-view-group.hello')).toBeFalsy();
    expect(element.querySelector('app-test1.hello')).toBeTruthy();
  });
  it('添加后allFieldsResolved钩子', async () => {
    const field$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const list$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const define = v.object({
      a1: v.pipe(
        v.array(v.pipe(v.string(), setComponent('test1'), getField(field$))),
        getField(list$),
      ),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal({ a1: [] }),
    );
    await fixture.whenStable();
    fixture.detectChanges();
    instance.model$.set({ a1: ['v1'] });
    await fixture.whenStable();
    fixture.detectChanges();
    const field = await field$.promise;
    expect(field.form.control).toBeTruthy();
    const list = await list$.promise;
    expect(list.form.control!.value).toEqual(['v1']);
    // 检查数组值变更,value会不会对应变更
    instance.model$.set({ a1: ['v1', 'v2'] });
    await fixture.whenStable();
    fixture.detectChanges();
    expect(list.form.control!.value).toEqual(['v1', 'v2']);
  });
  it('set后allFieldsResolved钩子', async () => {
    const arrayField$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const field$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const define = v.object({
      a1: v.pipe(
        v.array(v.pipe(v.string(), setComponent('test1'), getField(field$))),
        getField(arrayField$),
      ),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal({ a1: [] }),
    );
    await fixture.whenStable();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const arrayField = await arrayField$.promise;
    arrayField.action.set('v1');
    await fixture.whenStable();
    fixture.detectChanges();
    const field = await field$.promise;
    expect(field.form.control).toBeTruthy();
  });
  it('检查参数污染', async () => {
    const field$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const childList: PiResolvedViewFieldConfig[] = [];
    const define = v.object({
      a1: v.pipe(
        v.array(
          v.pipe(
            v.string(),
            setComponent('test1'),

            // getField(field$)
            hooksConfig({
              fieldResolved: (field) => {
                childList.push(field);
              },
            }),
            formConfig({ disabled: true }),
          ),
        ),
        getField(field$, 'chilrenInit'),
      ),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal({ a1: ['v1', 'v2'] }),
    );
    await fixture.whenStable();
    fixture.detectChanges();

    childList[0].formConfig.update((value) => ({ ...value, disabled: false }));
    childList[1].formConfig.update((value) => ({ ...value }));
    await fixture.whenStable();
    fixture.detectChanges();
    expect(childList[0].form.control?.disabled).toBeFalse();
    expect(childList[1].form.control?.disabled).toBeTrue();
    keyEqual(childList[0].keyPath, [0]);
    keyEqual(childList[1].keyPath, [1]);
  });
  it('检查参数污染-replace合并策略', async () => {
    const field$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const childList: PiResolvedViewFieldConfig[] = [];

    const define = v.object({
      a1: v.pipe(
        v.array(
          v.pipe(
            v.string(),
            setComponent('test1'),

            // getField(field$)
            hooksConfig({
              fieldResolved: (field) => {
                childList.push(field);
              },
            }),
            formConfig({ disabled: true }),
          ),
        ),
        getField(field$, 'chilrenInit'),
      ),
    });

    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal({ a1: ['v1', 'v2'] }),
      undefined,
      { configDefaultMergeStrategy: 'replace' },
    );
    await fixture.whenStable();
    fixture.detectChanges();
    expect(childList[0].form.control?.disabled).toBeTrue();
    expect(childList[1].form.control?.disabled).toBeTrue();
    childList[0].formConfig.update((value) => ({ ...value, disabled: false }));
    childList[1].formConfig.update((value) => ({ ...value }));
    await fixture.whenStable();
    fixture.detectChanges();
    keyEqual(childList[0].keyPath, [0]);
    keyEqual(childList[1].keyPath, [1]);

    expect(childList[0].form.control?.disabled).toBeFalse();
    expect(childList[1].form.control?.disabled).toBeTrue();
  });

  it('渲染初始化数量', async () => {
    const field$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const define = v.object({
      a1: v.pipe(
        v.array(v.pipe(v.string(), setComponent('test1'))),
        getField(field$),
      ),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal({ a1: ['v1'] }),
    );
    await fixture.whenStable();
    fixture.detectChanges();

    const field = await field$.promise;
    expect(field.restChildren?.().length).toBe(1);
    let list = element.querySelectorAll('app-test1');
    expect(list.length).toBe(1);
    instance.model$.set({ a1: ['v1', 'v2'] });
    await fixture.whenStable();
    fixture.detectChanges();
    expect(field.restChildren?.().length).toBe(2);
    list = element.querySelectorAll('app-test1');
    expect(list.length).toBe(2);
  });
  it('删除后渲染数量', async () => {
    const field$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const define = v.object({
      a1: v.pipe(
        v.array(v.pipe(v.string(), setComponent('test1'))),
        getField(field$),
      ),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal({ a1: ['v1'] }),
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const field = await field$.promise;
    expect(field.restChildren?.().length).toBe(1);
    let list = element.querySelectorAll('app-test1');
    expect(list.length).toBe(1);
    field.action.remove(0);
    await fixture.whenStable();
    fixture.detectChanges();
    list = element.querySelectorAll('app-test1');
    expect(list.length).toBe(0);
  });
  it('设置值变更后渲染数量', async () => {
    const field$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const define = v.object({
      a1: v.pipe(
        v.array(v.pipe(v.string(), setComponent('test1'))),
        getField(field$),
      ),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal({ a1: ['v1', 'v2'] }),
    );
    await fixture.whenStable();
    fixture.detectChanges();

    const field = await field$.promise;
    expect(field.restChildren?.().length).toBe(2);
    let list = element.querySelectorAll('app-test1');
    expect(list.length).toBe(2);
    instance.model$.set({ a1: ['v1'] });
    await fixture.whenStable();
    fixture.detectChanges();
    list = element.querySelectorAll('app-test1');
    expect(list.length).toBe(1);
  });
  it('重复设置一个位置不应该出现追加', async () => {
    const field$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const define = v.object({
      a1: v.pipe(
        v.array(v.pipe(v.string(), setComponent('test1'))),
        getField(field$),
      ),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal({ a1: ['v1'] }),
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const field = await field$.promise;
    field.action.set('v2', 1);
    field.action.set('v2', 1);
    await fixture.whenStable();
    fixture.detectChanges();
    expect(instance.model$()['a1'].length).toBe(2);
  });
  it('值变更', async () => {
    const value = { a1: ['v1'] };
    const field$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const define = v.object({
      a1: v.pipe(
        v.array(v.pipe(v.string(), setComponent('test1'))),
        getField(field$),
      ),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal(value),
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const field = await field$.promise;
    field.action.set('v2', 1);
    await fixture.whenStable();
    fixture.detectChanges();
    expect(instance.model$()).toEqual({ a1: ['v1', 'v2'] });
  });
  it('元组变更', async () => {
    const value = { a1: ['v1'] };
    const field$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const define = v.object({
      b1: v.string(),
      a1: v.pipe(
        v.tuple([v.number(), v.number()]),
        // v.array(v.pipe(v.string(), cmpType('test1'))),
        getField(field$),
      ),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal(value),
    );
    await fixture.whenStable();
    fixture.detectChanges();
    instance.model$.set({ b1: '1' });
    await fixture.whenStable();
    fixture.detectChanges();
    const field = await field$.promise;
    expect(field.form.control!.value).toEqual(undefined);
    expect(instance.model$()).toEqual({ b1: '1' });
  });
});

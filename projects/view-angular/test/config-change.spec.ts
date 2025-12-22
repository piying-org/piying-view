import { signal } from '@angular/core';
import { createSchemaComponent } from './util/create-component';
import { PiResolvedViewFieldConfig } from '../lib/type';
import { Test1CpComponent } from './test1-cp/component';
import { Wrapper1Component } from './wrapper1/component';
import * as v from 'valibot';
import { getField } from './util/action';
import { setInputs, actions } from '@piying/view-angular-core';

import {
  setComponent,
  formConfig,
  setWrappers,
} from '@piying/view-angular-core';

describe('配置切换时-angular', () => {
  it('field,model同时变更时的值', async () => {
    let field$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
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
    let field = await field$.promise;
    expect(field.form.control!.value).toBe('d1');
    field$ = Promise.withResolvers();
    instance.model$.set({ v1: 'd2' });
    const define2 = v.object({
      v1: v.pipe(
        v.string(),
        setComponent('test1'),
        formConfig({
          disabled: true,
        }),
        getField(field$),
      ),
    });
    instance.fields$.set(define2);
    await fixture.whenStable();
    fixture.detectChanges();
    field = await field$.promise;

    expect(field.form.control!.parent).toBeTruthy();
    expect(field.form.control!.value).toBe('d2');
  });
  it('配置变更effect会自动销毁', async () => {
    /** 之前的 */
    const field$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    /** 后面的 */
    const field2$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const define = v.object({
      v1: v.pipe(
        v.string(),

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
    const define2 = v.object({
      v2: v.pipe(
        v.string(),

        getField(field2$),
      ),
    });
    instance.fields$.set(define2);
    await fixture.whenStable();
    fixture.detectChanges();
    const field2 = await field2$.promise;
    field.formConfig.set({ disabled: true });
    field2.formConfig.set({ disabled: true });
    await fixture.whenStable();
    fixture.detectChanges();
    // 由于修改,所以说变更变得同步了,不会出现没变更的情况
    // 也就是说这个用例没有意义了,不能真实反应前一个被销毁
    expect(field.form.control!.disabled).toBeTrue();
    expect(field2.form.control!.disabled).toBeTrue();
  });
  it('component变化', async () => {
    let firstDestroy = false;
    const define = v.object({
      v1: v.pipe(
        v.string(),
        setComponent('test1'),
        actions.outputs.set({
          destroyedChange: () => {
            firstDestroy = true;
          },
        }),
      ),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal({ v1: 'd1' }),

      {
        types: {
          test1cp: { type: Test1CpComponent },
        },
      },
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const define2 = v.object({
      v1: v.pipe(v.string(), setComponent('test1cp')),
    });
    instance.fields$.set(define2);
    await fixture.whenStable();
    fixture.detectChanges();
    expect(firstDestroy).toBe(true);
  });
  it('component变化', async () => {
    let firstDestroy = false;
    const define = v.object({
      v1: v.pipe(
        v.string(),
        setComponent('test1'),
        actions.outputs.set({
          destroyedChange: () => {
            firstDestroy = true;
          },
        }),
      ),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal({ v1: 'd1' }),

      {
        types: {
          test1cp: { type: Test1CpComponent },
        },
      },
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const define2 = v.object({
      v1: v.pipe(v.string(), setComponent('test1cp')),
    });
    instance.fields$.set(define2);
    await fixture.whenStable();
    fixture.detectChanges();
    expect(firstDestroy).toBe(true);
  });
  it('配置变化,但是组件输入不变', async () => {
    let firstDestroy = false;
    const outputs = {
      destroyedChange: () => {
        firstDestroy = true;
      },
    };
    const define = v.object({
      v1: v.pipe(v.string(), setComponent('test1'), actions.outputs.set(outputs)),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal({ v1: 'd1' }),

      {
        types: {
          test1cp: { type: Test1CpComponent },
        },
      },
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const define2 = v.object({
      v1: v.pipe(v.string(), setComponent('test1'), actions.outputs.set(outputs)),
    });
    instance.fields$.set(define2);
    await fixture.whenStable();
    fixture.detectChanges();
    expect(firstDestroy).toBe(false);
  });
  it('配置变化,但是组件输入不变', async () => {
    const field$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    let firstDestroy = false;
    const outputs = {
      destroyedChange: () => {
        firstDestroy = true;
      },
    };
    const define = v.object({
      v1: v.pipe(
        v.string(),
        setComponent('test1'),
        setInputs({
          input1: 'value1',
        }),
        actions.outputs.set(outputs),
        getField(field$),
      ),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal({ v1: 'd1' }),

      {
        types: {
          test1cp: { type: Test1CpComponent },
        },
      },
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const field = await field$.promise;
    field.inputs.update((value) => ({ ...value, input1: 'value2' }));
    await fixture.whenStable();
    fixture.detectChanges();
    expect(firstDestroy).toBe(false);
    expect(element.querySelector('.test1-div-input1')?.innerHTML).toBe(
      'value2',
    );
  });
  it('wrapp配置变化,应该会触发输入检查', async () => {
    const field$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    let firstDestroy = false;
    const outputs = {
      destroyedChange: () => {
        firstDestroy = true;
      },
    };
    const define = v.pipe(
      v.string(),
      setComponent('test1'),
      actions.outputs.set(outputs),
      setWrappers([
        {
          type: 'wrapper1',
          inputs: {
            wInput1: 'wvalue1',
          },
        },
      ]),
      getField(field$),
    );
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal('d1'),

      {
        wrappers: {
          wrapper1: {
            type: Wrapper1Component,
          },
        },
      },
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const field = await field$.promise;

    field.wrappers
      .items()[0]()
      .inputs.update((inputs) => ({ ...inputs, wInput1: 'wvalue2' }));
    await fixture.whenStable();
    fixture.detectChanges();
    expect(firstDestroy).toBe(false);
    expect(element.querySelector('.wrapper1-div-label')?.innerHTML).toBe(
      'wvalue2',
    );
  });
});

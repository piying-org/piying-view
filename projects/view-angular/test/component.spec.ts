import { signal } from '@angular/core';
import { createSchemaComponent } from './util/create-component';
import { Test2Module } from './module1/module1.module';
import { Test2Component } from './module1/test2.component';
import { TestAttrComponent } from './test-attr/component';
import * as v from 'valibot';
import {
  findComponent,
  NFCSchema,
  patchAsyncClass,
  patchHooks,
  actions,
  setWrappers,
} from '@piying/view-angular-core';
import { Test1Component } from './test1/test1.component';
import { setComponent, formConfig } from '@piying/view-angular-core';
import { NgControl } from '@angular/forms';
import { TestAttrClassComponent } from './test-attr-class/component';
import { Subject } from 'rxjs';
import { Update1Component } from './update/comp1';
import { Update2Component } from './update/comp2';
import { UpdateW } from './update/wrapper';

describe('组件', () => {
  it('module', async () => {
    const fields$ = Promise.withResolvers();
    const define = v.object({
      v1: v.pipe(
        v.string(),
        setComponent('test2'),
        formConfig({
          disabled: true,
        }),
      ),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal({ v1: 'd1' }),

      {
        types: {
          test2: {
            type: { component: Test2Component, module: Test2Module },
            actions: [
              actions.inputs.set({
                input1: 'test1',
              }),
              actions.outputs.set({
                output3: () => {
                  fields$.resolve(true);
                },
              }),
            ],
          } as any,
        },
      },
    );
    await fixture.whenStable();
    fixture.detectChanges();
    await fields$.promise;
    expect(element.querySelector('.test1-div-input1')?.innerHTML).toBe('test1');
  });
  it('带属性的组件', async () => {
    const inited = Promise.withResolvers();
    const define = v.pipe(
      v.string(),
      setComponent('test2'),
      actions.outputs.set({
        output1: (value) => {
          inited.resolve(value);
        },
      }),
    );
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal('d1'),

      {
        types: {
          test2: {
            type: TestAttrComponent,
          },
        },
      },
    );
    await fixture.whenStable();
    fixture.detectChanges();
    await inited.promise;
    expect(element.querySelector('button[mat-button]')).toBeTruthy();
  });
  it('ngControl读取', async () => {
    const inited = Promise.withResolvers();
    const define = v.pipe(
      v.string(),
      setComponent('test1'),
      actions.outputs.set({
        ngControlChange: (value) => {
          inited.resolve(value);
        },
      }),
    );
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal({ v1: 'd1' }),

      {
        types: {
          test1: {
            type: Test1Component,
          },
        },
      },
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const ngControl = await inited.promise;
    expect(ngControl instanceof NgControl).toBeTrue();
  });
  it('class变更', async () => {
    const testClass$ = signal('test-class1');
    const define = v.pipe(
      v.string(),
      setComponent('test1'),
      patchAsyncClass((field) => testClass$),
    );
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal('d1'),
      {
        types: {
          test1: {
            type: Test1Component,
          },
        },
      },
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const el = element.querySelector('.test-class1');
    expect(el).toBeTruthy();
    expect(element.querySelector('app-test1')).toBeTruthy();
    testClass$.set('test-class2');
    await fixture.whenStable();
    fixture.detectChanges();
    element.querySelector('.test-class2');
    expect(el).toBeTruthy();
  });
  it('tag+class+attr', async () => {
    const define = v.pipe(NFCSchema, setComponent('test2'));
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal(undefined),
      {
        types: {
          test2: {
            type: TestAttrClassComponent,
          },
        },
      },
    );
    await fixture.whenStable();
    fixture.detectChanges();
    expect(element.querySelector('input.class1[type=number]')).toBeTruthy();
  });

  it('组件切换', async () => {
    const changed = new Subject();
    const define = v.pipe(
      v.string(),
      setComponent('test1'),
      patchHooks({
        allFieldsResolved(field) {
          changed.subscribe(() => {
            field.define!.update((data) => ({
              ...data,
              type: findComponent(field, 'test2'),
            }));
          });
        },
      }),
    );
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal('d1'),

      {
        types: {
          test1: {
            type: Test1Component,
          },
          test2: {
            type: Test2Component,
          },
        },
      },
    );
    await fixture.whenStable();
    fixture.detectChanges();
    expect(element.querySelector('app-test1')).toBeTruthy();
    changed.next(1);
    await fixture.whenStable();
    fixture.detectChanges();
    expect(element.querySelector('app-test2')).toBeTruthy();
  });
  it('组件切换2', async () => {
    const define = v.pipe(
      v.string(),
      setComponent('update1'),
      actions.inputs.patch({
        input1: 'a1',
      }),
      setWrappers(['wrapper1']),
    );
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal('d1'),

      {
        types: {
          update1: {
            type: Update1Component,
          },
          update2: {
            type: Update2Component,
          },
        },
        wrappers: {
          wrapper1: {
            type: UpdateW,
          },
        },
      },
    );
    await fixture.whenStable();
    fixture.detectChanges();
    expect(element.querySelector('app-update1.a1')).toBeTruthy();
    instance.fields$.set(
      v.pipe(
        v.string(),
        setComponent('update2'),
        actions.inputs.patch({
          input2: 'a2',
        }),
        setWrappers(['wrapper1']),
      ),
    );
    await fixture.whenStable();
    fixture.detectChanges();

    expect(element.querySelector('app-update2.a2')).toBeTruthy();
  });
});

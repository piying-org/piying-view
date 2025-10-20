import { signal } from '@angular/core';
import { createSchemaComponent } from './util/create-component';
import { Test2Module } from './module1/module1.module';
import { Test2Component } from './module1/test2.component';
import { TestAttrComponent } from './test-attr/component';
import * as v from 'valibot';
import {
  NFCSchema,
  patchAsyncClass,
  patchHooks,
  setOutputs,
} from '@piying/view-angular-core';
import { Test1Component } from './test1/test1.component';
import { setComponent, formConfig } from '@piying/view-angular-core';
import { NgControl } from '@angular/forms';
import { TestAttrClassComponent } from './test-attr-class/component';
import { Subject } from 'rxjs';

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

            inputs: signal({
              input1: 'test1',
            }),
            outputs: {
              output3: () => {
                fields$.resolve(true);
              },
            },
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
      setOutputs({
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
      setOutputs({
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
      setComponent('test2'),
      patchHooks({
        allFieldsResolved(field) {
          changed.subscribe(() => {
            field.define!.update((data) => {
              return {
                ...data,
                type: Test2Component,
              };
            });
          });
        },
      }),
    );
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal('d1'),

      {
        types: {
          test2: {
            type: Test1Component,
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
});

import { signal } from '@angular/core';
import { PiResolvedViewFieldConfig } from '../index';
import { Test1Component } from './test1/test1.component';
import { BehaviorSubject } from 'rxjs';
import { htmlInput } from './util/input';
import * as v from 'valibot';
import { getField } from './util/action';
import { createSchemaComponent } from './util/create-component';
import { setComponent, formConfig } from '@piying/view-angular-core';
import { setInputs, setOutputs } from '@piying/view-angular-core';
import { assertFieldArray } from '@piying/view-angular-core/test';

describe('默认数组', () => {
  it('存在', async () => {
    const subject1 = new BehaviorSubject<string>('');
    const subject2 = new BehaviorSubject<string>('');
    const define = v.object({
      v1: v.array(
        v.object({
          key1: v.pipe(
            v.string(),
            setComponent(Test1Component),
            setInputs({
              input1: 'div-display',
            }),
            setOutputs({
              output1: (value) => {
                subject1.next(value);
              },
              output2: (value) => {
                subject2.next(value);
              },
            }),
          ),
        }),
      ),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal({ v1: [{ key1: 'value1' }] }),
    );

    await fixture.whenStable();
    fixture.detectChanges();
    expect(element).toBeTruthy();
    const input1Div = element.querySelector('.test1-div-input1') as HTMLElement;
    expect(input1Div).toBeTruthy();
    expect(input1Div.innerHTML).toEqual('div-display');
  });
  it('输入', async () => {
    const subject1 = new BehaviorSubject<string>('');
    const subject2 = new BehaviorSubject<string>('');
    const define = v.object({
      v1: v.array(
        v.object({
          key1: v.pipe(
            v.string(),
            setComponent(Test1Component),
            setInputs({
              input1: 'div-display',
            }),
            setOutputs({
              output1: (value) => {
                subject1.next(value);
              },
              output2: (value) => {
                subject2.next(value);
              },
            }),
          ),
        }),
      ),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal({ v1: [{ key1: 'value1' }] }),
    );
    await fixture.whenStable();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const input1Div = element.querySelector('.test1-div-input1') as HTMLElement;
    expect(input1Div).toBeTruthy();
    expect(input1Div.innerHTML).toEqual('div-display');
  });
  it('输出', async () => {
    const subject1 = new BehaviorSubject<string>('');
    const subject2 = new BehaviorSubject<string>('');
    const define = v.object({
      v1: v.array(
        v.object({
          key1: v.pipe(
            v.string(),
            setComponent(Test1Component),
            setInputs({
              input1: 'div-display',
            }),
            setOutputs({
              output1: (value) => {
                subject1.next(value);
              },
              output2: (value) => {
                subject2.next(value);
              },
            }),
          ),
        }),
      ),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal({ v1: [{ key1: 'value1' }] }),
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const inputEl = element.querySelector('input')!;
    const displayValueEl = element.querySelector('.test1-div-modelValue')!;

    expect(displayValueEl.innerHTML).toBe('value1');
    expect(inputEl).toBeTruthy();
    htmlInput(inputEl, 'value2');
    await fixture.whenStable();
    fixture.detectChanges();
    expect(subject1.value).toBe('value2');
    expect(subject2.value).toBe('value2');
    expect(instance.model$()).toEqual({ v1: [{ key1: 'value2' }] });
  });
  it('初始化后model变更', async () => {
    const subject1 = new BehaviorSubject<string>('');
    const subject2 = new BehaviorSubject<string>('');
    const define = v.object({
      v1: v.array(
        v.object({
          key1: v.pipe(
            v.string(),
            setComponent(Test1Component),
            setInputs({
              input1: 'div-display',
            }),
            setOutputs({
              output1: (value) => {
                subject1.next(value);
              },
              output2: (value) => {
                subject2.next(value);
              },
            }),
          ),
        }),
      ),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal({ v1: [{ key1: 'value1' }] }),
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const displayValueEl = element.querySelector('.test1-div-modelValue')!;

    expect(displayValueEl.innerHTML).toBe('value1');
    instance.model$.update((value) => ({ v1: [{ key1: 'value2' }] }));
    await fixture.whenStable();
    fixture.detectChanges();
    expect(displayValueEl.innerHTML).toBe('value2');
  });
  it('数组添加/删除', async () => {
    const subject1 = new BehaviorSubject<string>('');
    const subject2 = new BehaviorSubject<string>('');
    const define = v.object({
      v1: v.array(
        v.object({
          key1: v.pipe(
            v.string(),
            setComponent(Test1Component),
            setInputs({
              input1: 'div-display',
            }),
            setOutputs({
              output1: (value) => {
                subject1.next(value);
              },
              output2: (value) => {
                subject2.next(value);
              },
            }),
          ),
        }),
      ),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal({ v1: [{ key1: 'value1' }] }),
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const resolved$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const define2 = v.object({
      v2: v.pipe(
        v.array(
          v.pipe(
            v.object({
              key1: v.pipe(v.string(), setComponent(Test1Component)),
            }),
          ),
        ),
        getField(resolved$),
        formConfig({ emptyValue: [] }),
      ),
    });
    instance.fields$.set(define2);
    await fixture.whenStable();
    fixture.detectChanges();

    const resolved = await resolved$.promise;
    resolved.action.set({ key1: '222' });
    resolved.action.set({ key1: '333' }, 1);
    await fixture.whenStable();
    fixture.detectChanges();
    expect(instance.model$()['v2']).toEqual([{ key1: '222' }, { key1: '333' }]);
    resolved.action.remove(1);
    await fixture.whenStable();
    fixture.detectChanges();
    expect(instance.model$()['v2']).toEqual([{ key1: '222' }]);
    resolved.action.remove(0);
    await fixture.whenStable();
    fixture.detectChanges();
    expect(instance.model$()).toEqual({ v2: [] });
  });
  it('数组项销毁时监听停止', async () => {
    const field$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const define = v.pipe(v.array(v.string()), getField(field$));
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal(['value1']),
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const field = await field$.promise;
    assertFieldArray(field.form.control);
    let isDelete = false;
    field.form.control.controls$()[0].valueChanges.subscribe({
      complete: () => {
        isDelete = true;
      },
    });
    expect(isDelete).toBe(false);
    field.action.remove(0);
    await fixture.whenStable();
    fixture.detectChanges();
    expect(isDelete).toBe(true);
  });
  it('数组项移除切换销毁', async () => {
    const field$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const define = v.pipe(v.array(v.string()), getField(field$));
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal(['value1']),
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const field = await field$.promise;
    assertFieldArray(field.form.control);
    let isDelete = false;
    field.form.control.controls$()[0].valueChanges.subscribe({
      complete: () => {
        isDelete = true;
      },
    });
    expect(isDelete).toBe(false);
    instance.model$.set([]);
    await fixture.whenStable();
    fixture.detectChanges();
    instance.fields$.set(v.pipe(v.array(v.string()), getField(field$)));
    instance.model$.set([]);
    await fixture.whenStable();
    fixture.detectChanges();
    expect(isDelete).toBe(true);
  });
});

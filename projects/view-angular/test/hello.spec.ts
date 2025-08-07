import { signal } from '@angular/core';
import { Test1Component } from './test1/test1.component';
import { BehaviorSubject } from 'rxjs';
import { htmlInput } from './util/input';
import * as v from 'valibot';
import {
  componentClass,
  NFCSchema,
  setInputs,
  setOutputs,
} from '@piying/view-angular-core';
import { createSchemaComponent } from './util/create-component';
import {
  setComponent,
  formConfig,
  renderConfig,
} from '@piying/view-angular-core';
import { PiResolvedViewFieldConfig } from '../lib/type';
import { getField } from './util/action';
import { htmlBlur } from './util/touch';

describe('初始化', () => {
  it('存在', async () => {
    const subject1 = new BehaviorSubject<string>('');
    const subject2 = new BehaviorSubject<string>('');
    const define = v.object({
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
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal<Record<string, any>>({ key1: 'value1' }),
    );
    expect(true).toBe(true);
    expect(element).toBeTruthy();
    fixture.detectChanges();
    const input1Div = element.querySelector('.test1-div-input1') as HTMLElement;
    expect(input1Div).toBeTruthy();
    expect(input1Div.innerHTML).toEqual('div-display');
  });
  it('输入', async () => {
    const subject1 = new BehaviorSubject<string>('');
    const subject2 = new BehaviorSubject<string>('');
    const define = v.object({
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
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal<Record<string, any>>({ key1: 'value1' }),
    );
    fixture.detectChanges();
    const input1Div = element.querySelector('.test1-div-input1') as HTMLElement;
    expect(input1Div).toBeTruthy();
    expect(input1Div.innerHTML).toEqual('div-display');
  });
  it('输出', async () => {
    const subject1 = new BehaviorSubject<string>('');
    const subject2 = new BehaviorSubject<string>('');
    const define = v.object({
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
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal<Record<string, any>>({ key1: 'value1' }),
    );
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
    expect(instance.model$()).toEqual({ key1: 'value2' });
  });
  it('初始化后model变更', async () => {
    const subject1 = new BehaviorSubject<string>('');
    const subject2 = new BehaviorSubject<string>('');
    const define = v.object({
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
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal<Record<string, any>>({ key1: 'value1' }),
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const displayValueEl = element.querySelector('.test1-div-modelValue')!;

    expect(displayValueEl.innerHTML).toBe('value1');
    instance.model$.update((value) => ({
      key1: 'value2',
    }));
    await fixture.whenStable();
    fixture.detectChanges();
    expect(displayValueEl.innerHTML).toBe('value2');
  });
  // 用例覆盖
  it('置空', async () => {
    const subject1 = new BehaviorSubject<string>('');
    const subject2 = new BehaviorSubject<string>('');
    const define = v.object({
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
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal<Record<string, any>>({ key1: 'value1' }),
    );
    await fixture.whenStable();
    fixture.detectChanges();
    instance.fields$.set(NFCSchema);
    fixture.detectChanges();
    expect(element.querySelector('input')).toBeFalsy();
  });
  it('数组key', async () => {
    const subject1 = new BehaviorSubject<string>('');
    const subject2 = new BehaviorSubject<string>('');
    const define = v.object({
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
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal<Record<string, any>>({ key1: 'value1' }),
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const define2 = v.object({
      key2: v.pipe(v.pipe(v.string(), setComponent(Test1Component))),
    });
    instance.fields$.set(define2);
    await fixture.whenStable();
    fixture.detectChanges();

    const inputEl = element.querySelector('input')!;

    expect(inputEl).toBeTruthy();
    htmlInput(inputEl, 'value2');
    await fixture.whenStable();
    fixture.detectChanges();
    expect((instance.model$() as any)['key2']).toBe('value2');
  });
  it('多级路径(字符串)', async () => {
    const subject1 = new BehaviorSubject<string>('');
    const subject2 = new BehaviorSubject<string>('');
    const define = v.object({
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
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal<Record<string, any>>({ key1: 'value1' }),
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const define2 = v.object({
      p1: v.object({ p2: v.pipe(v.string(), setComponent(Test1Component)) }),
    });
    instance.fields$.set(define2);
    await fixture.whenStable();
    fixture.detectChanges();

    const inputEl = element.querySelector('input')!;

    expect(inputEl).toBeTruthy();
    htmlInput(inputEl, 'value2');
    await fixture.whenStable();
    fixture.detectChanges();
    expect((instance.model$() as any)['p1']).toEqual({ p2: 'value2' });
  });
  it('多级路径(数字)', async () => {
    const subject1 = new BehaviorSubject<string>('');
    const subject2 = new BehaviorSubject<string>('');
    const define = v.object({
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
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal<Record<string, any>>({ key1: 'value1' }),
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const define2 = v.object({
      p1: v.tuple([v.pipe(v.string(), setComponent(Test1Component))]),
    });
    instance.fields$.set(define2);
    await fixture.whenStable();
    fixture.detectChanges();

    const inputEl = element.querySelector('input')!;

    expect(inputEl).toBeTruthy();
    htmlInput(inputEl, 'value2');
    await fixture.whenStable();
    fixture.detectChanges();
    expect((instance.model$() as any)['p1']).toEqual(['value2']);
  });

  it('禁用', async () => {
    const subject1 = new BehaviorSubject<string>('');
    const subject2 = new BehaviorSubject<string>('');
    const define = v.object({
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
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal<Record<string, any>>({ key1: 'value1' }),
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const define2 = v.object({
      key2: v.pipe(
        v.string(),
        setComponent(Test1Component),
        formConfig({
          disabled: true,
        }),
      ),
    });
    instance.fields$.set(define2);
    instance.model$.set({} as any);
    await fixture.whenStable();
    fixture.detectChanges();

    const inputEl = element.querySelector('input')!;

    expect(inputEl).toBeTruthy();
    htmlInput(inputEl, 'value2');
    await fixture.whenStable();
    fixture.detectChanges();
    expect(instance.form$().value$$()).toBe(undefined);
  });
  it('自定义类', async () => {
    const define = v.object({
      key1: v.pipe(
        v.string(),
        setComponent(Test1Component),
        setInputs({
          input1: 'div-display',
        }),
      ),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal<Record<string, any>>({ key1: 'value1' }),
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const define2 = v.object({
      key2: v.pipe(
        v.string(),
        componentClass('test1'),
        formConfig({
          disabled: true,
        }),
        setComponent(Test1Component),
      ),
    });
    instance.fields$.set(define2);
    await fixture.whenStable();
    fixture.detectChanges();
    expect(element.querySelector('.test1')).toBeTruthy();
    const define3 = v.object({
      key2: v.pipe(
        v.string(),
        componentClass('test2'),
        formConfig({
          disabled: true,
        }),
        setComponent(Test1Component),
      ),
    });
    instance.fields$.set(define3);
    await fixture.whenStable();
    fixture.detectChanges();
    expect(element.querySelector('.test1')).toBeFalsy();
    expect(element.querySelector('.test2')).toBeTruthy();
    const define4 = v.object({
      key2: v.pipe(
        v.string(),
        componentClass('test3'),
        formConfig({
          disabled: true,
        }),
        setComponent(Test1Component),
      ),
    });
    instance.fields$.set(define4);
    await fixture.whenStable();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(element.querySelector('.test1')).toBeFalsy();
    expect(element.querySelector('.test2')).toBeFalsy();
    expect(element.querySelector('.test3')).toBeTruthy();
  });
  it('hidden', async () => {
    const subject1 = new BehaviorSubject<string>('');
    const subject2 = new BehaviorSubject<string>('');
    const define = v.object({
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
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal<Record<string, any>>({ key1: 'value1' }),
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const define2 = v.object({
      v1: v.pipe(
        v.string(),
        setComponent(Test1Component),
        renderConfig({ hidden: true }),
        formConfig({
          disabled: true,
        }),
      ),
    });
    instance.fields$.set(define2);
    await fixture.whenStable();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(element.querySelector('input')).toBeFalsy();
  });
  it('输入输出转换', async () => {
    const define2 = v.object({
      key2: v.pipe(
        v.number(),
        setComponent(Test1Component),
        formConfig({
          transfomer: {
            toModel: (value) => +value + 1,
            toView: (value) => `${value}9`,
          },
        }),
      ),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define2),
      signal<Record<string, any>>({ key2: 1 }),
    );
    instance.fields$.set(define2);
    await fixture.whenStable();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const inputEl = element.querySelector('input')!;
    expect(inputEl.value).toBe('19');
    htmlInput(inputEl, '21');
    await fixture.whenStable();
    fixture.detectChanges();
    expect((instance.model$() as any)['key2']).toBe(22);
    instance.model$.set({ key2: 21 } as any);
    await fixture.whenStable();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(inputEl.value).toBe('219');
  });

  it('初始化默认值viewValue跳过', async () => {
    const define = v.pipe(
      v.optional(v.string(), 'value2'),
      setComponent(Test1Component),
    );
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal('value1'),
    );
    await fixture.whenStable();
    fixture.detectChanges();
    let value = instance.form$().value$$();
    expect(value).toBe('value1');
    const inputEl = element.querySelector('input')!;
    const displayValueEl = element.querySelector('.test1-div-modelValue')!;
    expect(displayValueEl.innerHTML).toBe('value1');
    expect(inputEl).toBeTruthy();
    htmlInput(inputEl, 'value2');
    await fixture.whenStable();
    fixture.detectChanges();
    value = instance.form$().value$$();
    expect(value).toBe('value2');
    expect(displayValueEl.innerHTML).toBe('value2');
    instance.model$.set('value1');

    await fixture.whenStable();
    fixture.detectChanges();
    value = instance.form$().value$$();
    expect(value).toBe('value1');
    expect(displayValueEl.innerHTML).toBe('value1');
  });
  it('二次view输入问题', async () => {
    const define = v.pipe(v.string(), setComponent(Test1Component));
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal(''),
    );
    await fixture.whenStable();
    fixture.detectChanges();
    let value = instance.form$().value$$();
    expect(value).toBe('');
    const inputEl = element.querySelector('input')!;
    const displayValueEl = element.querySelector('.test1-div-modelValue')!;
    expect(displayValueEl.innerHTML).toBe('');
    expect(inputEl).toBeTruthy();
    // view输入
    htmlInput(inputEl, 'value2');
    await fixture.whenStable();
    fixture.detectChanges();
    value = instance.form$().value$$();
    expect(value).toBe('value2');
    // model输入
    instance.model$.set('value1');
    await fixture.whenStable();
    fixture.detectChanges();
    expect(displayValueEl.innerHTML).toBe('value1');
    value = instance.form$().value$$();
    expect(value).toBe('value1');
    // view输入
    htmlInput(inputEl, 'value2');
    await fixture.whenStable();
    fixture.detectChanges();
    value = instance.form$().value$$();
    expect(value).toBe('value2');
  });
  it('touch item', async () => {
    const fields$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const define = v.pipe(
      v.string(),
      setComponent(Test1Component),
      getField(fields$),
    );
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal(''),
    );
    await fixture.whenStable();
    fixture.detectChanges();
    let field = await fields$.promise;

    expect(field.form.control?.untouched).toEqual(true);
    const inputEl = element.querySelector('input')!;
    htmlBlur(inputEl);
    await fixture.whenStable();
    fixture.detectChanges();
    expect(field.form.control?.touched).toEqual(true);
    field.form.control!.markAsUntouched();
    expect(field.form.control?.touched).toEqual(false);
    field.form.control!.markAsTouched();
    expect(field.form.control?.touched).toEqual(true);
  });
});

import { signal } from '@angular/core';
import { Test1Component } from './test1/test1.component';
import { BehaviorSubject } from 'rxjs';
import { htmlInput } from './util/input';
import { FieldGroup, NFCSchema } from '@piying/view-angular-core';
import * as v from 'valibot';
import { hooksConfig } from './util/action';
import { createSchemaComponent } from './util/create-component';
import { UFCC } from './util/schema';
import { setComponent } from '@piying/view-angular-core';
import { actions } from '@piying/view-angular-core';
import { RestGroupComponent } from './rest-group/component';
import { SwitchGroupComponent } from './switch-group/component';

describe('group初始化', () => {
  it('存在', async () => {
    const define = v.object({
      v1: v.object({
        key1: v.pipe(
          v.string(),
          setComponent(Test1Component),
          actions.inputs.set({
            input1: 'div-display',
          }),
        ),
      }),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal({ v1: { key1: 'value1' } }),
    );
    await fixture.whenStable();
    fixture.detectChanges();
    expect(element).toBeTruthy();
    const input1Div = element.querySelector('.test1-div-input1') as HTMLElement;
    expect(input1Div).toBeTruthy();
    expect(input1Div.innerHTML).toEqual('div-display');
  });
  it('输入', async () => {
    const define = v.object({
      v1: v.object({
        key1: v.pipe(
          v.string(),
          setComponent(Test1Component),
          actions.inputs.set({
            input1: 'div-display',
          }),
        ),
      }),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal({ v1: { key1: 'value1' } }),
    );
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
      v1: v.object({
        key1: v.pipe(
          v.string(),
          setComponent(Test1Component),

          actions.outputs.set({
            output1: (value) => {
              subject1.next(value);
            },
            output2: (value) => {
              subject2.next(value);
            },
          }),
        ),
      }),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal({ v1: { key1: 'value1' } }),
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
    expect(instance.model$()).toEqual({ v1: { key1: 'value2' } });
  });
  it('初始化后model变更', async () => {
    const define = v.object({
      v1: v.object({
        key1: v.pipe(v.string(), setComponent(Test1Component)),
      }),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal({ v1: { key1: 'value1' } }),
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const displayValueEl = element.querySelector('.test1-div-modelValue')!;

    expect(displayValueEl.innerHTML).toBe('value1');
    instance.model$.update((value) => ({ v1: { key1: 'value2' } }));
    await fixture.whenStable();
    fixture.detectChanges();
    expect(displayValueEl.innerHTML).toBe('value2');
  });
  it('多级路径删除', async () => {
    const define = v.object({
      v1: v.object({
        key1: v.pipe(v.string(), setComponent(Test1Component)),
      }),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal({ v1: { key1: 'value1' } }),
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const define2 = v.object({
      v1: v.object({
        v2: v.object({
          v3: v.pipe(v.string(), setComponent(Test1Component)),
        }),
        v3: v.tuple([UFCC, v.pipe(v.string(), setComponent(Test1Component))]),
      }),
    });
    instance.fields$.set(define2);
    instance.model$.set({} as any);
    await fixture.whenStable();
    fixture.detectChanges();
    expect(instance.form$().value$$()).toEqual(undefined);
  });
  it('formgroup使用setvalue重置子级', async () => {
    const define = v.object({
      v1: v.object({
        key1: v.pipe(v.string(), setComponent(Test1Component)),
      }),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal({ v1: { key1: 'value1' } }),
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const fn$ = Promise.withResolvers<() => void>();
    const define2 = v.object({
      v2: v.pipe(
        v.object({
          v3: v.pipe(v.string(), setComponent(Test1Component)),
        }),
        hooksConfig({
          fieldResolved(field) {
            fn$.resolve(() => {
              (field.form.control as FieldGroup).updateValue({ v3: '111' });
            });
          },
        }),
      ),
    });
    instance.fields$.set(define2);
    await fixture.whenStable();
    fixture.detectChanges();
    const fn = await fn$.promise;
    fn();
    await fixture.whenStable();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const inputEl = element.querySelector('input')!;
    expect(inputEl.value).toBe('111');
    expect(instance.model$()['v2']).toEqual({ v3: '111' });
  });

  it('rest', async () => {
    const define = v.pipe(
      v.objectWithRest(
        {
          k1: v.pipe(v.string(), setComponent('test1')),
        },
        v.pipe(v.string(), setComponent('test1')),
      ),
      setComponent(RestGroupComponent),
    );
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal({ k1: 'value1', k2: '22' }),
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const fieldsEl = element.querySelector('.fields') as HTMLElement;
    expect(fieldsEl).toBeTruthy();
    const restEl = element.querySelector('.rest-fields') as HTMLElement;
    expect(restEl).toBeTruthy();
    expect(fieldsEl.querySelector('input')).toBeTruthy();
    expect(restEl.querySelector('input')).toBeTruthy();
    instance.model$.set({ k1: 'value1' });
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fieldsEl.querySelector('input')).toBeTruthy();
    expect(element.querySelector('.rest-fields input')).toBeFalsy();
  });
  it('group-switch', async () => {
    const activate$ = signal(0);
    const define = v.pipe(
      v.object({
        o1: v.object({
          k1: v.pipe(v.optional(v.string()), setComponent('test1')),
        }),
        o2: v.object({
          k1: v.pipe(v.optional(v.string()), setComponent('test1')),
        }),
      }),
      setComponent('switch-group'),
      actions.inputs.patchAsync({
        activate: () => activate$,
      }),
    );
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal({ o1: { k1: '111' }, o2: { k1: '222' } }),
      {
        types: {
          'switch-group': { type: SwitchGroupComponent },
        },
      },
    );
    await fixture.whenStable();
    fixture.detectChanges();
    let inputEl = element.querySelector('input')!;
    expect(inputEl.value).toEqual('111');
    htmlInput(inputEl, 'xxx');
    activate$.set(1);
    await fixture.whenStable();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    inputEl = element.querySelector('input')!;
    expect(inputEl?.value).toEqual('222');
    activate$.set(0);
    await fixture.whenStable();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    inputEl = element.querySelector('input')!;
    expect(inputEl?.value).toEqual('xxx');
  });

  it('重复子级', async () => {
    const define = v.record(
      v.string(),
      v.pipe(
        NFCSchema,
        setComponent(Test1Component),
        actions.inputs.patchAsync({
          input1: (field) => {
            return field.key;
          },
        }),
      ),
    );

    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal({ v1: 'v1value', v2: 'v2value' }),
    );
    await fixture.whenStable();
    fixture.detectChanges();
    expect(element.querySelectorAll('app-test1').item(0).textContent).toContain(
      'v1',
    );
    expect(element.querySelectorAll('app-test1').item(1).textContent).toContain(
      'v2',
    );
  });
});

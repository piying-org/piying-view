import { signal } from '@angular/core';
import { Test1Component } from './test1/test1.component';
import { BehaviorSubject } from 'rxjs';
import { htmlInput } from './util/input';

import * as v from 'valibot';
import { createSchemaComponent } from './util/create-component';
import { setComponent, setInputs, setOutputs } from '@piying/view-angular-core';

describe('仅控件数组', () => {
  it('存在', async () => {
    const define = v.object({
      v1: v.array(
        v.pipe(
          v.string(),
          setComponent(Test1Component),
          setInputs({
            input1: 'div-display',
          }),
        ),
      ),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal({ v1: ['value1'] }),
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
      v1: v.array(
        v.pipe(
          v.string(),
          setComponent(Test1Component),
          setInputs({
            input1: 'div-display',
          }),
        ),
      ),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal({ v1: ['value1'] }),
    );

    const input1Div = element.querySelector('.test1-div-input1') as HTMLElement;
    expect(input1Div).toBeTruthy();
    expect(input1Div.innerHTML).toEqual('div-display');
  });
  it('输出', async () => {
    const subject1 = new BehaviorSubject<string>('');
    const subject2 = new BehaviorSubject<string>('');

    const define = v.object({
      v1: v.array(
        v.pipe(
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
      ),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal({ v1: ['value1'] }),
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
    expect(instance.model$()).toEqual({ v1: ['value2'] });
  });
  it('初始化后model变更', async () => {
    const define = v.object({
      v1: v.array(
        v.pipe(
          v.string(),
          setComponent(Test1Component),
          setInputs({
            input1: 'div-display',
          }),
        ),
      ),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal({ v1: ['value1'] }),
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const displayValueEl = element.querySelector('.test1-div-modelValue')!;
    expect(displayValueEl.innerHTML).toBe('value1');
    instance.model$.update(() => ({ v1: ['value2'] }));
    await fixture.whenStable();
    fixture.detectChanges();
    expect(displayValueEl.innerHTML).toBe('value2');
  });
});

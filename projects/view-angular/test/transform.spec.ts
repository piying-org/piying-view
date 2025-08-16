import { signal } from '@angular/core';
import { Test1Component } from './test1/test1.component';
import { htmlInput } from './util/input';
import * as v from 'valibot';
import { createSchemaComponent } from './util/create-component';
import { setComponent, formConfig } from '@piying/view-angular-core';

describe('转换', () => {
  it('toModel', async () => {
    const define2 = v.object({
      key2: v.pipe(
        v.number(),
        setComponent(Test1Component),
        formConfig({
          transfomer: {
            toModel: (value) => +value + 1,
          },
        }),
      ),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define2),
      signal({ key2: 1 }),
    );
    instance.fields$.set(define2);
    await fixture.whenStable();
    fixture.detectChanges();
    const inputEl = element.querySelector('input')!;
    expect(inputEl.value).toBe('1');
    htmlInput(inputEl, '10');
    await fixture.whenStable();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(instance.model$()['key2']).toBe(11);
    expect(inputEl.value).toBe('10');
  });
  it('transform', async () => {
    // 使用transform必须类型不变,否则会触发验证失败
    const define2 = v.object({
      key2: v.pipe(
        v.string(),
        setComponent(Test1Component),
        v.transform((input) => `${input}1`),
      ),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define2),
      signal({ key2: '1' }),
    );
    instance.fields$.set(define2);
    await fixture.whenStable();
    fixture.detectChanges();
    const inputEl = element.querySelector('input')!;
    expect(inputEl.value).toBe('1');
    htmlInput(inputEl, '10');
    await fixture.whenStable();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(instance.model$()['key2']).toBe('101');
    expect(inputEl.value).toBe('10');
  });
});

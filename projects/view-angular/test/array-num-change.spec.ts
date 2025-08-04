import { signal } from '@angular/core';
import { Test1Component } from './test1/test1.component';
import { BehaviorSubject } from 'rxjs';
import { htmlInput } from './util/input';
import * as v from 'valibot';
import { createSchemaComponent } from './util/create-component';
import { setComponent, setInputs, setOutputs } from '@piying/view-angular-core';

describe('默认数组-数量变更', () => {
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
      signal({ v1: [{ key1: 'value1' }, { key1: 'value1' }] }),
    );
    await fixture.whenStable();
    fixture.detectChanges();
    // todo 数组的变更目前不会自动处理,这里理论上应该删除并且销毁
    instance.model$.set({ v1: [{ key1: 'value1' }] });
    fixture.detectChanges();
    const inputEl = element.querySelector('input')!;
    htmlInput(inputEl, 'value2');
    await fixture.whenStable();
    fixture.detectChanges();
    expect(instance.model$()).toEqual({ v1: [{ key1: 'value2' }] });
  });
});

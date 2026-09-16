import * as v from 'valibot';

import { getField } from './util/action';
import { createSchemaComponent } from './util/create-component';
import { signal } from '@angular/core';
import { PiResolvedViewFieldConfig } from '../lib/type';
import {
  actions,
  disableWhen,
  hideWhen,
  mergeOutputs,
  NFCSchema,
  outputChange,
  setAlias,
  setComponent,
  valueChange,
} from '@piying/view-angular-core';
import { map, skip } from 'rxjs';
import { Emit1Component } from './emit-1/component';
import { Emit2Component } from './emit-2/component';
import { Emit3Component } from './emit-3/component';

// 用于测试fields和model变动时,数值是否正确
describe('change', () => {
  it('值变更', async () => {
    const fields$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const define = v.pipe(v.string(), getField(fields$));
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal('d1'),

      {
        types: {},
      },
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const resolved = await fields$.promise;
    let changed = '';
    resolved.form.control?.valueChanges.subscribe({
      next: (a) => {
        changed = a;
      },
      complete: () => {
        throw new Error('不应该销毁');
      },
    });
    expect(changed).toBe('d1');
    resolved.form.control?.updateValue('2');
    await fixture.whenStable();
    fixture.detectChanges();
    expect(changed).toBe('2');
    let changed2 = '';
    resolved.form.control?.valueChanges.subscribe({
      next: (a) => {
        changed2 = a;
      },
      complete: () => {},
    });
    await fixture.whenStable();
    fixture.detectChanges();
    expect(changed2).toBe('2');
  });
  it('hideWhen', async () => {
    const fields$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const define = v.object({
      enable: v.pipe(v.boolean()),
      value: v.pipe(
        v.string(),
        getField(fields$),
        hideWhen({
          listen: (fn, field) => {
            expect(field).toBeTruthy();
            return fn({
              list: [['..', 'enable']],
            }).pipe(map((item) => !item.list[0]));
          },
        }),
      ),
    });

    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal({ enable: true }),
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const resolved = await fields$.promise;
    expect(resolved.renderConfig().hidden).not.toBe(true);
    instance.model$.set({ enable: false });
    await fixture.whenStable();
    fixture.detectChanges();
    expect(resolved.renderConfig().hidden).toBe(true);
  });
  it('hideWhen-disabled', async () => {
    const fields$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const define = v.object({
      enable: v.pipe(v.boolean()),
      value: v.pipe(
        v.string(),
        getField(fields$),
        hideWhen({
          disabled: true,
          listen: (fn) =>
            fn({
              list: [['..', 'enable']],
            }).pipe(map((item) => !item.list[0])),
        }),
      ),
    });

    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal({ enable: true }),
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const resolved = await fields$.promise;
    expect(resolved.renderConfig().hidden).not.toBe(true);
    expect(resolved.formConfig().disabled).toBe(false);
    instance.model$.set({ enable: false });
    await fixture.whenStable();
    fixture.detectChanges();
    expect(resolved.renderConfig().hidden).toBe(true);
    expect(resolved.formConfig().disabled).toBe(true);
  });
  it('hideWhen-disabled-NFCS', async () => {
    const fields$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const define = v.object({
      enable: v.pipe(v.boolean()),
      __value: v.pipe(
        NFCSchema,
        getField(fields$),
        hideWhen({
          disabled: true,
          listen: (fn) =>
            fn({
              list: [['..', 'enable']],
            }).pipe(map((item) => !item.list[0])),
        }),
      ),
    });

    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal({ enable: true }),
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const resolved = await fields$.promise;
    expect(resolved.renderConfig().hidden).not.toBe(true);
    instance.model$.set({ enable: false });
    await fixture.whenStable();
    fixture.detectChanges();
    expect(resolved.renderConfig().hidden).toBe(true);
  });
  it('valueChange', async () => {
    const fields$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    let valueChangeIndex = 0;
    const define = v.object({
      enable: v.pipe(v.boolean()),
      value: v.pipe(
        v.string(),
        getField(fields$),
        valueChange((listen) => {
          listen({ list: [['..', 'enable']] }).subscribe((value) => {
            expect(Array.isArray(value.list)).toBeTruthy();
            expect(value.field).toBeTruthy();
            expect(value.listenFields).toBeTruthy();
            expect(value.listenFields[0].form).toBeTruthy();
            valueChangeIndex++;
          });
        }),
      ),
    });

    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal({ enable: true }),
    );
    await fixture.whenStable();
    fixture.detectChanges();
    expect(valueChangeIndex).toBe(2);
    const resolved = await fields$.promise;
    instance.model$.set({ enable: false });
    await fixture.whenStable();
    fixture.detectChanges();
    expect(valueChangeIndex).toBe(3);
  });
  it('valueChange(默认监听)', async () => {
    let valueChangeIndex = 0;
    const define = v.pipe(
      v.string(),
      valueChange((listen) => {
        listen()
          .pipe(skip(1))
          .subscribe((value) => {
            expect(value.list[0]).toEqual('1');
            valueChangeIndex++;
          });
      }),
    );
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal('1'),
    );
    await fixture.whenStable();
    fixture.detectChanges();
    expect(valueChangeIndex).toBeGreaterThan(0);
  });
  it('disableWhen', async () => {
    const fields$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const define = v.object({
      enable: v.pipe(v.boolean()),
      value: v.pipe(
        v.string(),
        getField(fields$),
        disableWhen({
          listen: (fn, field) => {
            expect(field).toBeTruthy();
            return fn({
              list: [['..', 'enable']],
            }).pipe(map((item) => !item.list[0]));
          },
        }),
      ),
    });

    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal({ enable: true }),
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const resolved = await fields$.promise;
    expect(resolved.formConfig().disabled).toBe(false);
    instance.model$.set({ enable: false });
    await fixture.whenStable();
    fixture.detectChanges();
    expect(resolved.formConfig().disabled).toBe(true);
  });

  it('output', async () => {
    const fields$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    let valueChangeIndex = 0;
    const define = v.object({
      k1: v.pipe(
        NFCSchema,
        setComponent('test-emit1'),
        getField(fields$),
        mergeOutputs({
          output1: (input) => {
            expect(input).toBe('emit1-output1-data');
            valueChangeIndex++;
          },
        }),
        mergeOutputs({
          output1: (input) => {
            valueChangeIndex++;
          },
        }),
      ),
    });

    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal({ enable: true }),
      {
        types: {
          'test-emit1': { type: Emit1Component },
          'test-emit2': { type: Emit2Component },
        },
      },
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const input1btn = element.querySelector('.emit1-output1') as HTMLElement;
    input1btn.click();
    expect(valueChangeIndex).toBe(2);
  });
  it('async-output', async () => {
    let valueChangeIndex = 0;
    const define = v.pipe(
      NFCSchema,
      setComponent('test-emit1'),
      actions.outputs.mergeAsync({
        output1: (field) => (input) => {
          expect(field).toBeTruthy();
          expect(input).toBe('emit1-output1-data');
          valueChangeIndex++;
        },
      }),
    );

    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal(undefined),
      {
        types: {
          'test-emit1': { type: Emit1Component },
        },
      },
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const input1btn = element.querySelector('.emit1-output1') as HTMLElement;
    input1btn.click();
    expect(valueChangeIndex).toBe(1);
  });
  it('多output', async () => {
    const fields$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    let valueChangeIndex = 0;
    const define = v.object({
      k1: v.pipe(NFCSchema, setComponent('test-emit2'), getField(fields$)),
      k2: v.pipe(
        NFCSchema,
        setComponent('test-emit1'),
        getField(fields$),
        outputChange((fn) => {
          fn([
            { list: undefined, output: 'output1' },
            { list: ['..', 'k1'], output: 'output2' },
          ]).subscribe((value) => {
            expect(Array.isArray(value.list)).toBeTrue();
            if (valueChangeIndex === 0) {
              expect(value.list[0]?.[0]).toBe('emit1-output1-data');
              expect(value.list[0]?.length).toBe(1);
              expect(value.list[1]).toBeFalsy();
            } else if (valueChangeIndex === 1) {
              expect(value.list[0]?.[0]).toBe('emit1-output1-data');
              expect(value.list[0]?.length).toBe(1);
              expect(value.list[1]).toBeTruthy();
              expect(value.list[1]?.[0]).toBe('emit2-output1-data');
            }
            valueChangeIndex++;
          });
        }),
      ),
    });

    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal({ enable: true }),
      {
        types: {
          'test-emit1': { type: Emit1Component },
          'test-emit2': { type: Emit2Component },
        },
      },
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const emit1Output1Btn = element.querySelector(
      '.emit1-output1',
    ) as HTMLElement;
    emit1Output1Btn.click();
    expect(valueChangeIndex).toBe(1);

    const emit2Output1Btn = element.querySelector(
      '.emit2-output1',
    ) as HTMLElement;
    emit2Output1Btn.click();
    // k1 上被点的是 output1, 而 entry 监听的是 output2: 不应再产生发射
    expect(valueChangeIndex).toBe(1);
  });
  it('跨字段 output 监听: 事件名在视图内唯一, 只能由目标字段触发', async () => {
    const emissions: any[] = [];
    const define = v.object({
      // k1 用 Emit3: onlyEmit3 / otherEmit3 这两个事件名整个视图里只它有
      k1: v.pipe(NFCSchema, setComponent('test-emit3')),
      // k2 用 Emit1: 它没有任何叫 onlyEmit3 的输出
      k2: v.pipe(
        NFCSchema,
        setComponent('test-emit1'),
        outputChange((fn) => {
          fn([{ list: ['..', 'k1'], output: 'onlyEmit3' }]).subscribe((value) =>
            emissions.push(value),
          );
        }),
      ),
    });

    const { fixture, element } = await createSchemaComponent(
      signal(define),
      signal({ enable: true }),
      {
        types: {
          'test-emit1': { type: Emit1Component },
          'test-emit3': { type: Emit3Component },
        },
      },
    );
    await fixture.whenStable();
    fixture.detectChanges();

    expect(emissions.length).toBe(0);

    // 监听方自身 emit: 视图里不存在同名事件, 不可能误中
    (element.querySelector('.emit1-output1') as HTMLElement).click();
    (element.querySelector('.emit1-output2') as HTMLElement).click();
    await fixture.whenStable();
    expect(emissions.length).toBe(0);

    // 目标字段上「没被监听」的事件: 同样不应触发
    (element.querySelector('.emit3-other') as HTMLElement).click();
    await fixture.whenStable();
    expect(emissions.length).toBe(0);

    // 只有目标字段上被监听的那个事件会触发
    (element.querySelector('.emit3-only') as HTMLElement).click();
    await fixture.whenStable();

    expect(emissions.length).toBe(1);
    const s = emissions[0];
    expect(s.field.fullPath).toEqual(['k2']);
    expect(s.listenFields.map((f: any) => f.fullPath)).toEqual([['k1']]);
    expect(s.list[0][0]).toBe('emit3-only-data');
  });
  it('跨字段监听了目标组件上不存在的事件名: 渲染期抛 NG0316(不做静默兜底)', async () => {
    const emissions: any[] = [];
    const define = v.object({
      k1: v.pipe(NFCSchema, setComponent('test-emit3')),
      k2: v.pipe(
        NFCSchema,
        setComponent('test-emit1'),
        outputChange((fn) => {
          fn([{ list: ['..', 'k1'], output: 'ghostEvent' }]).subscribe(
            (value) => emissions.push(value),
          );
        }),
      ),
    });

    let err: any = null;
    try {
      const { fixture } = await createSchemaComponent(
        signal(define),
        signal({ enable: true }),
        {
          types: {
            'test-emit1': { type: Emit1Component },
            'test-emit3': { type: Emit3Component },
          },
        },
      );
      await fixture.whenStable();
      fixture.detectChanges();
    } catch (e) {
      err = e;
    }
    // mergeOutputFn 会往目标字段的 outputs 上加 key, 组件没声明这个 output 就会炸
    expect(String(err?.message ?? err)).toContain('NG0316');
    expect(emissions.length).toBe(0);
  });
  it('array变化产生了hook循环', async () => {
    let index = 0;
    const define = v.pipe(
      v.object({
        array1: v.pipe(v.array(v.string()), setAlias('array1')),
        str1: v.pipe(
          v.string(),
          valueChange((fn) => {
            fn({ list: [undefined] }).subscribe(({ field }) => {
              index++;
              field.get(['@array1'])!.action.set('1', 0);
            });
          }),
        ),
      }),
    );
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal({}),
      {
        types: {},
      },
    );
    await fixture.whenStable();
    fixture.detectChanges();
    expect(index).toBeLessThanOrEqual(2);
  });
  it('valueChange-初始', async () => {
    const fields$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    let valueChangeIndex = 0;
    const define = v.pipe(
      v.optional(v.string(), '123'),
      getField(fields$),
      valueChange((listen) => {
        listen({ list: [undefined] }).subscribe((value) => {
          valueChangeIndex++;
        });
      }),
    );

    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal('123'),
    );
    await fixture.whenStable();
    fixture.detectChanges();
    expect(valueChangeIndex).toBe(1);
  });
  it('valueChange-跳过初始', async () => {
    const fields$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    let valueChangeIndex = 0;
    const define = v.pipe(
      v.optional(v.string(), '123'),
      getField(fields$),
      valueChange((listen) => {
        listen({ list: [undefined], skipInitValue: true }).subscribe(
          (value) => {
            valueChangeIndex++;
          },
        );
      }),
    );

    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal('123'),
    );
    await fixture.whenStable();
    fixture.detectChanges();
    expect(valueChangeIndex).toBe(0);
  });
  it('valueChange-nochange', async () => {
    const define = v.optional(v.string());
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal(undefined),
    );
    await fixture.whenStable();
    fixture.detectChanges();
    expect(instance.changeIndex$()).toEqual(0);
    instance.model$.set('1');
    await fixture.whenStable();
    fixture.detectChanges();
    expect(instance.changeIndex$()).toEqual(0);
  });
  it('valueChange-defaultChange', async () => {
    const define = v.object({
      k1: v.optional(v.string()),
      k2: v.optional(v.string('1')),
    });
    const { fixture, instance, element, field$$ } = await createSchemaComponent(
      signal(define),
      signal({ k2: '1' }),
    );
    await fixture.whenStable();
    fixture.detectChanges();
    expect(instance.changeIndex$()).toEqual(0);
    field$$()?.form.root.updateValue({ k1: '1' });
    await fixture.whenStable();
    fixture.detectChanges();
    expect(instance.changeIndex$()).toEqual(1);
  });
});

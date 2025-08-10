import { signal } from '@angular/core';
import { createSchemaComponent } from './util/create-component';
import { PiResolvedViewFieldConfig } from '../lib/type';
import { Test4Component } from './test4/component';
import { FieldLogicGroup, layout } from '@piying/view-angular-core';
import * as v from 'valibot';
import { getField } from './util/action';

import { setComponent, formConfig } from '@piying/view-angular-core';

describe('子级解析', () => {
  it('intersect', async () => {
    const fields$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const fields1$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const fields2$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const define = v.object({
      v1: v.pipe(
        v.intersect([
          v.object({
            k1: v.pipe(
              v.optional(v.string()),
              setComponent('test4'),
              getField(fields1$),
            ),
            k2: v.optional(v.string()),
          }),
          v.object({
            k3: v.pipe(v.optional(v.string()), getField(fields2$)),
            k4: v.optional(v.string()),
          }),
        ]),
        getField(fields$),
      ),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal<Record<string, any>>({
        v1: {
          k1: '1',
        },
      }),

      {
        types: {
          test4: { type: Test4Component },
        },
      },
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const field1 = await fields1$.promise;
    expect(field1.form.control!.value).toEqual('1');
    field1.form.control?.updateValue('v1');
    await fixture.whenStable();
    fixture.detectChanges();
    expect(element.querySelector('.test4-model-value')?.innerHTML).toBe('v1');

    expect(instance.model$()['v1'].k1).toEqual('v1');
    expect(instance.model$()['v1'].k2).toEqual(undefined);
    expect(instance.model$()['v1'].k3).toEqual(undefined);
    expect(instance.model$()['v1'].k4).toEqual(undefined);
    const field2 = await fields2$.promise;
    field2.form.control?.updateValue('v2');
    await fixture.whenStable();
    fixture.detectChanges();

    expect(instance.model$()['v1'].k1).toEqual('v1');
    expect(instance.model$()['v1'].k2).toEqual(undefined);
    expect(instance.model$()['v1'].k3).toEqual('v2');
    expect(instance.model$()['v1'].k4).toEqual(undefined);
    instance.model$.set({
      v1: {
        k1: 'v12',
      },
    });
    await fixture.whenStable();
    fixture.detectChanges();
    expect(element.querySelector('.test4-model-value')?.innerHTML).toBe('v12');
    expect(field1.form.control?.value).toBe('v12');
    expect(field2.form.control?.value).toBe(undefined);
    const field = await fields$.promise;
    const control = field.form.control as FieldLogicGroup;
    control.activateControl$.set([field.fixedChildren!()[0].form.control!]);
    await fixture.whenStable();
    fixture.detectChanges();
    expect(instance.model$()['v1']['k1']).toEqual('v12');
    // todo get也应该改
    // const queryResult1 = field.get([0, 'k1']);
    // expect(queryResult1).toBeTruthy();
    control.activateControl$.set([field.fixedChildren!()[1].form.control!]);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(instance.model$()['v1']['k3']).toEqual(undefined);
    expect(instance.model$()['v1']['k4']).toEqual(undefined);
    // const queryResult2 = field.get(['k1']);
    // expect(queryResult2).toBe(undefined);
  });

  it('intersect-外部', async () => {
    const fields$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const fields1$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const outFields$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const fields2$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const define = v.object({
      v1: v.pipe(
        v.intersect([
          v.pipe(
            v.object({
              k1: v.pipe(
                v.optional(v.string()),
                setComponent('test4'),
                getField(fields1$),
              ),
              k2: v.optional(v.string()),
            }),
            layout({ keyPath: ['#'], priority: -2 }),
          ),
          v.pipe(
            v.object({
              k3: v.pipe(v.optional(v.string()), getField(fields2$)),
              k4: v.optional(v.string()),
            }),
            layout({ keyPath: ['#'], priority: -1 }),
            getField(outFields$),
          ),
        ]),
        getField(fields$),
      ),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal<Record<string, any>>({
        v1: {
          k1: '1',
        },
      }),

      {
        types: {
          test4: { type: Test4Component },
        },
      },
    );

    await fixture.whenStable();
    fixture.detectChanges();
    const field1 = await fields1$.promise;
    field1.form.control?.updateValue('v1');
    await fixture.whenStable();
    fixture.detectChanges();
    expect(element.querySelector('.test4-model-value')?.innerHTML).toBe('v1');

    expect(instance.model$()['v1'].k1).toEqual('v1');
    expect(instance.model$()['v1'].k2).toEqual(undefined);
    expect(instance.model$()['v1'].k3).toEqual(undefined);
    expect(instance.model$()['v1'].k4).toEqual(undefined);

    const field2 = await fields2$.promise;

    field2.form.control?.updateValue('v2');
    await fixture.whenStable();
    fixture.detectChanges();
    expect(instance.model$()['v1'].k1).toEqual('v1');
    expect(instance.model$()['v1'].k2).toEqual(undefined);
    expect(instance.model$()['v1'].k3).toEqual('v2');
    expect(instance.model$()['v1'].k4).toEqual(undefined);
    // expect(instance.model$()).toEqual({ v1: { k1: 'v1', k3: 'v2' } });
    instance.model$.set({
      v1: {
        k1: 'v12',
      },
    });
    await fixture.whenStable();
    fixture.detectChanges();
    expect(element.querySelector('.test4-model-value')?.innerHTML).toBe('v12');
    expect(field1.form.control?.value).toBe('v12');
    expect(field2.form.control?.value).toBe(undefined);
    const field = await fields$.promise;
    const control = field.form.control as FieldLogicGroup;

    control.activateControl$.set([field.form.control!.get([0])!]);

    await fixture.whenStable();
    fixture.detectChanges();
    expect(instance.model$()['v1']['k1']).toEqual('v12');

    // 使用第二个引用
    control.activateControl$.set([(await outFields$.promise).form.control!]);

    await fixture.whenStable();
    fixture.detectChanges();
    expect(instance.model$()['v1']['k1']).toEqual(undefined);

    expect(instance.model$()['v1']['k3']).toEqual(undefined);
    expect(instance.model$()['v1']['k4']).toEqual(undefined);
  });

  it('intersect-二层交叉', async () => {
    const fields$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const fields1$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const outFields$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const fields2$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const define = v.object({
      v1: v.pipe(
        v.intersect([
          v.object({
            k1: v.string(),
            k2: v.string(),
          }),
          v.intersect([
            v.object({
              s1: v.pipe(v.string(), setComponent('test4'), getField(fields1$)),
            }),
            v.object({
              s2: v.pipe(v.string(), getField(fields2$)),
            }),
          ]),
        ]),
      ),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal<Record<string, any>>({
        v1: {
          s1: 'v1',
          s2: 'v2',
        },
      }),

      {
        types: {
          test4: { type: Test4Component },
        },
      },
    );
    await fixture.whenStable();
    fixture.detectChanges();

    const field1 = await fields1$.promise;
    const field2 = await fields2$.promise;
    expect(field1.form.control?.value).toBe('v1');
    expect(field2.form.control?.value).toBe('v2');

    expect(element.querySelector('.test4-model-value')?.innerHTML).toBe('v1');
    field1.form.control?.updateValue('vv1');
    await fixture.whenStable();
    fixture.detectChanges();
    expect(element.querySelector('.test4-model-value')?.innerHTML).toBe('vv1');

    instance.model$.set({
      v1: {
        k1: 'v12',
      },
    });
    await fixture.whenStable();
    fixture.detectChanges();
    expect(field1.form.control?.value).toBe(undefined);
    expect(field2.form.control?.value).toBe(undefined);
  });
  it('union联合', async () => {
    const fields$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const fields1$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const fields2$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const define = v.object({
      v1: v.pipe(
        v.union([
          v.object({
            k1: v.pipe(
              v.optional(v.string()),
              getField(fields1$),
              setComponent('test4'),
            ),
            k2: v.optional(v.string()),
          }),
          v.object({
            k3: v.pipe(
              v.optional(v.string()),
              getField(fields2$),
              setComponent('test4'),
            ),
            k4: v.optional(v.string()),
          }),
        ]),
        getField(fields$),
      ),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal<Record<string, any>>({
        v1: {
          k1: '1',
        },
      }),

      {
        types: {
          test4: { type: Test4Component },
        },
      },
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const field1 = await fields1$.promise;
    field1.form.control?.updateValue('v1');
    await fixture.whenStable();
    fixture.detectChanges();
    expect(element.querySelector('.test4-model-value')?.innerHTML).toBe('v1');
    expect(instance.model$()['v1']['k1']).toEqual('v1');
    expect(instance.model$()['v1']['k2']).toEqual(undefined);
    expect(instance.model$()['v1']['k3']).toEqual(undefined);
    expect(instance.model$()['v1']['k4']).toEqual(undefined);

    const field = await fields$.promise;
    const control = field.form.control as FieldLogicGroup;
    control.activateControl$.set([field.fixedChildren!()[1].form.control!]);

    const field2 = await fields2$.promise;
    field2.form.control?.updateValue('v2');
    await fixture.whenStable();
    fixture.detectChanges();

    expect(instance.model$()['v1']['k1']).toEqual(undefined);
    expect(instance.model$()['v1']['k2']).toEqual(undefined);
    expect(instance.model$()['v1']['k3']).toEqual('v2');
    expect(instance.model$()['v1']['k4']).toEqual(undefined);
    instance.model$.set({
      v1: {
        k3: 'v12',
      },
    });
    await fixture.whenStable();
    fixture.detectChanges();
    expect(element.querySelectorAll('.test4-model-value')[1]?.innerHTML).toBe(
      'v12',
    );
    expect(field2.form.control?.value).toBe('v12');
    // expect(field1.form.control?.value).toBe(undefined);
  });
  it('union联合-数字字符串', async () => {
    const fields$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const fields1$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const fields2$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const define = v.object({
      v1: v.pipe(
        v.union([
          v.pipe(v.string(), getField(fields1$), setComponent('test4')),
        ]),
        getField(fields$),
      ),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal<Record<string, any>>({
        v1: '111',
      }),

      {
        types: {
          test4: { type: Test4Component },
        },
      },
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const field1 = await fields1$.promise;
    expect(field1.form.control?.value).toBe('111');
    expect(element.querySelector('.test4-model-value')?.innerHTML).toBe('111');
    field1.form.control?.updateValue('v1');
    await fixture.whenStable();
    fixture.detectChanges();
    expect(element.querySelector('.test4-model-value')?.innerHTML).toBe('v1');
  });

  it('intersect-禁用测试', async () => {
    const fields$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const fields1$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const fields2$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const define = v.object({
      v1: v.pipe(
        v.intersect([
          v.pipe(
            v.object({
              k1: v.pipe(
                v.optional(v.string(), 'k1-value'),
                setComponent('test4'),
                getField(fields1$),
              ),
              k2: v.pipe(
                v.optional(v.string(), 'k2-value'),
                getField(fields2$),
              ),
            }),
          ),
        ]),
        getField(fields$),
      ),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal<Record<string, any>>({
        v1: {},
      }),

      {
        types: {
          test4: { type: Test4Component },
        },
      },
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const field1 = await fields1$.promise;

    expect(field1.form.control!.value).toEqual('k1-value');
    const field2 = await fields2$.promise;
    expect(field2.form.control!.value).toEqual('k2-value');

    expect(instance.model$()).toEqual({
      v1: { k1: 'k1-value', k2: 'k2-value' },
    });

    expect(element.querySelector('.test4-model-value')?.innerHTML).toBe(
      'k1-value',
    );

    field2.form.control!.disable();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(instance.model$()).toEqual({
      v1: { k1: 'k1-value' },
    });
  });
  it('or-禁用测试', async () => {
    const fields$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const fields1$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const fields2$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const define = v.object({
      v1: v.pipe(
        v.union([
          v.object({
            k1: v.tuple([
              v.pipe(
                v.optional(v.string(), 'k1-value'),
                getField(fields1$),

                setComponent('test4'),
              ),
            ]),
          }),
        ]),
        getField(fields$),
      ),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal<Record<string, any>>({
        v1: {},
      }),

      {
        types: {
          test4: { type: Test4Component },
        },
      },
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const field1 = await fields1$.promise;

    expect(field1.form.control!.value).toEqual('k1-value');

    expect(instance.model$()).toEqual({
      v1: { k1: ['k1-value'] },
    });

    expect(element.querySelector('.test4-model-value')?.innerHTML).toBe(
      'k1-value',
    );

    field1.form.control!.disable();
    await fixture.whenStable();
    fixture.detectChanges();
    // 因为底层禁用,并且只有一个,导致顶层全部禁用
    expect(instance.form$().value$$()).toEqual(undefined);
  });
  it('or-切换', async () => {
    const fields$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const define = v.object({
      v1: v.pipe(
        v.union([
          v.pipe(v.optional(v.string(), 'k1-value'), setComponent('test4')),
          v.pipe(v.optional(v.string(), 'k2-value'), setComponent('test4')),
        ]),
        getField(fields$),
      ),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal<Record<string, any>>({}),

      {
        types: {
          test4: { type: Test4Component },
        },
      },
    );
    await fixture.whenStable();
    fixture.detectChanges();

    expect(instance.model$()).toEqual({
      v1: 'k1-value',
    });
    const field = await fields$.promise;
    const control = field.form.control as FieldLogicGroup;
    control.activateIndex$.set(1);
    await fixture.whenStable();
    fixture.detectChanges();
    expect(instance.model$()).toEqual({
      v1: 'k2-value',
    });
  });

  it('and禁用子级', async () => {
    const fields$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const fields1$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const define = v.object({
      v1: v.pipe(
        v.intersect([
          v.pipe(
            v.object({
              k1: v.pipe(
                v.optional(v.string()),
                setComponent('test4'),
                getField(fields1$),
              ),
              k2: v.optional(v.string()),
            }),
            formConfig({ disabled: true, disabledValue: 'delete' }),
            layout({ keyPath: ['#'], priority: 1 }),
          ),
        ]),
        getField(fields$),
      ),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal<Record<string, any>>({
        v1: {
          k1: '1',
        },
      }),

      {
        types: {
          test4: { type: Test4Component },
        },
      },
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const field1 = await fields1$.promise;
    field1.form.control!.updateValue('xxx');
    await fixture.whenStable();
    fixture.detectChanges();
    expect(instance.form$().value$$()).toEqual(undefined);
  });
  it('and禁用子级保留', async () => {
    const fields$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const fields1$ = Promise.withResolvers<PiResolvedViewFieldConfig>();
    const define = v.object({
      v1: v.pipe(
        v.intersect([
          v.pipe(
            v.object({
              k1: v.pipe(
                v.optional(v.string()),
                setComponent('test4'),
                getField(fields1$),
              ),
            }),
            formConfig({
              disabled: true,
              disabledValue: 'reserve',
            }),
            layout({ keyPath: ['#'], priority: 1 }),
          ),
        ]),
        getField(fields$),
      ),
    });
    const { fixture, instance, element } = await createSchemaComponent(
      signal(define),
      signal<Record<string, any>>({
        v1: {
          k1: '1',
        },
      }),

      {
        types: {
          test4: { type: Test4Component },
        },
      },
    );
    await fixture.whenStable();
    fixture.detectChanges();
    const field1 = await fields1$.promise;
    field1.form.control!.updateValue('xxx');
    await fixture.whenStable();
    fixture.detectChanges();
    // 因为有些属性没有继承,禁用是继承了,但是禁用后的行为没有继承
    expect(instance.model$()).toEqual({
      v1: { k1: 'xxx' },
    });
  });
});

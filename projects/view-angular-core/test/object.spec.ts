import * as v from 'valibot';

import { asControl } from '@piying/valibot-visit';
import {
  _PiResolvedCommonViewFieldConfig,
  formConfig,
  NFCSchema,
  setComponent,
} from '@piying/view-angular-core';
import { createBuilder } from './util/create-builder';
import {
  assertFieldArray,
  assertFieldControl,
  assertFieldGroup,
  assertFieldLogicGroup,
} from './util/is-field';
import { getField } from './util/action';
// 用于测试fields和model变动时,数值是否正确
describe('对象', () => {
  it('普通对象', () => {
    const obj = v.object({
      key1: v.pipe(
        v.object({
          test1: v.optional(v.string(), 'value1'),
        }),
      ),
    });
    const list = createBuilder(obj).fixedChildren!();
    assertFieldGroup(list[0].form.control);
    expect(list.length).toBe(1);
    expect(list[0].fixedChildren?.().length).toBe(1);
  });
  it('对象视为控件', () => {
    const obj = v.object({
      key1: v.pipe(
        v.object({
          test1: v.pipe(v.optional(v.string(), 'value1'), v.minLength(1)),
        }),
        asControl(),
      ),
    });
    const list = createBuilder(obj).fixedChildren!();
    expect(list.length).toBe(1);
    assertFieldControl(list[0].form.control);
    expect(list[0].formConfig().defaultValue).toEqual({
      test1: 'value1',
    });
  });
  it('对象控件验证', async () => {
    const field$ = Promise.withResolvers<_PiResolvedCommonViewFieldConfig>();
    const obj = v.object({
      key1: v.pipe(
        v.object({
          test1: v.pipe(v.optional(v.string(), 'value1'), v.minLength(1000)),
        }),
        getField(field$),
        asControl(),
      ),
    });
    const result = createBuilder(obj).fixedChildren!();
    expect(result.length).toBe(1);

    const field = await field$.promise;
    expect(field.form.control!.errors).toBeTruthy();
  });
  it('元组视为控件', () => {
    const obj = v.object({
      key1: v.pipe(
        v.tuple([
          v.pipe(v.optional(v.string(), '1'), v.minLength(1)),
          v.optional(v.number(), 2),
        ]),
        asControl(),
      ),
    });
    const list = createBuilder(obj).fixedChildren!();
    expect(list.length).toBe(1);
    expect(list[0].formConfig().defaultValue).toEqual(['1', 2]);
  });

  it('内部存在Object多个处理', () => {
    const obj = v.object({
      l1: v.pipe(
        v.object({
          l2: v.object({
            k1: v.optional(v.string(), '1'),
            k2: v.optional(v.number(), 2),
          }),
        }),
        asControl(),
      ),
    });
    const list = createBuilder(obj).fixedChildren!();

    expect(list.length).toBe(1);
    expect(list[0].formConfig().defaultValue).toEqual({
      l2: {
        k1: '1',
        k2: 2,
      },
    });
  });
  it('union或处理', () => {
    const obj = v.object({
      l1: v.union([v.object({ k1: v.string() }), v.object({ k2: v.number() })]),
    });
    const list = createBuilder(obj).fixedChildren!();
    assertFieldLogicGroup(list[0].form.control);
    expect(list.length).toBe(1);
    expect(list[0].fixedChildren?.().length).toBe(2);
  });
  it('对象视为控件(一维数组)', async () => {
    const fields$ = Promise.withResolvers<_PiResolvedCommonViewFieldConfig>();
    const obj = v.object({
      l1: v.pipe(
        v.object({
          l2: v.array(v.pipe(v.string(), v.maxLength(2))),
        }),
        asControl(),
        getField(fields$),
      ),
    });
    const list = createBuilder(obj).fixedChildren!();
    assertFieldControl(list[0].form.control);
    const field = await fields$.promise;
    expect(field.form.control!.errors).toBeTruthy();
  });
  it('对象视为控件(二维数组)', async () => {
    const fields$ = Promise.withResolvers<_PiResolvedCommonViewFieldConfig>();
    const obj = v.object({
      l1: v.pipe(
        v.object({
          l2: v.array(v.array(v.pipe(v.string(), v.maxLength(2)))),
        }),
        asControl(),
        getField(fields$),
      ),
    });
    const rBuilder = createBuilder(obj);
    const list = rBuilder.fixedChildren!();
    assertFieldControl(list[0].form.control);
    rBuilder.form.control?.updateValue({ l1: { l2: [['111']] } });
    const field = await fields$.promise;
    expect(field.form.control!.errors).toBeTruthy();
    rBuilder.form.control?.updateValue({ l1: { l2: [['11']] } });
    expect(field.form.control!.errors).toBeFalsy();
  });
  it('对象视为控件(数组,对象,数组)', async () => {
    const fields$ = Promise.withResolvers<_PiResolvedCommonViewFieldConfig>();

    const obj = v.object({
      l1: v.pipe(
        v.object({
          l2: v.array(
            v.object({ i1: v.array(v.pipe(v.string(), v.maxLength(2))) }),
          ),
        }),
        asControl(),
        getField(fields$),
      ),
    });
    const resolved = createBuilder(obj);
    const list = resolved.fixedChildren!();
    assertFieldControl(list[0].form.control);
    resolved.form.control?.updateValue({ l1: { l2: [{ i1: ['111'] }] } });
    const field = await fields$.promise;
    expect(field.form.control!.errors).toBeTruthy();
    resolved.form.control?.updateValue({ l1: { l2: [{ i1: ['11'] }] } });
    expect(field.form.control!.errors).toBeFalsy();
  });
  it('数组视为控件', async () => {
    const fields$ = Promise.withResolvers<_PiResolvedCommonViewFieldConfig>();
    const obj = v.object({
      l1: v.pipe(
        v.array(v.pipe(v.string(), v.maxLength(2))),
        asControl(),
        getField(fields$),
      ),
    });
    const resolved = createBuilder(obj);
    const list = resolved.fixedChildren!();
    assertFieldControl(list[0].form.control);
    resolved.form.control?.updateValue({ l1: ['111'] });

    const field = await fields$.promise;
    expect(field.form.control!.errors).toBeTruthy();
    resolved.form.control?.updateValue({ l1: ['11'] });
    expect(field.form.control!.errors).toBeFalsy();
  });
  it('对象视为控件-必填', async () => {
    const fields$ = Promise.withResolvers<_PiResolvedCommonViewFieldConfig>();
    const obj = v.object({
      l1: v.pipe(
        v.object({
          l2: v.string(),
        }),
        asControl(),
        getField(fields$),
      ),
    });
    const resolved = createBuilder(obj);
    const list = resolved.fixedChildren!();
    assertFieldControl(list[0].form.control);
    resolved.form.control?.updateValue({ l1: { l2: undefined } });

    const field = await fields$.promise;
    expect(field.form.control!.errors).toBeTruthy();
    resolved.form.control?.updateValue({ l1: { l2: '' } });
    expect(field.form.control!.errors).toBeFalsy();
  });
  it('对象视为控件-交叉类型', async () => {
    const fields$ = Promise.withResolvers<_PiResolvedCommonViewFieldConfig>();
    const obj = v.object({
      l1: v.pipe(
        v.object({
          l2: v.intersect([
            v.object({ k1: v.string() }),
            v.object({ k2: v.string() }),
          ]),
        }),
        asControl(),
        getField(fields$),
      ),
    });
    const resolved = createBuilder(obj);
    const list = resolved.fixedChildren!();
    assertFieldControl(list[0].form.control);
    resolved.form.control?.updateValue({ l1: { l2: { k1: '1' } } });

    const field = await fields$.promise;
    expect(field.form.control!.errors).toBeTruthy();
    resolved.form.control?.updateValue({ l1: { l2: { k1: '1', k2: '2' } } });
    expect(field.form.control!.errors).toBeFalsy();
  });

  it('元组赋值变更', async () => {
    const obj = v.pipe(v.object({ a: v.pipe(v.tuple([v.string()])) }));
    const resolved = createBuilder(obj);
    const list = resolved.fixedChildren!();
    assertFieldArray(list[0].form.control);
    resolved.form.control?.updateValue({ a: ['value2'] });
    expect(resolved.form.control?.value$$()).toEqual({ a: ['value2'] });
  });
  it('NFC-group', () => {
    const obj = v.object({
      key1: NFCSchema,
    });
    const list = createBuilder(obj).fixedChildren!();
    expect(list.length).toBe(1);
    expect(list[0].form.control).toBeFalsy();
  });

  it('toModel/toView', async () => {
    const obj = v.pipe(
      v.object({
        k1: v.string(),
      }),
      formConfig({
        transfomer: {
          toModel(value, control) {
            if (value) {
              expect(value).toEqual({ k1: '2' });
            }
            return { k1: '3' };
          },
          toView(value, control) {
            if (value) {
              expect(value).toEqual({ k1: '1' });
            }
            return { k1: '2' };
          },
        },
      }),
    );
    const result = createBuilder(obj);
    result.form.control?.updateValue({ k1: '1' });
    expect(result.form.control?.value$$()).toEqual({ k1: '3' });
  });

  it('reset', () => {
    const obj = v.object({
      key1: v.optional(v.string(), '1'),
      key2: v.string(),
    });
    const list = createBuilder(obj);
    list.form.root.updateValue({ key1: '2' });

    expect(list.form.root.value).toEqual({ key1: '2' });
    list.form.root.reset();
    expect(list.form.root.value).toEqual({ key1: '1' });
  });
  it('object default value', async () => {
    const field$ = Promise.withResolvers<_PiResolvedCommonViewFieldConfig>();
    const obj = v.pipe(
      v.optional(
        v.object({ k1: v.string(), k2: v.optional(v.string(), 'k2-value') }),
        { k1: '123' },
      ),
      getField(field$),
    );
    const result = createBuilder(obj);
    const resolved = await field$.promise;
    assertFieldGroup(resolved.form.control);
    expect(resolved.form.control.value).toEqual({ k1: '123', k2: 'k2-value' });
  });
  it('object default reset', async () => {
    const obj = v.pipe(
      v.optional(
        v.object({ k1: v.string(), k2: v.optional(v.string(), 'k2-value') }),
        { k1: '123' },
      ),
    );
    const result = createBuilder(obj);
    result.form.root.updateValue({ k1: '1', k2: '2' });
    expect(result.form.root.value).toEqual({ k1: '1', k2: '2' });
    result.form.root.reset();
    expect(result.form.root.value).toEqual({ k1: '123', k2: 'k2-value' });
  });

  it('object rest', () => {
    const obj = v.pipe(
      v.objectWithRest(
        {
          key1: v.string(),
        },
        v.number(),
      ),
      setComponent('object'),
    );
    const resolved = createBuilder(obj);
    assertFieldGroup(resolved.form.control);
    expect(Object.keys(resolved.form.control.selfControls$()).length).toEqual(
      1,
    );
    expect(Object.keys(resolved.form.control!.resetControls$()).length).toEqual(
      0,
    );
    expect(resolved.fixedChildren!().length).toEqual(1);
    expect(resolved.restChildren!().length).toEqual(0);
    resolved.action.set(11, 'r1');
    expect(Object.keys(resolved.form.control.selfControls$()).length).toEqual(
      1,
    );
    expect(Object.keys(resolved.form.control!.resetControls$()).length).toEqual(
      1,
    );
    expect(resolved.fixedChildren!().length).toEqual(1);
    expect(resolved.restChildren!().length).toEqual(1);
    expect(resolved.restChildren!()![0].form.parent).toBe(
      resolved.form.control,
    );
    resolved.action.remove('r1');
    expect(resolved.fixedChildren!().length).toEqual(1);
    expect(resolved.restChildren!().length).toEqual(0);
    expect(Object.keys(resolved.form.control.selfControls$()).length).toEqual(
      1,
    );
    expect(Object.keys(resolved.form.control!.resetControls$()).length).toEqual(
      0,
    );
  });
  it('object rest default', () => {
    const obj = v.pipe(
      v.optional(
        v.objectWithRest(
          {
            key1: v.string(),
          },
          v.string(),
        ),
        { key1: '1', key2: '2' },
      ),
      setComponent('object'),
    );
    const resolved = createBuilder(obj);
    assertFieldGroup(resolved.form.control);
    expect(Object.keys(resolved.form.control.selfControls$()).length).toEqual(
      1,
    );
    expect(Object.keys(resolved.form.control.resetControls$()).length).toEqual(
      1,
    );
    resolved.action.set(11, 'r1');
    expect(Object.keys(resolved.form.control.selfControls$()).length).toEqual(
      1,
    );
    expect(Object.keys(resolved.form.control.resetControls$()).length).toEqual(
      2,
    );
    expect(resolved.restChildren!().length).toEqual(2);
    resolved.form.control.reset();
    expect(Object.keys(resolved.form.control.selfControls$()).length).toEqual(
      1,
    );
    expect(Object.keys(resolved.form.control.resetControls$()).length).toEqual(
      1,
    );
    expect(resolved.restChildren!().length).toEqual(1);
  });
});

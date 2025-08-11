import * as v from 'valibot';

import {
  asVirtualGroup,
  _PiResolvedCommonViewFieldConfig,
  NFCSchema,
} from '@piying/view-angular-core';
import { createBuilder } from './util/create-builder';
import { keyEqual } from './util/key-equal';
import { getField } from './util/action';
import {
  assertFieldGroup,
  assertFieldControl,
  assertFieldArray,
  assertFieldLogicGroup,
} from './util/is-field';

// 用于测试fields和model变动时,数值是否正确
describe('hello', () => {
  it('string', () => {
    const obj = v.object({
      key1: v.string(),
    });
    const result = v.parse(obj, { key1: '1' });
    expect(result.key1).toBe('1');
    keyEqual(result.key1, '1');
  });
  it('转换', () => {
    const obj = v.object({
      key1: v.string(),
    });
    const result = createBuilder(obj).fixedChildren!();
    expect(result.length).toBe(1);
    keyEqual(result[0].keyPath, 'key1');
  });
  it('可选', () => {
    const obj = v.object({
      key1: v.optional(v.string()),
    });
    const result = createBuilder(obj).fixedChildren!();
    expect(result.length).toBe(1);
  });
  it('验证', async () => {
    const field$ = Promise.withResolvers<_PiResolvedCommonViewFieldConfig>();
    const obj = v.object({
      key1: v.pipe(v.string(), v.minLength(20), getField(field$)),
    });
    const result = createBuilder(obj);
    expect(result.fixedChildren!().length).toBe(1);
    const field = await field$.promise;
    result.form.control?.updateValue({ key1: 'd1' });
    assertFieldGroup(result.form.control);
    assertFieldControl(field.form.control);

    expect(field.form.control?.value$$()).toBe('d1');
    expect(field.form.control?.errors).toBeTruthy();
    expect(result.form.control?.value$$()).toBe(undefined);
  });
  it('transform', async () => {
    const field$ = Promise.withResolvers<_PiResolvedCommonViewFieldConfig>();
    const obj = v.object({
      key1: v.pipe(
        v.number(),
        getField(field$),
        v.transform((value) => value + 1),
      ),
    });
    const result = createBuilder(obj).fixedChildren!();
    const field = await field$.promise;
    assertFieldControl(field.form.control);
    field.form.control.viewValueChange(5);
    expect(field.form.control.value$$()).toBe(6);
  });
  it('array', () => {
    const obj = v.object({
      key1: v.array(v.string()),
    });
    const result = createBuilder(obj).fixedChildren!();

    expect(result.length).toBe(1);
    assertFieldArray(result[0].form.control);
    result[0].form.control?.updateValue(['1']);
    expect(result[0].form.control?.value$$()).toEqual(['1']);
  });
  it('tuple', async () => {
    const obj = v.pipe(v.tuple([v.string(), v.number()]), )
    const result = createBuilder(obj)
    expect(result.fixedChildren?.().length).toBe(2);
    expect(result.restChildren?.()).toBeFalsy();
    assertFieldArray(result.form.control);
    result.form.control?.updateValue(['1', 0]);
    expect(result.form.control?.value$$()).toEqual(['1', 0]);
  });
  it('enum', () => {
    enum E1 {
      value1 = '1',
      value2 = '2',
    }
    const obj = v.object({
      e1: v.enum(E1),
    });
    const result = createBuilder(obj).fixedChildren!();
    expect(result.length).toBe(1);
    // typeEqual(result[0].type, 'enum');
    assertFieldControl(result[0].form.control);

    expect(result[0].props()!['options']).toEqual(['1', '2']);
  });
  it('picklist', () => {
    const obj = v.object({
      e1: v.picklist(['value1', 'value2']),
    });
    const result = createBuilder(obj).fixedChildren!();
    expect(result.length).toBe(1);
    // typeEqual(result[0].type, 'picklist');
    assertFieldControl(result[0].form.control);

    expect(result[0].props()!['options']).toEqual(['value1', 'value2']);
  });
  it('boolean', () => {
    const obj = v.object({
      key1: v.boolean(),
    });
    const result = createBuilder(obj).fixedChildren!();
    expect(result.length).toBe(1);
    // typeEqual(result[0].type, 'boolean');
    assertFieldControl(result[0].form.control);
  });
  it('null', () => {
    const obj = v.object({
      key1: v.null(),
    });
    const result = createBuilder(obj).fixedChildren!();
    expect(result.length).toBe(1);
    // typeEqual(result[0].type, 'null');
    assertFieldControl(result[0].form.control);
  });
  it('record', () => {
    const obj = v.object({
      key1: v.record(v.string(), v.string()),
    });
    const result = createBuilder(obj).fixedChildren!();
    expect(result.length).toBe(1);
    // typeEqual(result[0].type, 'record');
    assertFieldControl(result[0].form.control);
  });
  it('any', () => {
    const obj = v.object({
      key1: v.any(),
    });
    const result = createBuilder(obj).fixedChildren!();
    expect(result.length).toBe(1);
    // typeEqual(result[0].type, 'any');
    assertFieldControl(result[0].form.control);
  });
  it('intersect', () => {
    const obj = v.object({
      key1: v.intersect([
        v.object({ foo: v.pipe(v.string()) }),
        v.object({ bar: v.number() }),
      ]),
    });
    const result = createBuilder(obj).fixedChildren!();
    expect(result.length).toBe(1);
    // typeEqual(result[0].type, 'intersect');
    assertFieldLogicGroup(result[0].form.control);
    expect(result[0].fixedChildren!().length).toBe(2);
  });

  it('pipe嵌套', async () => {
    const field$ = Promise.withResolvers<_PiResolvedCommonViewFieldConfig>();

    const obj = v.object({
      key1: v.pipe(v.pipe(v.string(), getField(field$))),
    });
    const result = createBuilder(obj).fixedChildren!();

    expect(result.length).toBe(1);
    assertFieldControl(result[0].form.control);
  });
  it('无值void', () => {
    const obj = v.object({
      key1: v.void(),
      key2: v.never(),
    });
    const result = createBuilder(obj).fixedChildren!();
    expect(result.length).toBe(2);
    // expect(result[0].type).toBe(undefined);
    expect(result[0].form.control).toBeFalsy;
    expect(result[1].form.control).toBeFalsy;
  });
  it('交集root', async () => {
    const field$ = Promise.withResolvers<_PiResolvedCommonViewFieldConfig>();

    // 自动顶级root
    const obj = v.pipe(
      v.intersect([
        v.pipe(
          v.object({
            key1: v.string(),
          }),
          getField(field$),
        ),
        v.object({
          key2: v.string(),
        }),
      ]),
      asVirtualGroup(),
    );
    const fieldGroup = createBuilder(obj);
    const result = fieldGroup.fixedChildren!();
    expect(result.length).toBe(2);
    expect(result[0].fixedChildren!().length).toBe(1);
    keyEqual(result[0].keyPath, undefined);
    expect(result[1].fixedChildren!().length).toBe(1);
    keyEqual(result[1].keyPath, undefined);

    const field = await field$.promise;
    keyEqual(field.keyPath, undefined);
    assertFieldGroup(field.form.control);
  });

  it('optional=>pipe', async () => {
    const field$ = Promise.withResolvers<_PiResolvedCommonViewFieldConfig>();

    const obj = v.object({
      key1: v.optional(v.pipe(v.string(), getField(field$))),
    });
    const result = createBuilder(obj).fixedChildren!();
    expect(result.length).toBe(1);
    keyEqual(result[0].keyPath, 'key1');
    assertFieldControl(result[0].form.control);
    expect(result[0].form.control?.errors).toBe(undefined);
  });
  it('custom', () => {
    const obj = v.object({
      e1: v.custom(() => true),
    });
    const result = createBuilder(obj).fixedChildren!();
    expect(result.length).toBe(1);
    // typeEqual(result[0].type, 'custom');
    assertFieldControl(result[0].form.control);
    expect(result[0].form.control?.errors).toBeFalsy();
  });
  it('custom-no', () => {
    const obj = v.object({
      e1: v.custom(() => false),
    });
    const result = createBuilder(obj).fixedChildren!();
    expect(result.length).toBe(1);
    // typeEqual(result[0].type, 'custom');
    assertFieldControl(result[0].form.control);
    expect(result[0].form.control?.errors).toBeTruthy();
  });
  it('无控件可查询', () => {
    const obj = v.object({
      key1: NFCSchema,
    });
    const result = createBuilder(obj);
    const key1 = result.get(['#', 'key1']);
    expect(key1).toBeTruthy();
  });
});

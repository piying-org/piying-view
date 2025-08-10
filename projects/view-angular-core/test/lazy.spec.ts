import { _PiResolvedCommonViewFieldConfig } from '@piying/view-angular-core';
import * as v from 'valibot';
import { getField } from './util/action';
import { createBuilder } from './util/create-builder';
import { assertFieldArray, assertFieldControl } from './util/is-field';
import { keyEqual } from './util/key-equal';
describe('lazy', () => {
  it('lazy', () => {
    const obj = v.object({
      key1: v.lazy(() => v.string()),
    });
    const result = createBuilder(obj).fixedChildren!();
    expect(result.length).toBe(1);
    keyEqual(result[0].keyPath, 'key1');
  });
  it('lazy带管道', async () => {
    const field$ = Promise.withResolvers<_PiResolvedCommonViewFieldConfig>();
    const obj = v.object({
      key1: v.lazy(() => v.pipe(v.string(), getField(field$), v.maxValue('1'))),
    });
    const bResult = createBuilder(obj);
    const result = bResult.fixedChildren!();
    expect(result.length).toBe(1);
    keyEqual(result[0].keyPath, 'key1');
    assertFieldControl(result[0].form.control);

    bResult.form.control?.updateValue({ key1: '9' });

    expect(bResult.form.control?.value$$()).toBe(undefined);
    expect(result[0].form.control?.errors).toBeTruthy();
  });
  it('array-lazy', () => {
    const obj = v.object({
      key1: v.lazy(() => v.array(v.string())),
    });
    const result = createBuilder(obj).fixedChildren!();
    expect(result.length).toBe(1);
    keyEqual(result[0].keyPath, 'key1');
    expect(result[0].fixedChildren).toBeTruthy();
  });
  it('array-lazy-nest', () => {
    const obj = v.object({
      key1: v.lazy(() => v.array(v.lazy(() => v.array(v.string())))),
    });
    const result = createBuilder(obj);    
    let list = result.fixedChildren!();
    assertFieldArray(list[0].form.control);
    list[0].action.set([], 0);
    expect(list[0].restChildren!().length).toEqual(1);
    assertFieldArray(list[0].restChildren!()[0].form.control);
  });
});

import * as v from 'valibot';

import { rawConfig } from '@piying/view-angular-core';
import { createBuilder } from './util/create-builder';
import { assertFieldArray, assertFieldControl } from './util/is-field';
import { _PiResolvedCommonViewFieldConfig } from '@piying/view-angular-core';
import { getField } from './util/action';

// 用于测试fields和model变动时,数值是否正确
describe('field', () => {
  it('array', async () => {
    const field$ = Promise.withResolvers<_PiResolvedCommonViewFieldConfig>();

    const obj = v.array(
      v.pipe(
        v.string(),
        rawConfig((field) => {
          field!.hooks = {
            allFieldsResolved(field) {
              field$.resolve(field);
            },
          };
          return field;
        }),
      ),
    );
    const result = createBuilder(obj);
    expect(result.fixedChildren).toBeTruthy();
    assertFieldArray(result.form.control);
    result.form.control?.updateValue(['v1']);
    expect(result.form.control.controls$().length).toEqual(1);
    expect(result.form.control.value$$()).toEqual(['v1']);
    result.form.control?.updateValue([1]);
    expect(result.form.control.errors).toBeTruthy();
    expect(result.form.control.value$$()).not.toEqual([1]);
  });
  it('control', async () => {
    const field$ = Promise.withResolvers<_PiResolvedCommonViewFieldConfig>();

    const obj = v.pipe(v.string(), getField(field$));
    const result = createBuilder(obj);
    expect(result.fixedChildren).toBeFalsy();
    expect(result.restChildren).toBeFalsy();
    const field = await field$.promise;
    expect(field.form.root).toBe(result.form.control!);
    // expect(result.type).toBe('string');
    assertFieldControl(result.form.control);
    result.form.control.updateValue('v1');
    expect(result.form.control.value$$()).toEqual('v1');
  });
  it('required', async () => {
    const obj = v.pipe(v.string());
    const result = createBuilder(obj);
    expect(result.form.control?.required$$()).toBeTrue();
    const obj2 = v.pipe(v.optional(v.string()));
    const result2 = createBuilder(obj2);
    expect(result2.form.control?.required$$()).toBeFalse();
  });
  it('control-context', async () => {
    const obj = v.pipe(v.string());
    const result = createBuilder(obj, { context: { value: 1 } });
    expect(result.form.control!.context.value).toEqual(1);
  });
  it('get root', async () => {
    const field$ = Promise.withResolvers<_PiResolvedCommonViewFieldConfig>();
    const obj = v.object({ t1: v.pipe(v.string(), getField(field$)) });
    const result = createBuilder(obj);
    const field = await field$.promise;
    expect(field.form.control?.root).toBe(result.form.control);
  });
  it('getRawValue group', async () => {
    const obj = v.object({ t1: v.string() });
    const result = createBuilder(obj);
    result.form.control!.updateValue({ t1: '1' });
    result.get(['t1'])?.form.control?.disable();
    expect(result.form.control?.getRawValue()).toEqual({ t1: '1' });
  });
  it('getRawValue array', async () => {
    const obj = v.array(v.string());
    const result = createBuilder(obj);
    result.form.control!.updateValue(['1']);
    result.fixedChildren!()[0].form.control!.disable();
    expect(result.form.control?.getRawValue()).toEqual(['1']);
  });
  it('getRawValue logicGroup', async () => {
    const field$ = Promise.withResolvers<_PiResolvedCommonViewFieldConfig>();
    const obj = v.intersect([
      v.pipe(v.object({ k1: v.string() }), getField(field$)),
      v.object({ k2: v.string() }),
    ]);
    const result = createBuilder(obj);
    result.form.control!.updateValue({ k1: 'v1' });
    (await field$.promise).form.control!.disable();
    expect(result.form.control?.getRawValue()).toEqual({ k1: 'v1' });
  });
});

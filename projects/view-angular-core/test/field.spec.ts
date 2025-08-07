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
    expect(result.fieldArray).toBeTruthy();
    expect(result.fieldGroup).toBeFalsy();
    // expect(result.type).toBe('array');
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
    expect(result.fieldArray).toBeFalsy();
    expect(result.fieldGroup).toBeFalsy();
    let field = await field$.promise;
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
});

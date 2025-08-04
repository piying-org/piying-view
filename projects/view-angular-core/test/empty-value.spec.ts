import * as v from 'valibot';
import { createBuilder } from './util/create-builder';
import { formConfig } from '@piying/view-angular-core';

describe('empty value', () => {
  it('group', () => {
    const obj = v.pipe(
      v.object({ a: v.pipe(v.number(), v.maxValue(5)) }),
      formConfig({ emptyValue: {} }),
    );
    const resolved = createBuilder(obj);
    resolved.form.control!.updateValue({ a: 6 });
    expect(resolved.form.control?.errors).toBeTruthy();
    expect(resolved.form.control?.value$$()).toEqual({});
  });
  it('array', () => {
    const obj = v.pipe(
      v.tuple([v.pipe(v.number(), v.maxValue(5))]),
      formConfig({ emptyValue: [] }),
    );
    const resolved = createBuilder(obj);
    resolved.form.control!.updateValue([6]);
    expect(resolved.form.control?.errors).toBeTruthy();
    expect(resolved.form.control?.value$$()).toEqual([]);
  });
});

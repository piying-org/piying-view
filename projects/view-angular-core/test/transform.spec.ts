import * as v from 'valibot';

import { createBuilder } from './util/create-builder';
import { AbstractControl } from '../field/abstract_model';
import { FieldControl } from '../../../dist/view-core';
import { FieldArray } from '../field/field-array';
describe('transform', () => {
  it('str-to-number', () => {
    const obj = v.object({
      v1: v.pipe(
        v.string(),
        v.transform((a) => {
          return +a;
        }),
      ),
    });
    const result = createBuilder(obj);
    result.form.control?.updateValue({ v1: '11' });
    let v1Field = result.get(['v1'])?.form.control as any as FieldControl;
    v1Field.viewValueChange('22');
    expect(v1Field.value).toBe(22);
    expect(result.form.control?.value).toEqual({ v1: 22 });
    expect(result.form.root.valid).toBeTrue();
  });
  it('object-to-str', () => {
    const obj = v.object({
      v1: v.pipe(
        v.object({ v2: v.string() }),
        v.transform((a) => {
          return a.v2;
        }),
      ),
    });
    const result = createBuilder(obj);
    let v2Field = result.get(['v1', 'v2'])?.form.control as any as FieldControl;
    v2Field.viewValueChange('22');
    expect(v2Field.value).toBe('22');
    expect(result.form.root.value).toEqual({ v1: '22' });
    expect(result.form.root.valid).toBeTrue();
  });
  it('array-to-str', () => {
    const obj = v.object({
      v1: v.pipe(
        v.array(v.string()),
        v.transform((a) => {
          return a.join(':');
        }),
      ),
    });
    const result = createBuilder(obj);
    let v1Field = result.get(['v1'])?.form.control as any as FieldArray;
    v1Field.updateValue(['1', '2']);
    expect(v1Field.value).toBe('1:2');
    expect(v1Field.valid).toBeTrue();
  });
});

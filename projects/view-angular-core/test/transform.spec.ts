import * as v from 'valibot';

import { createBuilder } from './util/create-builder';
import { FieldControl } from '../../../dist/view-core';
import { FieldArray } from '../field/field-array';
import { FieldLogicGroup } from '../field/field-logic-group';
describe('transform', () => {
  it('str-to-number', () => {
    const obj = v.object({
      v1: v.pipe(
        v.string(),
        v.transform((a) => +a),
      ),
    });
    const result = createBuilder(obj);
    result.form.control?.updateValue({ v1: '11' });
    const v1Field = result.get(['v1'])?.form.control as any as FieldControl;
    v1Field.viewValueChange('22');
    expect(v1Field.value).toBe(22);
    expect(result.form.control?.value).toEqual({ v1: 22 });
    expect(result.form.root.valid).toBeTrue();
  });
  it('object-to-str', () => {
    const obj = v.object({
      v1: v.pipe(
        v.object({ v2: v.string() }),
        v.transform((a) => a.v2),
      ),
    });
    const result = createBuilder(obj);
    const v2Field = result.get(['v1', 'v2'])?.form
      .control as any as FieldControl;
    v2Field.viewValueChange('22');
    expect(v2Field.value).toBe('22');
    expect(result.form.root.value).toEqual({ v1: '22' });
    expect(result.form.root.valid).toBeTrue();
  });
  it('array-to-str', () => {
    const obj = v.object({
      v1: v.pipe(
        v.array(v.string()),
        v.transform((a) => a.join(':')),
      ),
    });
    const result = createBuilder(obj);
    const v1Field = result.get(['v1'])?.form.control as any as FieldArray;
    v1Field.updateValue(['1', '2']);
    expect(v1Field.value).toBe('1:2');
    expect(v1Field.valid).toBeTrue();
    expect(result.form.root.valid).toBeTrue();
  });
  it('intersect-to-str', () => {
    const obj = v.object({
      v1: v.pipe(
        v.intersect([
          v.object({ k1: v.string() }),
          v.object({ k2: v.string() }),
        ]),
        v.transform((input) => `${input.k1}-${input.k2}`),
      ),
    });
    const result = createBuilder(obj);
    const v1Field = result.get(['v1'])?.form.control as any as FieldLogicGroup;
    v1Field.updateValue({ k1: '11', k2: '22' });
    expect(v1Field.value).toBe('11-22');
    expect(v1Field.valid).toBeTrue();
    expect(result.form.root.valid).toBeTrue();
  });
  it('union-to-str', () => {
    const obj = v.object({
      v1: v.pipe(
        v.union([v.object({ k1: v.string() }), v.object({ k2: v.string() })]),
        v.transform((input) => JSON.stringify(input)),
      ),
    });
    const result = createBuilder(obj);
    const v1Field = result.get(['v1'])?.form.control as any as FieldLogicGroup;
    v1Field.updateValue({ k1: '11', k2: '22' });
    expect(v1Field.value).toBe(JSON.stringify({ k1: '11' }));
    expect(v1Field.valid).toBeTrue();
    expect(result.form.root.valid).toBeTrue();
  });
});

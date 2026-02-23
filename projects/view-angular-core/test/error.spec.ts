import * as v from 'valibot';

import { createBuilder } from './util/create-builder';
import { errorSummary, getDeepError } from '../util/get-error';
import { FieldLogicGroup } from '../field/field-logic-group';
import { FieldArray } from '../field/field-array';
describe('error', () => {
  it('valid', () => {
    const obj = v.pipe(v.string());
    const field = createBuilder(obj);
    field.form.control?.updateValue('1');
    expect(getDeepError(field.form.control).length).toEqual(0);
  });
  it('string-error', () => {
    const obj = v.pipe(
      v.string(),
      v.check(() => false),
    );
    const field = createBuilder(obj);
    field.form.control?.updateValue('1');
    expect(getDeepError(field.form.control).length).toEqual(1);
  });
  it('object-error', () => {
    const obj = v.object({ k1: v.string() });
    const field = createBuilder(obj);
    field.form.control?.updateValue({ k2: '2' });
    expect(getDeepError(field.form.control).length).toEqual(1);
  });
  it('union-error', () => {
    const obj = v.union([
      v.optional(
        v.strictObject({
          k1: v.optional(v.string()),
        }),
      ),
    ]);
    const field = createBuilder(obj);
    field.form.control?.updateValue({ k2: '2' });
    expect(getDeepError(field.form.control).length).toEqual(1);
  });
  it('查找子级异常', () => {
    const obj = v.object({
      k1: v.string(),
    });
    const field = createBuilder(obj);
    field.form.control?.updateValue({ k1: 1 });
    expect(field.form.control?.errors![0].kind).toBe('descendant');
    expect(field.form.control?.errors![0]['metadata']).toBeTruthy();
  });
  it('intersect异常一个', async () => {
    const obj = v.object({
      v1: v.pipe(
        v.intersect([
          v.object({ k1: v.string() }),
          v.object({ k2: v.number() }),
        ]),
      ),
    });

    const result = createBuilder(obj);
    const v1Field = result.get(['v1'])?.form.control as any as FieldLogicGroup;
    v1Field.updateValue({ k1: '1', k2: '2' });
    expect(v1Field.valid).toBeFalsy();
    expect(v1Field.errors).toBeTruthy();
    v1Field.activateControls$.set([v1Field.controls[0]]);
    expect(v1Field.valid).toBeTruthy();
    expect(v1Field.errors).toBeFalsy();
  });
  it('object-errorSummary', async () => {
    const obj = v.object({
      v1: v.object({ v2: v.string() }),
    });

    const result = createBuilder(obj);
    result.form.control!.updateValue({ v1: { k2: 1 } });
    const list = errorSummary(result.form.root);
    expect(list[0].pathList).toEqual(['v1', 'v2']);
  });
  it('intersect-errorSummary', async () => {
    const obj = v.object({
      v1: v.intersect([v.object({ v2: v.string() })]),
    });

    const result = createBuilder(obj);
    result.form.control!.updateValue({ v1: { k2: 1 } });
    const list = errorSummary(result.form.root);
    expect(list[0].pathList).toEqual(['v1', '[∧0]', 'v2']);
    expect(list[0].fieldList[0] instanceof FieldLogicGroup).toBeTrue();
  });
  it('array-errorSummary', async () => {
    const obj = v.object({
      v1: v.tuple([v.object({ v2: v.string() })]),
    });

    const result = createBuilder(obj);
    result.form.control!.updateValue({ v1: [{ k2: 1 }] });
    const list = errorSummary(result.form.root);
    expect(list[0].pathList).toEqual(['v1', '[0]', 'v2']);
    expect(list[0].fieldList[0] instanceof FieldArray).toBeTrue();
    expect(typeof list[0].valibotIssueSummary === 'string').toBeTrue();
  });
});

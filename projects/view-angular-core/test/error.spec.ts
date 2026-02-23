import * as v from 'valibot';

import { createBuilder } from './util/create-builder';
import { getDeepError } from '../util/get-error';
import { FieldLogicGroup } from '../field/field-logic-group';
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
    expect(getDeepError(field.form.control).length).toEqual(2);
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
    expect(getDeepError(field.form.control).length).toEqual(2);
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
    let v1Field = result.get(['v1'])?.form.control as any as FieldLogicGroup;
    v1Field.updateValue({ k1: '1', k2: '2' });
    expect(v1Field.errors).toBeTruthy();
    v1Field.activateControls$.set([v1Field.controls[0]]);
    expect(v1Field.errors).toBeFalsy();
  });
});

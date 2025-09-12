import * as v from 'valibot';

import { createBuilder } from './util/create-builder';
import { assertFieldLogicGroup } from './util/is-field';
import { formConfig } from '../src/convert';
describe('field-logic-group', () => {
  it('union-index', () => {
    const obj = v.union([
      v.object({ k1: v.number() }),
      v.object({ k2: v.string() }),
    ]);
    const result = createBuilder(obj);
    assertFieldLogicGroup(result.form.control);
    result.form.control.updateValue({ k2: '1' });

    expect(result.form.control.activateIndex$()).toEqual(1);
    result.form.control.updateValue({ k1: 0 });
    expect(result.form.control.activateIndex$()).toEqual(0);
  });
  it('union-index', () => {
    const obj = v.union([
      v.strictObject({ k1: v.number() }),
      v.strictObject({ k1: v.number(), k2: v.string() }),
    ]);
    const result = createBuilder(obj);
    assertFieldLogicGroup(result.form.control);
    result.form.control.updateValue({ k1: 1, k2: '1' });
    expect(result.form.control.activateIndex$()).toEqual(1);
    result.form.control.updateValue({ k1: 0 });
    expect(result.form.control.activateIndex$()).toEqual(0);
  });
  it('union-index-disable', () => {
    const obj = v.pipe(
      v.union([v.object({ k1: v.number() }), v.object({ k2: v.string() })]),
      formConfig({ disableOrUpdateActivate: true }),
    );
    const result = createBuilder(obj);
    assertFieldLogicGroup(result.form.control);
    result.form.control.updateValue({ k2: '1' });
    expect(result.form.control.activateIndex$()).toEqual(0);
    result.form.control.updateValue({ k1: 0 });
    expect(result.form.control.activateIndex$()).toEqual(0);
  });
  it('union-sub-invalid', () => {
    const obj = v.pipe(
      v.union([v.object({ k1: v.number() }), v.object({ k2: v.string() })]),
    );
    const result = createBuilder(obj);
    assertFieldLogicGroup(result.form.control);
    result.form.control.updateValue({ k2: '1' });
    expect(result.form.control.valid).toEqual(true);
    expect(result.form.control.errors).toBeFalsy()
    expect(result.form.control.children$$().length).toBe(2)
    expect(result.form.control.find(0)).toBeTruthy()
    expect(result.form.control.find(1)).toBeTruthy()
  });
});

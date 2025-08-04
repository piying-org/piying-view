import * as v from 'valibot';

import { createBuilder } from './util/create-builder';

import { assertFieldControl } from './util/is-field';
describe('reset', () => {
  it('invalid reset', () => {
    const obj = v.pipe(
      v.optional(v.string(), '2'),
      v.check((value) => value === '2'),
    );
    const resolved = createBuilder(obj);
    assertFieldControl(resolved.form.control);
    resolved.form.control!.viewValueChange('1');
    expect(resolved.form.control!.errors).toBeTruthy();
    resolved.form.control!.reset();
    expect(resolved.form.control!.errors).toBeFalsy();
  });
  it('invalid reset-重置后异常', () => {
    const obj = v.pipe(v.string());
    const resolved = createBuilder(obj);
    assertFieldControl(resolved.form.control);
    resolved.form.control!.viewValueChange('1');
    expect(resolved.form.control!.errors).toBeFalsy();
    resolved.form.control!.reset();
    expect(resolved.form.control!.errors).toBeTruthy();
  });
});

import * as v from 'valibot';

import { createBuilder } from './util/create-builder';
describe('nullable', () => {
  it('nullable', () => {
    const obj = v.nullable(v.string());
    const result = createBuilder(obj);
    result.form.control?.updateValue(undefined);
    expect(result.form.control?.errors).toBeFalsy();
  });
  it('obj-nullable', () => {
    const obj = v.object({
      k1: v.nullable(v.string()),
      k2: v.string(),
    });
    const result = createBuilder(obj);
    result.form.control?.updateValue({ k2: '' });
    expect(result.form.control?.errors).toBeFalsy();
  });
});

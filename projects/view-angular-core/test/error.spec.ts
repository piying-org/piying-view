import * as v from 'valibot';

import { createBuilder } from './util/create-builder';
import { getDeepError } from '../util/get-error';
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
});

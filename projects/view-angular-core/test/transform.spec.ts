import * as v from 'valibot';

import { createBuilder } from './util/create-builder';
import { AbstractControl } from '../field/abstract_model';
import { FieldControl } from '../../../dist/view-core';
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
});

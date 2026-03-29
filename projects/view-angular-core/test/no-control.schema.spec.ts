import * as v from 'valibot';
import { createBuilder } from './util/create-builder';
import {
  NFCSchema,
  nfcComponent,
  setComponent,
} from '@piying/view-angular-core';

describe('no-control-schema', () => {
  it('NFCSchema', () => {
    const obj = v.pipe(NFCSchema, setComponent('input'));
    const resolved = createBuilder(obj, { types: ['input'] });
    expect(resolved.form.control).toBeFalsy();
    expect(resolved.define!().type).toBe('input');
  });

  it('nfcComponent', () => {
    const obj = v.pipe(nfcComponent('input'));
    const resolved = createBuilder(obj, { types: ['input'] });
    expect(resolved.form.control).toBeFalsy();
    expect(resolved.define!().type).toBe('input');
  });
});

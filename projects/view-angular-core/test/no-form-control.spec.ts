import * as v from 'valibot';
import { _PiResolvedCommonViewFieldConfig } from '@piying/view-angular-core';
import { createBuilder } from './util/create-builder';

import { NFCSchema } from '@piying/view-angular-core';
import { getField } from './util/action';

// 用于测试fields和model变动时,数值是否正确
describe('no-form-control', () => {
  it('root-无控件定义', async () => {
    const obj = v.pipe(NFCSchema);
    const resolved = createBuilder(obj);
    expect(resolved.form.control).toBeFalsy();
  });
  it('root-有控件定义', async () => {
    const obj = v.pipe(v.string());
    const resolved = createBuilder(obj);
    expect(resolved.form.control).toBeTruthy();
  });
  it('child-无控件定义', async () => {
    const field$ = Promise.withResolvers<_PiResolvedCommonViewFieldConfig>();
    const obj = v.object({ k1: v.pipe(NFCSchema, getField(field$)) });
    const resolved = createBuilder(obj);
    const field = await field$.promise;
    expect(field.form.control).toBeFalsy();
  });
  it('child-有控件定义', async () => {
    const field$ = Promise.withResolvers<_PiResolvedCommonViewFieldConfig>();
    const obj = v.object({ k1: v.pipe(v.string(), getField(field$)) });
    const resolved = createBuilder(obj);
    const field = await field$.promise;
    expect(field.form.control).toBeTruthy();
  });
});

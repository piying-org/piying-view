import * as v from 'valibot';
import { createBuilder } from './util/create-builder';
import { getField } from './util/action';
import {
  _PiResolvedCommonViewFieldConfig,
  setWrappers,
} from '@piying/view-angular-core';
import { isEmpty } from './util/is-empty';

describe('wrapper', () => {
  it('类型测试-str', async () => {
    const field$ = Promise.withResolvers<_PiResolvedCommonViewFieldConfig>();
    const k1Schema = v.pipe(v.string(), getField(field$), setWrappers(['w1']));
    const resolved = createBuilder(k1Schema, { wrappers: ['w1'] });
    const field = await field$.promise;

    expect(field.wrappers().map((item) => item.type)).toEqual(['w1']);
    resolved.wrappers().forEach((item, index) => {
      expect(item.type).toBe(`w${index + 1}`);
      expect(item.inputs()).toBe(undefined);
      expect(item.attributes()).toBe(undefined);
    });
  });
  it('类型测试-type', async () => {
    const field$ = Promise.withResolvers<_PiResolvedCommonViewFieldConfig>();
    const k1Schema = v.pipe(
      v.string(),
      getField(field$),
      setWrappers([{ type: 'w1', inputs: { i1: '1' } }]),
    );
    const resolved = createBuilder(k1Schema, { wrappers: ['w1'] });
    const field = await field$.promise;

    expect(
      field
        .wrappers()
        .map((item) => ({ type: item.type, inputs: item.inputs() })),
    ).toEqual([{ type: 'w1', inputs: { i1: '1' } }]);
    resolved.wrappers().forEach((item, index) => {
      expect(item.type).toBe(`w${index + 1}`);
      expect(item.inputs()).toEqual({ i1: '1' });
      isEmpty(item.attributes());
    });
  });
});

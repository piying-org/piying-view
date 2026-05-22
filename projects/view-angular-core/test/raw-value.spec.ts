import * as v from 'valibot';

import { createBuilder } from './util/create-builder';
import { getField } from './util/action';
import {
  _PiResolvedCommonViewFieldConfig,
  formConfig,
} from '@piying/view-angular-core';
import { pickBy } from 'es-toolkit';
// 用于测试fields和model变动时,数值是否正确
describe('raw-value', () => {
  // 将子级提权到父级
  it('control', async () => {
    const obj = v.string();
    const result = createBuilder(obj);
    result.form.root.updateValue('11');
    expect(result.form.root.value).toEqual('11');
    expect(result.form.root.getRawValue()).toEqual('11');
    result.form.root.updateValue(11);
    expect(result.form.root.invalid).toEqual(true);
    expect(result.form.root.value).toEqual('11');
    expect(result.form.root.getRawValue()).toEqual('11');
  });

  it('getRawValue group', async () => {
    const obj = v.object({ t1: v.string() });
    const result = createBuilder(obj);
    result.form.control!.updateValue({ t1: '1' });
    result.get(['t1'])?.form.control?.disable();
    expect(result.form.control?.getRawValue()).toEqual({ t1: '1' });
  });
  it('getRawValue array', async () => {
    const obj = v.array(v.string());
    const result = createBuilder(obj);
    result.form.control!.updateValue(['1']);
    result.restChildren!()[0].form.control!.disable();
    expect(result.form.control?.getRawValue()).toEqual(['1']);
  });
  it('getRawValue logicGroup', async () => {
    const field$ = Promise.withResolvers<_PiResolvedCommonViewFieldConfig>();
    const obj = v.intersect([
      v.pipe(v.object({ k1: v.string() }), getField(field$)),
      v.object({ k2: v.string() }),
    ]);
    const result = createBuilder(obj);
    result.form.control!.updateValue({ k1: 'v1' });
    (await field$.promise).form.control!.disable();

    expect(pickBy(result.form.control?.getRawValue(), Boolean)).toEqual({
      k1: 'v1',
    });
  });
  it('部分有效-group', async () => {
    const obj = v.object({
      o1: v.object({
        l1: v.string(),
        l2: v.pipe(v.string(), formConfig({ disabled: true })),
        l3: v.string(),
      }),
    });
    const result = createBuilder(obj);
    result.form.root!.updateValue({ o1: { l1: '111', l2: '222' } });
    const value = result.form.root.getRawValue(1);
    expect(value.o1.l1).toEqual('111');
    expect(value.o1.l2).toEqual(undefined);
    expect(value.o1.l3).toEqual(undefined);
  });

  it('部分有效-array', async () => {
    const obj = v.array(
      v.object({
        l1: v.string(),
        l2: v.pipe(v.string(), formConfig({ disabled: true })),
        l3: v.string(),
      }),
    );
    const result = createBuilder(obj);
    result.form.root!.updateValue([
      { l1: '111', l2: '222' },
      { l1: '222', l3: '333' },
    ]);
    const value = result.form.root.getRawValue(1);
    expect(JSON.parse(JSON.stringify(value))).toEqual([
      { l1: '111' },
      { l1: '222', l3: '333' },
    ]);
  });
  it('部分有效-intersect', async () => {
    const obj = v.intersect([
      v.object({ l1: v.string() }),
      v.object({ l2: v.string() }),
    ]);
    const result = createBuilder(obj);
    result.form.root!.updateValue({ l1: '111' });
    const value = result.form.root.getRawValue(1);
    expect(JSON.parse(JSON.stringify(value))).toEqual({ l1: '111' });
  });
  it('部分有效-intersect1', async () => {
    const obj = v.intersect([
      v.object({ l1: v.string() }),
      v.object({
        o2: v.object({
          l1: v.string(),
          l2: v.string(),
        }),
      }),
    ]);
    const result = createBuilder(obj);
    result.form.root!.updateValue({ o2: { l1: '111' } });
    const value = result.form.root.getRawValue(1);
    expect(JSON.parse(JSON.stringify(value))).toEqual({ o2: { l1: '111' } });
    expect(result.form.root.value).toEqual(undefined);
  });
});

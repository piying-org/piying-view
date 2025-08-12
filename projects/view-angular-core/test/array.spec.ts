import * as v from 'valibot';

import { createBuilder } from './util/create-builder';
import { getField } from './util/action';
import {
  _PiResolvedCommonViewFieldConfig,
  formConfig,
  setComponent,
} from '@piying/view-angular-core';
import { assertFieldArray } from './util/is-field';
// 用于测试fields和model变动时,数值是否正确
describe('array', () => {
  // 将子级提权到父级
  it('数组默认值添加', async () => {
    const field$ = Promise.withResolvers<_PiResolvedCommonViewFieldConfig>();
    const obj = v.object({
      key1: v.pipe(
        v.array(v.pipe(v.optional(v.string(), 'xxx'))),
        getField(field$),
      ),
    });
    const result = createBuilder(obj);
    const field = await field$.promise;
    field.action.set(undefined);
    expect(result.form.control?.value$$()).toEqual({ key1: ['xxx'] });
  });
  it('跳过前面的直接插入(set)', async () => {
    const field$ = Promise.withResolvers<_PiResolvedCommonViewFieldConfig>();
    const obj = v.object({
      key1: v.pipe(v.array(v.string()), getField(field$)),
    });
    const result = createBuilder(obj);
    const resolved = await field$.promise;
    assertFieldArray(resolved.form.control);
    resolved.action.set('11', 1);
    resolved.action.remove(0);
  });
  it('跳过前面的直接插入(updateValue)', async () => {
    const field$ = Promise.withResolvers<_PiResolvedCommonViewFieldConfig>();
    const obj = v.object({
      key1: v.pipe(v.array(v.string()), getField(field$)),
    });
    const result = createBuilder(obj);
    const resolved = await field$.promise;
    assertFieldArray(resolved.form.control);
    resolved.action.set('11', 1);
    resolved.form.control.updateValue([]);
  });
  it('toModel/toView', async () => {
    let index = 0;
    const obj = v.pipe(
      v.array(v.pipe(v.optional(v.string()))),
      formConfig({
        transfomer: {
          toModel(value, control) {
            if (value) {
              expect(value).toEqual(['2']);
              index++;
            }
            return ['3'];
          },
          toView(value, control) {
            if (value) {
              expect(value).toEqual(['1']);
              index++;
            }
            return ['2'];
          },
        },
      }),
    );
    const result = createBuilder(obj);
    result.form.control?.updateValue(['1']);
    expect(result.form.control?.value$$()).toEqual(['3']);
    expect(index).toEqual(2);
  });

  it('数组默认值添加', async () => {
    const obj = v.pipe(
      v.array(v.string()),
      formConfig({ deletionMode: 'mark' }),
    );
    const result = createBuilder(obj);
    result.form.control!.updateValue([0, 'v2']);
    expect(result.form.control!.value).toEqual([undefined, 'v2']);
  });
  it('length', async () => {
    const obj = v.pipe(v.array(v.string()));
    const result = createBuilder(obj);
    result.form.control!.updateValue(['v1', 'v2']);
    assertFieldArray(result.form.control);
    expect(result.form.control.length).toEqual(2);
  });
  it('reset', async () => {
    const obj = v.pipe(v.array(v.string()));
    const result = createBuilder(obj);
    assertFieldArray(result.form.control);
    result.form.control!.updateValue(['v1', 'v2']);
    expect(result.form.control.value).toEqual(['v1', 'v2']);
    result.form.control.reset(['v3', 'v4']);
    expect(result.form.control.value).toEqual(['v3', 'v4']);
  });
  it('clear', async () => {
    const obj = v.pipe(v.array(v.string()));
    const result = createBuilder(obj);
    assertFieldArray(result.form.control);
    result.form.control!.updateValue(['v1', 'v2']);
    expect(result.form.control.value).toEqual(['v1', 'v2']);
    result.form.control.clear();
    expect(result.form.control.controls).toEqual([]);
    expect(result.restChildren!()).toEqual([]);
    result.form.control.clear();
    expect(result.form.control.controls).toEqual([]);
    expect(result.restChildren!()).toEqual([]);
  });
  it('array default value', async () => {
    const field$ = Promise.withResolvers<_PiResolvedCommonViewFieldConfig>();
    const obj = v.pipe(
      v.optional(v.array(v.optional(v.string(), 'default')), ['1', '2']),
      getField(field$),
    );
    const result = createBuilder(obj);
    const resolved = await field$.promise;
    assertFieldArray(resolved.form.control);
    expect(resolved.form.control.value).toEqual(['1', '2']);
    resolved.action.set(undefined, 2);
    expect(resolved.form.control.value).toEqual(['1', '2', 'default']);
  });
  it('array default reset', async () => {
    const obj = v.pipe(
      v.optional(v.array(v.optional(v.string(), 'default')), ['1', '2']),
    );
    const result = createBuilder(obj);
    result.form.root.updateValue(['3', '4']);
    expect(result.form.root.value).toEqual(['3', '4']);
    result.form.root.reset();
    expect(result.form.root.value).toEqual(['1', '2']);
  });

  it('tuple rest', async () => {
    const obj = v.pipe(
      v.tupleWithRest([v.string()], v.number()),
      setComponent('array'),
    );
    const result = createBuilder(obj);
    result.form.control!.updateValue(['v1', 0, 1]);
    assertFieldArray(result.form.control);
    expect(result.fixedChildren?.().length).toEqual(1);
    expect(result.restChildren?.().length).toEqual(2);
    expect(result.form.control.fixedControls$().length).toEqual(1);
    expect(result.form.control.resetControls$().length).toEqual(2);
    expect(result.form.control!.value).toEqual(['v1', 0, 1]);
  });
  it('tuple rest optional', async () => {
    const obj = v.pipe(
      v.optional(v.tupleWithRest([v.string()], v.number()), ['v1', 0, 1]),
      setComponent('array'),
    );
    const result = createBuilder(obj);
    assertFieldArray(result.form.control);
    expect(result.fixedChildren?.().length).toEqual(1);
    expect(result.restChildren?.().length).toEqual(2);
    expect(result.form.control.fixedControls$().length).toEqual(1);
    expect(result.form.control.resetControls$().length).toEqual(2);
    expect(result.form.control!.value).toEqual(['v1', 0, 1]);
  });
  it('tuple loose optional', async () => {
    const obj = v.pipe(
      v.optional(v.looseTuple([v.string()]), ['v1', 0, 1]),
      setComponent('array'),
    );
    const result = createBuilder(obj);
    assertFieldArray(result.form.control);
    expect(result.fixedChildren?.().length).toEqual(1);
    expect(result.restChildren?.().length ?? 0).toEqual(0);
    expect(result.form.control.fixedControls$().length).toEqual(1);
    expect(result.form.control.resetControls$().length).toEqual(0);
    expect(result.form.control!.value).toEqual(['v1', 0, 1]);
  });
  it('tuple loose reset', async () => {
    const obj = v.pipe(
      v.optional(v.looseTuple([v.string()]), ['v1', 0, 1]),
      setComponent('array'),
    );
    const result = createBuilder(obj);
    assertFieldArray(result.form.control);
    result.form.control.updateValue(['v1']);
    expect(result.fixedChildren?.().length).toEqual(1);
    expect(result.restChildren?.().length ?? 0).toEqual(0);
    expect(result.form.control.fixedControls$().length).toEqual(1);
    expect(result.form.control.resetControls$().length).toEqual(0);
    expect(result.form.control!.value).toEqual(['v1']);

    result.form.control.reset();
    expect(result.fixedChildren?.().length).toEqual(1);
    expect(result.restChildren?.().length ?? 0).toEqual(0);
    expect(result.form.control.fixedControls$().length).toEqual(1);
    expect(result.form.control.resetControls$().length).toEqual(0);
    expect(result.form.control!.value).toEqual(['v1', 0, 1]);
  });
  it('tuple loose update', async () => {
    const obj = v.pipe(v.looseTuple([v.string()]), setComponent('array'));
    const result = createBuilder(obj);
    assertFieldArray(result.form.control);
    result.form.control.updateValue(['v1', 0, 1]);
    expect(result.fixedChildren?.().length).toEqual(1);
    expect(result.restChildren?.().length ?? 0).toEqual(0);
    expect(result.form.control.fixedControls$().length).toEqual(1);
    expect(result.form.control.resetControls$().length).toEqual(0);
    expect(result.form.control!.value).toEqual(['v1', 0, 1]);
  });
  it('array default update', async () => {
    const obj = v.pipe(v.optional(v.array(v.number()), [1, 2, 3]));
    const result = createBuilder(obj);
    assertFieldArray(result.form.control);
    expect(result.form.control.value).toEqual([1, 2, 3]);
    result.form.control.updateValue(undefined);
    expect(result.form.control.value).toEqual([1, 2, 3]);
    result.form.control.markAllAsDirty();
    result.form.control.updateValue(undefined);
    expect(result.form.control.value).toEqual(undefined);
  });
});

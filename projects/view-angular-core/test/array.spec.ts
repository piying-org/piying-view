import * as v from 'valibot';

import { createBuilder } from './util/create-builder';
import { getField } from './util/action';
import {
  _PiResolvedCommonViewFieldConfig,
  formConfig,
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
            expect(value).toEqual(['1']);
            index++;
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
});

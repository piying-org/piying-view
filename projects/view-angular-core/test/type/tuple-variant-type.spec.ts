import * as v from 'valibot';

import { setComponent } from '@piying/view-angular-core';
import { FieldArray } from '../../field/field-array';
import { FieldControl } from '../../field/field-control';
import { createBuilder } from '../util/create-builder';

type Assert<T extends true> = T;
type Ctrl<F> = F extends { form: { control?: infer C } }
  ? NonNullable<C>
  : never;
type IsFieldArray<T> = [T] extends [FieldArray<any, any>] ? true : false;
type IsFieldControl<T> = [T] extends [FieldControl<any>] ? true : false;

describe('tuple 变体的控件类型', () => {
  it('v.tuple 顶层: 运行时 FieldArray + 类型 FieldArray', () => {
    const r = createBuilder(
      v.pipe(v.tuple([v.string(), v.number()]), setComponent('array')),
    );
    expect(r.form.control).toBeInstanceOf(FieldArray);
    type _ = Assert<IsFieldArray<Ctrl<typeof r>>>;
  });

  it('v.tupleWithRest 顶层: 运行时 FieldArray + 类型 FieldArray', () => {
    const r = createBuilder(
      v.pipe(v.tupleWithRest([v.string()], v.number()), setComponent('array')),
    );
    expect(r.form.control).toBeInstanceOf(FieldArray);
    type _ = Assert<IsFieldArray<Ctrl<typeof r>>>;
  });

  it('v.looseTuple 顶层: 运行时 FieldArray + 类型 FieldArray', () => {
    const r = createBuilder(
      v.pipe(v.looseTuple([v.string(), v.number()]), setComponent('array')),
    );
    expect(r.form.control).toBeInstanceOf(FieldArray);
    type _ = Assert<IsFieldArray<Ctrl<typeof r>>>;
  });

  it('v.strictTuple 顶层: 运行时 FieldArray + 类型 FieldArray', () => {
    const r = createBuilder(
      v.pipe(v.strictTuple([v.string(), v.number()]), setComponent('array')),
    );
    expect(r.form.control).toBeInstanceOf(FieldArray);
    type _ = Assert<IsFieldArray<Ctrl<typeof r>>>;
  });

  it('v.tuple 下钻子项: 精确 FieldControl', () => {
    const r = createBuilder(
      v.object({ list: v.tuple([v.string(), v.number()]) }),
    );
    const item = r.get(['list', 0])!;
    expect(item.form.control).toBeInstanceOf(FieldControl);
    type _ = Assert<IsFieldControl<Ctrl<typeof item>>>;
  });

  it('v.tupleWithRest 下钻子项: 精确 FieldControl', () => {
    const r = createBuilder(
      v.object({ list: v.tupleWithRest([v.string()], v.number()) }),
    );
    const item = r.get(['list', 0])!;
    expect(item.form.control).toBeInstanceOf(FieldControl);
    type _ = Assert<IsFieldControl<Ctrl<typeof item>>>;
  });

  it('v.looseTuple 下钻子项: 精确 FieldControl', () => {
    const r = createBuilder(
      v.object({ list: v.looseTuple([v.string(), v.number()]) }),
    );
    const item = r.get(['list', 0])!;
    expect(item.form.control).toBeInstanceOf(FieldControl);
    type _ = Assert<IsFieldControl<Ctrl<typeof item>>>;
  });

  it('v.strictTuple 下钻子项: 精确 FieldControl', () => {
    const r = createBuilder(
      v.object({ list: v.strictTuple([v.string(), v.number()]) }),
    );
    const item = r.get(['list', 0])!;
    expect(item.form.control).toBeInstanceOf(FieldControl);
    type _ = Assert<IsFieldControl<Ctrl<typeof item>>>;
  });
});

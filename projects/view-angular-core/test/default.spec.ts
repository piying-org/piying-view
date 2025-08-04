import * as v from 'valibot';

import { getDefaults } from '@piying/valibot-visit';
import { createBuilder } from './util/create-builder';
// 用于测试fields和model变动时,数值是否正确
describe('默认值', () => {
  it('optional', () => {
    const obj = v.object({
      key1: v.optional(v.string(), 'default'),
    });
    const list = createBuilder(obj).fieldGroup!();
    expect(list.length).toBe(1);
    expect(list[0].formConfig().defaultValue).toBe('default');
  });
  it('nullable', () => {
    const obj = v.object({
      key1: v.nullable(v.string(), 'default'),
    });
    const list = createBuilder(obj).fieldGroup!();
    expect(list.length).toBe(1);
    expect(list[0].formConfig().defaultValue).toBe('default');
  });
  it('literal', () => {
    const obj = v.object({
      key1: v.literal('default'),
    });
    const list = createBuilder(obj).fieldGroup!();
    expect(list.length).toBe(1);
    expect(list[0].formConfig().defaultValue).toBe('default');
  });
  it('pipe-optional', () => {
    const obj = v.object({
      key1: v.pipe(v.optional(v.string(), 'default')),
    });
    const list = createBuilder(obj).fieldGroup!();
    expect(list.length).toBe(1);
    expect(list[0].formConfig().defaultValue).toBe('default');
  });
  it('多wrap可选-nonNullish', () => {
    const obj = v.object({
      key1: v.nonNullish(v.nullish(v.string())),
    });
    const list = createBuilder(obj).fieldGroup!();
    expect(list.length).toBe(1);
  });
  it('多wrap可选-nonNullable', () => {
    const obj = v.object({
      key1: v.nonNullable(v.nullable(v.string())),
    });
    const list = createBuilder(obj).fieldGroup!();
    expect(list.length).toBe(1);
  });
  it('多wrap可选-nonOptional', () => {
    const obj = v.object({
      key1: v.nonOptional(v.optional(v.string())),
    });
    const list = createBuilder(obj).fieldGroup!();
    expect(list.length).toBe(1);
  });
  it('多wrap可选-nonNullable去除一个', () => {
    const obj = v.object({
      key1: v.nonNullable(v.nullish(v.string())),
    });
    const list = createBuilder(obj).fieldGroup!();
    expect(list.length).toBe(1);
  });
});
describe('getDefaults', () => {
  it('object', () => {
    const obj = v.object({
      key1: v.optional(v.string(), '1'),
    });
    expect(getDefaults(obj)).toEqual({ key1: '1' });
  });
  it('array', () => {
    const obj = v.object({
      key1: v.optional(v.array(v.string()), ['1']),
    });
    expect(getDefaults(obj)).toEqual({ key1: ['1'] });
  });
  it('intersect', () => {
    const obj = v.object({
      o1: v.intersect([
        v.object({ k1: v.optional(v.string(), '1') }),
        v.object({ k2: v.optional(v.string(), '2') }),
        v.object({ k3: v.string() }),
      ]),
    });
    const b = getDefaults(obj);
    expect(getDefaults(obj)).toEqual({
      o1: {
        k1: '1',
        k2: '2',
      },
    } as any);
  });
  it('union', () => {
    const obj = v.object({
      o1: v.union([
        v.object({ k1: v.optional(v.string(), '1') }),
        v.object({ k2: v.optional(v.string(), '2') }),
        v.object({ k3: v.string() }),
      ]),
    });
    expect(getDefaults(obj)).toEqual({
      o1: {
        k1: '1',
      },
    } as any);
  });
  it('对象可选', () => {
    const obj = v.optional(v.object({ value: v.optional(v.string(), '11') }));
    const b = getDefaults(obj);
    expect(b).toEqual({ value: '11' });
  });
  it('对象递归可选', () => {
    const obj = v.optional(
      v.object({
        o2: v.optional(v.object({ value: v.optional(v.string(), '11') })),
      }),
    );
    const b = getDefaults(obj);
    expect(b).toEqual({ o2: { value: '11' } });
  });
  it('默认值覆盖', () => {
    const obj = v.optional(
      v.object({
        o2: v.optional(v.string(), '111'),
      }),
      { o2: '2222' },
    );
    const b = getDefaults(obj);
    expect(b).toEqual({ o2: '2222' });
  });
  it('外层可选', () => {
    const obj = v.optional(
      v.object({
        o2: v.string(),
      }),
      { o2: '2222' },
    );
    const b = getDefaults(obj);
    expect(b).toEqual({ o2: '2222' });
  });
  it('默认值覆盖', () => {
    const obj = v.optional(
      v.object({
        o2: v.optional(v.object({ o3: v.string() })),
      }),
    );
    const b = getDefaults(obj);
    expect(b).toEqual(undefined);
  });
});

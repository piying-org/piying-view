import * as v from 'valibot';
import {
  actions,
  ConfigAction,
  _PiResolvedCommonViewFieldConfig,
} from '@piying/view-angular-core';
import { createBuilder } from './util/create-builder';
import { getField } from './util/action';

// 通过 wrapper 的默认 actions 触发 CustomDataSymbol 分支(数据源为 wrapper 而非 field 本身)
describe('wrapper 默认 actions 走 CustomDataSymbol 数据源', () => {
  const buildWrapper = (wrapperActions: ConfigAction<any>[]) => {
    const field$ = Promise.withResolvers<_PiResolvedCommonViewFieldConfig>();
    const schema = v.pipe(
      v.string(),
      getField(field$),
      actions.wrappers.set(['w1']),
    );
    createBuilder(schema, {
      wrappers: { w1: { type: 'w1', actions: wrapperActions } },
    });
    return field$.promise;
  };

  it('set / patch 直接写入 wrapper 数据', async () => {
    const field = await buildWrapper([
      actions.inputs.set({ a: 1 }),
      actions.attributes.patch({ b: 2 }),
    ]);
    const wrapper = field.wrappers()[0];
    expect(wrapper.inputs()).toEqual({ a: 1 });
    expect(wrapper.attributes()).toEqual({ b: 2 });
  });

  it('patchAsync 连接异步值', async () => {
    const field = await buildWrapper([
      actions.outputs.patchAsync({ o: () => () => 3 }),
      actions.events.patchAsync({ e: () => () => 4 }),
    ]);
    const wrapper = field.wrappers()[0];
    expect(typeof wrapper.outputs()['o']).toBe('function');
    expect(typeof wrapper.events()['e']).toBe('function');
  });

  it('mapAsync 映射已有值', async () => {
    const field = await buildWrapper([
      actions.slots.set({ s: 'raw' }),
      actions.slots.mapAsync<{ s: string }>(() => (value: { s: string }) => ({
        ...value,
        s: `${value.s}-mapped`,
      })),
    ]);
    const wrapper = field.wrappers()[0];
    expect(wrapper.slots()['s']).toBe('raw-mapped');
  });

  it('remove 移除指定 key', async () => {
    const field = await buildWrapper([
      actions.inputs.set({ a: 1, b: 2 }),
      actions.inputs.remove(['a']),
    ]);
    const wrapper = field.wrappers()[0];
    expect(wrapper.inputs()).toEqual({ b: 2 });
  });

  it('class.component 写入 wrapper 的 class', async () => {
    const field = await buildWrapper([actions.class.component('cls-w')]);
    const wrapper = field.wrappers()[0];
    expect(wrapper.attributes()['class']).toBe('cls-w');
  });

  it('field 自身仍然走非 CustomDataSymbol 分支', async () => {
    const field$ = Promise.withResolvers<_PiResolvedCommonViewFieldConfig>();
    const schema = v.pipe(
      v.string(),
      getField(field$),
      actions.inputs.set({ own: 'x', del: 'y' }),
      actions.attributes.set({ 'data-k': 'v' }),
      actions.outputs.patchAsync({ ownOut: () => () => 9 }),
      actions.slots.set({ s: 'a' }),
      actions.slots.mapAsync<string>(() => (value: { s: string }) => ({
        ...value,
        s: `${value.s}!`,
      })),
      actions.inputs.remove(['del']),
    );
    createBuilder(schema);
    const field = await field$.promise;
    expect(field.inputs()).toEqual({ own: 'x' });
    expect(field.attributes()['data-k']).toBe('v');
    expect(typeof field.outputs()['ownOut']).toBe('function');
    expect(field.slots()['s']).toBe('a!');
  });
});

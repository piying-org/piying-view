import { typedComponent } from '../util';
import { markRaw } from 'vue';
import InputsTest from './component/inputs-test.vue';
import { describe, expect, it } from 'vitest';
import { setComponent } from '@piying/view-core';

describe('强类型化', () => {
  it('存在', async () => {
    const typeDefine = typedComponent({
      types: {
        string: { type: markRaw(InputsTest) },
      },
    });
    const result = typeDefine.setComponent('string', (actions) => [
      actions.inputs.patch({ value1: '1' }),
      actions.inputs.patch({ value1: '1', value2: 2 }),
      actions.inputs.set({ value1: '1' }),
      actions.inputs.set({ value1: '1', value2: 2 }),
      actions.inputs.remove(['value1', 'value2']),
      actions.inputs.remove(['value2']),
      actions.inputs.patchAsync({
        value1: () => '1',
      }),
      actions.inputs.patchAsync({
        value1: async () => '1',
      }),
      actions.inputs.patchAsync({
        value2: async () => 2,
      }),
    ]);
    expect(result.type).eq('metadataList');
    expect(result.value.length).eq(10);
  });
  it('action中', async () => {
    const typeDefine = typedComponent({
      types: {
        string: { actions: [setComponent(markRaw(InputsTest))] },
      },
    });
    const result = typeDefine.setComponent('string', (actions) => [
      actions.inputs.patch({ value1: '1' }),
      actions.inputs.patch({ value1: '1', value2: 2 }),
      actions.inputs.set({ value1: '1' }),
      actions.inputs.set({ value1: '1', value2: 2 }),
      actions.inputs.remove(['value1', 'value2']),
      actions.inputs.remove(['value2']),
      actions.inputs.patchAsync({
        value1: () => '1',
      }),
      actions.inputs.patchAsync({
        value1: async () => '1',
      }),
      actions.inputs.patchAsync({
        value2: async () => 2,
      }),
    ]);
    expect(result.type).eq('metadataList');
    expect(result.value.length).eq(10);
  });
  it('直接传入', async () => {
    const typeDefine = typedComponent({});
    const result = typeDefine.setComponent(markRaw(InputsTest), (actions) => [
      actions.inputs.patch({ value1: '1' }),
      actions.inputs.patch({ value1: '1', value2: 2 }),
      actions.inputs.set({ value1: '1' }),
      actions.inputs.set({ value1: '1', value2: 2 }),
      actions.inputs.remove(['value1', 'value2']),
      actions.inputs.remove(['value2']),
      actions.inputs.patchAsync({
        value1: () => '1',
      }),
      actions.inputs.patchAsync({
        value1: async () => '1',
      }),
      actions.inputs.patchAsync({
        value2: async () => 2,
      }),
    ]);
    expect(result.type).eq('metadataList');
    expect(result.value.length).eq(10);
  });
});

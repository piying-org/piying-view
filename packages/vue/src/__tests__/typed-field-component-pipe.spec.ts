import { describe, it, expect } from 'vitest';
import { markRaw, nextTick, shallowRef } from 'vue';
import * as v from 'valibot';
import { NFCSchema, lazyMark } from '@piying/view-core';
import { typedComponent } from '../util/typed-component';
import { typedFieldComponentPipe } from '../util/typed-field-component-pipe';
import type {
  GetComponentEmits,
  GetComponentInputs,
  ResolveLazyComponent,
} from '../util/component-types';
import { createComponent } from './util/create-component';
import { delay } from './util/delay';
import TypedEmit from './component/typed-emit.vue';
import TypedModel from './component/typed-model.vue';
import InputsTest from './component/inputs-test.vue';

type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;

const numOnly = v.object({ num: v.number() });
const nfcOnly = v.object({ e: NFCSchema });

const baseDefine = typedComponent({
  types: {
    emit: { type: markRaw(TypedEmit) },
    inputs: { type: markRaw(InputsTest) },
  },
});

const lazyEmit = () => import('./component/typed-emit.vue').then((m) => m.default);
const lazyDefine = typedComponent({
  types: {
    emit: { type: lazyEmit },
  },
});
const markedEmit = lazyMark(lazyEmit);

describe('typedFieldComponentPipe - inputs 强类型', () => {
  it('key 与值类型都收在组件真实 props 上', () => {
    const ok = typedFieldComponentPipe(numOnly, baseDefine, (d) => [
      d(['num'], 'inputs', [
        d.inputs.patch({ value1: '1' }),
        d.inputs.set({ value1: '1', value2: 2 }),
        d.inputs.patchAsync({ value1: () => '1' }),
        d.inputs.patchAsync({ value2: async () => 2 }),
        d.inputs.remove(['value1', 'value2']),
        d.inputs.mapAsync(() => (value) => ({ ...value, value1: 'mapped' })),
      ]),
    ]);

    const badKey = typedFieldComponentPipe(numOnly, baseDefine, (d) => [
      d(['num'], 'inputs', [
        // @ts-expect-error inputs-test 没有 value3
        d.inputs.patch({ value3: 'x' }),
      ]),
    ]);

    const badValue = typedFieldComponentPipe(numOnly, baseDefine, (d) => [
      d(['num'], 'inputs', [
        // @ts-expect-error value1 是 string
        d.inputs.patch({ value1: 1 }),
      ]),
    ]);

    const badRemove = typedFieldComponentPipe(numOnly, baseDefine, (d) => [
      d(['num'], 'inputs', [
        // @ts-expect-error remove 的 key 同样受限
        d.inputs.remove(['value3']),
      ]),
    ]);

    expect(ok && badKey && badValue && badRemove).toBeTruthy();
  });

  it('组件没有 props 时 key 被封死', () => {
    const ok = typedFieldComponentPipe(numOnly, baseDefine, (d) => [
      d(['num'], 'emit', [d.inputs.patch({})]),
    ]);
    const bad = typedFieldComponentPipe(numOnly, baseDefine, (d) => [
      d(['num'], 'emit', [
        // @ts-expect-error typed-emit 只有 name / count
        d.inputs.patch({ nope: 1 }),
      ]),
    ]);

    expect(ok && bad).toBeTruthy();
  });

  it('类型: props 与 emits 的拆分符合预期', () => {
    const inputs: Equal<keyof GetComponentInputs<typeof TypedEmit>, 'name' | 'count'> = true;
    const emits: Equal<keyof GetComponentEmits<typeof TypedEmit>, 'change' | 'submit'> = true;

    expect([inputs, emits]).toEqual([true, true]);
  });

  it('类型: defineModel 归入 inputs, update:xxx 归入 emits', () => {
    const inputs: Equal<keyof GetComponentInputs<typeof TypedModel>, 'modelValue' | 'title'> = true;
    const emits: Equal<
      keyof GetComponentEmits<typeof TypedModel>,
      'update:modelValue' | 'update:title'
    > = true;

    expect([inputs, emits]).toEqual([true, true]);
  });
});

describe('typedFieldComponentPipe - outputs 强类型', () => {
  it('key 收在组件真实 emit 名上', () => {
    const ok = typedFieldComponentPipe(numOnly, baseDefine, (d) => [
      d(['num'], 'emit', [
        d.outputs.patch({ change: (_value: number) => {} }),
        d.outputs.merge({ submit: () => {} }),
        d.outputs.mergeAsync({ change: () => (_value: number) => {} }),
        d.outputs.remove(['change', 'submit']),
      ]),
    ]);

    const badKey = typedFieldComponentPipe(numOnly, baseDefine, (d) => [
      d(['num'], 'emit', [
        // @ts-expect-error typed-emit 没有 nope
        d.outputs.patch({ nope: () => {} }),
      ]),
    ]);

    const badMerge = typedFieldComponentPipe(numOnly, baseDefine, (d) => [
      d(['num'], 'emit', [
        // @ts-expect-error typed-emit 没有 nope
        d.outputs.merge({ nope: () => {} }),
      ]),
    ]);

    expect(ok && badKey && badMerge).toBeTruthy();
  });

  it('outputChange 的监听项锁定本条 entry 组件的 emit 名', () => {
    const ok = typedFieldComponentPipe(numOnly, baseDefine, (d) => [
      d(['num'], 'emit', [
        d.outputChange((fn) => {
          fn([{ list: undefined, output: 'change' }]);
        }),
      ]),
    ]);

    const bad = typedFieldComponentPipe(numOnly, baseDefine, (d) => [
      d(['num'], 'emit', [
        d.outputChange((fn) => {
          // @ts-expect-error typed-emit 没有 nope
          fn([{ list: undefined, output: 'nope' }]);
        }),
      ]),
    ]);

    expect(ok && bad).toBeTruthy();
  });

  it('Vue 版不暴露 models: 没有双向绑定通道', () => {
    const bad = typedFieldComponentPipe(numOnly, baseDefine, (d) => [
      d(['num'], 'emit', [
        // @ts-expect-error Vue 运行时不消费 field.models
        d.models.patch({}),
      ]),
    ]);

    expect(bad).toBeTruthy();
  });
});

describe('typedFieldComponentPipe - events / wrappers', () => {
  it('events 收在标准 DOM 事件名上, 自定义名放行', () => {
    const ok = typedFieldComponentPipe(numOnly, baseDefine, (d) => [
      d(['num'], 'emit', [
        d.events.patch({
          click: (event) => {
            const pointer: PointerEvent = event;
            expect(pointer).toBeTruthy();
          },
        }),
        d.events.patch({ 'my-custom': () => {} }),
      ]),
    ]);

    expect(ok).toBeTruthy();
  });

  it('wrappers 的名字收在配置声明的 key 上', () => {
    const define = typedComponent({
      wrappers: {
        block: { type: markRaw(InputsTest) },
      },
    });

    const ok = typedFieldComponentPipe(numOnly, define, (d) => [
      d(['num'], 'inputs', [d.wrappers.patch(['block'])]),
    ]);

    const bad = typedFieldComponentPipe(numOnly, define, (d) => [
      d(['num'], 'inputs', [
        // @ts-expect-error 配置里没有 nope wrapper
        d.wrappers.patch(['nope']),
      ]),
    ]);

    expect(ok && bad).toBeTruthy();
  });
});

describe('typedFieldComponentPipe - 运行时', () => {
  it('inputs.patch 真的下发到组件', async () => {
    const merged = typedFieldComponentPipe(nfcOnly, baseDefine, (d) => [
      d(['e'], 'emit', [d.inputs.patch({ name: 'hello', count: 3 })]),
    ]);

    const { instance } = await createComponent(merged, shallowRef(undefined), {
      defaultConfig: { types: { emit: { type: TypedEmit } } },
    });

    expect(instance.find('.name').element.textContent).toBe('hello');
    expect(instance.find('.count').element.textContent).toBe('3');
  });

  it('outputs.patch 的回调在组件 emit 时被调用', async () => {
    const calls: number[] = [];
    const merged = typedFieldComponentPipe(nfcOnly, baseDefine, (d) => [
      d(['e'], 'emit', [
        d.outputs.patch({
          change: (value: number) => {
            calls.push(value);
          },
        }),
      ]),
    ]);

    const { instance } = await createComponent(merged, shallowRef(undefined), {
      defaultConfig: { types: { emit: { type: TypedEmit } } },
    });

    await instance.find('.btn-change').trigger('click');
    expect(calls).toEqual([42]);
  });

  it('outputChange 监听自身 emit 并拿到参数', async () => {
    let received: unknown = 'init';
    const merged = typedFieldComponentPipe(nfcOnly, baseDefine, (d) => [
      d(['e'], 'emit', [
        d.outputChange((fn) => {
          fn([{ list: undefined, output: 'change' }]).subscribe((stream) => {
            received = stream.list;
          });
        }),
      ]),
    ]);

    const { instance } = await createComponent(merged, shallowRef(undefined), {
      defaultConfig: { types: { emit: { type: TypedEmit } } },
    });

    expect(received).toBe('init');
    await instance.find('.btn-change').trigger('click');
    await nextTick();
    expect(received).toEqual([[42]]);
  });

  it('每条 entry 都自动下发 setComponent', async () => {
    const merged = typedFieldComponentPipe(nfcOnly, baseDefine, (d) => [
      d(['e'], 'inputs', [d.inputs.patch({ value1: 'auto-component' })]),
    ]);

    const { instance } = await createComponent(merged, shallowRef(undefined), {
      defaultConfig: { types: { inputs: { type: InputsTest } } },
    });

    expect(instance.find('.inputs-test').element.textContent).toBe('auto-component');
  });
});

describe('typedFieldComponentPipe - 懒加载组件', () => {
  it('类型: 懒加载解出的组件与直接导入等价', () => {
    const resolved: Equal<ResolveLazyComponent<typeof lazyEmit>, typeof TypedEmit> = true;
    const emits: Equal<
      keyof GetComponentEmits<ResolveLazyComponent<typeof lazyEmit>>,
      keyof GetComponentEmits<typeof TypedEmit>
    > = true;

    expect([resolved, emits]).toEqual([true, true]);
  });

  it('类型: lazyMark 包装的懒加载同样能解开', () => {
    const resolved: Equal<ResolveLazyComponent<typeof markedEmit>, typeof TypedEmit> = true;

    expect(resolved).toBe(true);
  });

  it('类型 + 运行时: lazyMark 配置下依旧收窄并渲染', async () => {
    const markedDefine = typedComponent({
      types: { emit: { type: markedEmit } },
    });

    const bad = typedFieldComponentPipe(numOnly, markedDefine, (d) => [
      d(['num'], 'emit', [
        // @ts-expect-error typed-emit 没有 nope
        d.inputs.patch({ nope: 1 }),
      ]),
    ]);

    const merged = typedFieldComponentPipe(nfcOnly, markedDefine, (d) => [
      d(['e'], 'emit', [d.inputs.patch({ name: 'marked-name' })]),
    ]);
    const { instance } = await createComponent(merged, shallowRef(undefined), {
      defaultConfig: { types: { emit: { type: markedEmit } } },
    });
    await nextTick();
    await delay(50);

    expect(bad).toBeTruthy();
    expect(instance.find('.name').element.textContent).toBe('marked-name');
  });

  it('类型: 懒加载配置下 inputs / outputs 依旧收窄', () => {
    const ok = typedFieldComponentPipe(numOnly, lazyDefine, (d) => [
      d(['num'], 'emit', [
        d.inputs.patch({ name: 'lazy' }),
        d.outputs.patch({ change: (_value: number) => {} }),
      ]),
    ]);

    const bad = typedFieldComponentPipe(numOnly, lazyDefine, (d) => [
      d(['num'], 'emit', [
        // @ts-expect-error typed-emit 没有 nope
        d.inputs.patch({ nope: 1 }),
      ]),
    ]);

    expect(ok && bad).toBeTruthy();
  });

  it('运行时: 懒加载组件渲染并下发 input', async () => {
    const merged = typedFieldComponentPipe(nfcOnly, lazyDefine, (d) => [
      d(['e'], 'emit', [d.inputs.patch({ name: 'lazy-name' })]),
    ]);

    const { instance } = await createComponent(merged, shallowRef(undefined), {
      defaultConfig: { types: { emit: { type: lazyEmit } } },
    });
    await nextTick();
    await delay(50);

    expect(instance.find('.name').element.textContent).toBe('lazy-name');
  });
});

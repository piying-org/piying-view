import { signal } from '@angular/core';
import * as v from 'valibot';
import { NFCSchema } from '@piying/view-angular-core';
import {
  typedComponent,
  type ResolveLazyComponent,
  type GetComponentInputsOrigin,
  type GetComponentOutputsOrigin,
} from '../lib/util/typed-component';
import { typedFieldComponentPipe } from '../lib/util/typed-field-component-pipe';
import { Test1Component } from './test1/test1.component';
import { Models1Component } from './models1/component';
import { createSchemaComponent } from './util/create-component';

type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false;

const numOnly = v.object({ num: v.number() });
const nfcOnly = v.object({ e: NFCSchema });

const lazyTest1 = {
  type: () => import('./test1/test1.component').then((a) => a.Test1Component),
};
const lazyModels1 = {
  type: () => import('./models1/component').then((a) => a.Models1Component),
};

const lazyDefine = typedComponent({
  types: {
    test1: lazyTest1,
    models1: lazyModels1,
  },
});

describe('懒加载组件 - 类型解析', () => {
  it('ResolveLazyComponent 解开 `() => Promise<组件类型>` 拿到组件类', () => {
    const byTest1: Equal<
      ResolveLazyComponent<typeof lazyTest1.type>,
      typeof Test1Component
    > = true;
    const byModels1: Equal<
      ResolveLazyComponent<typeof lazyModels1.type>,
      typeof Models1Component
    > = true;
    // 非懒加载形态返回 never
    const notLazy: Equal<
      ResolveLazyComponent<typeof Test1Component>,
      never
    > = true;

    expect([byTest1, byModels1, notLazy]).toEqual([true, true, true]);
  });

  it('懒加载解析出的 input/output 类型与直接导入完全等价', () => {
    const inputs: Equal<
      GetComponentInputsOrigin<ResolveLazyComponent<typeof lazyTest1.type>>,
      GetComponentInputsOrigin<typeof Test1Component>
    > = true;
    const outputs: Equal<
      GetComponentOutputsOrigin<ResolveLazyComponent<typeof lazyTest1.type>>,
      GetComponentOutputsOrigin<typeof Test1Component>
    > = true;

    expect([inputs, outputs]).toEqual([true, true]);
  });
});

describe('懒加载组件 - inputs 强类型', () => {
  it('类型: key 收在组件真实 input 上, 拼错照样报错', () => {
    const ok = typedFieldComponentPipe(numOnly, lazyDefine, (d) => [
      d(['num'], 'test1', [
        d.inputs.patch({ input1: 'ok' }),
        d.inputs.patch({ transformed: 1 }),
      ]),
      d(['num'], 'test1', [d.inputs.patchAsync({ input1: () => 'async-ok' })]),
      d(['num'], 'test1', [d.inputs.remove(['input1'])]),
    ]);

    const bad = typedFieldComponentPipe(numOnly, lazyDefine, (d) => [
      d(['num'], 'test1', [
        // @ts-expect-error test1 没有 input3
        d.inputs.patch({ input3: 'x' }),
      ]),
    ]);

    const badAsync = typedFieldComponentPipe(numOnly, lazyDefine, (d) => [
      d(['num'], 'test1', [
        // @ts-expect-error test1 没有 input3
        d.inputs.patchAsync({ input3: () => 'x' }),
      ]),
    ]);

    const badRemove = typedFieldComponentPipe(numOnly, lazyDefine, (d) => [
      d(['num'], 'test1', [
        // @ts-expect-error remove 的 key 同样受限
        d.inputs.remove(['input3']),
      ]),
    ]);

    expect(ok && bad && badAsync && badRemove).toBeTruthy();
  });

  it('类型: 值类型也锁死(input1 是 string, 塞 number 报错)', () => {
    const bad = typedFieldComponentPipe(numOnly, lazyDefine, (d) => [
      d(['num'], 'test1', [
        // @ts-expect-error input1 是 string
        d.inputs.patch({ input1: 1 }),
      ]),
    ]);

    expect(bad).toBeTruthy();
  });

  it('运行时: 懒加载配置下 patch 真的下发到组件', async () => {
    const merged = typedFieldComponentPipe(numOnly, lazyDefine, (d) => [
      d(['num'], 'test1', [d.inputs.patch({ input1: 'lazy-input' })]),
    ]);

    const { fixture, element } = await createSchemaComponent(
      signal(merged),
      signal({ num: 5 }),
      lazyDefine.define,
    );
    await fixture.whenStable();
    fixture.detectChanges();

    expect(element.querySelector('app-test1')).toBeTruthy();
    expect(
      (element.querySelector('.test1-div-input1') as HTMLElement).innerHTML,
    ).toBe('lazy-input');
  });
});

describe('懒加载组件 - outputs / outputChange 强类型', () => {
  it('类型: outputs 的 key 收在组件真实 output 上', () => {
    const ok = typedFieldComponentPipe(nfcOnly, lazyDefine, (d) => [
      d(['e'], 'test1', [
        d.outputs.patch({ output1: (input: string) => {} }),
        d.outputs.merge({ output1: (input: string) => {} }),
        d.outputs.mergeAsync({
          output1: () => (input: string) => {},
        }),
      ]),
      d(['e'], 'test1', [d.outputs.remove(['output3'])]),
    ]);

    const bad = typedFieldComponentPipe(nfcOnly, lazyDefine, (d) => [
      d(['e'], 'test1', [
        // @ts-expect-error test1 没有 output4
        d.outputs.patch({ output4: () => {} }),
      ]),
    ]);

    const badMerge = typedFieldComponentPipe(nfcOnly, lazyDefine, (d) => [
      d(['e'], 'test1', [
        // @ts-expect-error test1 没有 output4
        d.outputs.merge({ output4: () => {} }),
      ]),
    ]);

    expect(ok && bad && badMerge).toBeTruthy();
  });

  it('类型: outputChange 的监听项锁定本条 entry 组件的 output 名', () => {
    const ok = typedFieldComponentPipe(nfcOnly, lazyDefine, (d) => [
      d(['e'], 'test1', [
        d.outputChange((fn) => {
          fn([{ list: undefined, output: 'output1' }]);
        }),
      ]),
    ]);

    const bad = typedFieldComponentPipe(nfcOnly, lazyDefine, (d) => [
      d(['e'], 'test1', [
        d.outputChange((fn) => {
          // @ts-expect-error test1 没有 output4
          fn([{ list: undefined, output: 'output4' }]);
        }),
      ]),
    ]);

    expect(ok && bad).toBeTruthy();
  });
});

describe('懒加载组件 - models 强类型', () => {
  it('类型: key 收在可两向绑定的名字上', () => {
    const ok = typedFieldComponentPipe(nfcOnly, lazyDefine, (d) => [
      d(['e'], 'models1', [
        d.models.patch({ input1: signal(0), input2: signal(0) }),
      ]),
      d(['e'], 'models1', [d.models.remove(['input1', 'input2'])]),
    ]);

    const badKey = typedFieldComponentPipe(nfcOnly, lazyDefine, (d) => [
      d(['e'], 'models1', [
        // @ts-expect-error models1 没有 nope
        d.models.patch({ nope: signal(0) }),
      ]),
    ]);

    const badValue = typedFieldComponentPipe(nfcOnly, lazyDefine, (d) => [
      d(['e'], 'models1', [
        // @ts-expect-error input1 是 number
        d.models.patch({ input1: signal('str') }),
      ]),
    ]);

    expect(ok && badKey && badValue).toBeTruthy();
  });

  it('运行时: 懒加载配置下两向绑定生效', async () => {
    const a = signal(0);
    const merged = typedFieldComponentPipe(nfcOnly, lazyDefine, (d) => [
      d(['e'], 'models1', [d.models.patch({ input1: a })]),
    ]);

    const { fixture, element } = await createSchemaComponent(
      signal(merged),
      signal(undefined),
      lazyDefine.define,
    );
    await fixture.whenStable();
    fixture.detectChanges();

    (element.querySelector('.btn1') as HTMLElement).click();
    expect(a()).toBe(1);
  });
});

describe('懒加载组件 - 直接传懒加载函数作为组件标识', () => {
  it('类型: 直接传 fn 同样收窄', () => {
    const ok = typedFieldComponentPipe(numOnly, lazyDefine, (d) => [
      d(['num'], lazyTest1.type, [d.inputs.patch({ input1: 'direct' })]),
    ]);
    const okModel = typedFieldComponentPipe(nfcOnly, lazyDefine, (d) => [
      d(['e'], lazyModels1.type, [d.models.patch({ input2: signal(0) })]),
    ]);

    const bad = typedFieldComponentPipe(numOnly, lazyDefine, (d) => [
      d(['num'], lazyTest1.type, [
        // @ts-expect-error test1 没有 input3
        d.inputs.patch({ input3: 'x' }),
      ]),
    ]);

    expect(ok && okModel && bad).toBeTruthy();
  });

  it('运行时: 直接传懒加载函数也能渲染并下发 input', async () => {
    const merged = typedFieldComponentPipe(numOnly, lazyDefine, (d) => [
      d(['num'], lazyTest1.type, [d.inputs.patch({ input1: 'direct-lazy' })]),
    ]);

    const { fixture, element } = await createSchemaComponent(
      signal(merged),
      signal({ num: 5 }),
      lazyDefine.define,
    );
    await fixture.whenStable();
    fixture.detectChanges();

    expect(element.querySelector('app-test1')).toBeTruthy();
    expect(
      (element.querySelector('.test1-div-input1') as HTMLElement).innerHTML,
    ).toBe('direct-lazy');
  });
});

import { isSignal, signal } from '@angular/core';
import * as v from 'valibot';
import { NFCSchema } from '@piying/view-angular-core';
import { typedComponent } from '../lib/util/typed-component';
import { typedFieldComponentPipe } from '../lib/util/typed-field-component-pipe';
import { Test1Component } from './test1/test1.component';
import { Emit1Component } from './emit-1/component';
import { createSchemaComponent } from './util/create-component';

const numOnly = v.object({ num: v.number() });

/** Emit1Component 不是控件, 得用无 control 的 schema 挂, 否则缺 NG_VALUE_ACCESSOR */
const nfcOnly = v.object({ e: NFCSchema });

const typeDefine = typedComponent({
  types: {
    test1: { type: Test1Component },
    emit1: { type: Emit1Component },
  },
});

/** 零 input / 零 output 的组件 */
class EmptyComponent {}
const emptyDefine = typedComponent({
  types: { empty: { type: EmptyComponent } },
});

describe('强类型改造 - mapAsync (#2)', () => {
  it('回调拿到的是解析后的普通值对象, 不是 InputSignal 引用', async () => {
    let received: any = null;
    let sawSignal = true;

    const merged = typedFieldComponentPipe(numOnly, typeDefine, (d) => [
      d(['num'], 'test1', [
        d.inputs.patch({ input1: 'abc' }),
        d.inputs.mapAsync((field) => (value) => {
          expect(field.fullPath.join('.')).toBe('num');
          received = value;
          sawSignal = isSignal(value);
          return { ...value, input1: (value.input1 ?? '') + '-mapped' };
        }),
      ]),
    ]);

    const { fixture, element } = await createSchemaComponent(
      signal(merged),
      signal({ num: 5 }),
      typeDefine.define,
    );
    await fixture.whenStable();
    fixture.detectChanges();

    expect(sawSignal).toBe(false);
    expect(received).toBeTruthy();
    expect(received.input1).toBe('abc');

    const input1 = element.querySelector('.test1-div-input1') as HTMLElement;
    expect(input1.innerHTML).toEqual('abc-mapped');
  });

  it('mapAsync 返回形态不受约束, 可以整体换掉值对象', async () => {
    const merged = typedFieldComponentPipe(numOnly, typeDefine, (d) => [
      d(['num'], 'test1', [
        d.inputs.patch({ input1: 'origin' }),
        d.inputs.mapAsync((field) => () => {
          expect(field.fullPath.join('.')).toBe('num');
          return { input1: 'replaced' };
        }),
      ]),
    ]);

    const { fixture, element } = await createSchemaComponent(
      signal(merged),
      signal({ num: 5 }),
      typeDefine.define,
    );
    await fixture.whenStable();
    fixture.detectChanges();

    const input1 = element.querySelector('.test1-div-input1') as HTMLElement;
    expect(input1.innerHTML).toEqual('replaced');
  });

  it('类型: 返回一个与输入完全无关的形状也放行(旧签名会拒)', () => {
    // 纯编译期断言: 旧签名 `(value: InputsOf<C>) => InputsOf<C>` 会直接报错
    typedFieldComponentPipe(numOnly, typeDefine, (d) => [
      d(['num'], 'test1', [
        d.inputs.mapAsync(() => () => ({ totallyDifferent: 123 })),
      ]),
    ]);

    typedFieldComponentPipe(nfcOnly, typeDefine, (d) => [
      d(['e'], 'emit1', [
        d.outputs.mapAsync(() => () => ({ unrelated: true })),
      ]),
    ]);

    expect(true).toBe(true);
  });

  it('outputs.mapAsync 同样拿到解析后的值, 返回不约束', async () => {
    let received: any = null;
    let sawSignal = true;

    const merged = typedFieldComponentPipe(nfcOnly, typeDefine, (d) => [
      d(['e'], 'emit1', [
        d.outputs.mapAsync((field) => (value) => {
          expect(field.fullPath.join('.')).toBe('e');
          received = value;
          sawSignal = isSignal(value);
          return value;
        }),
      ]),
    ]);

    const { fixture } = await createSchemaComponent(
      signal(merged),
      signal({ num: 5 }),
      typeDefine.define,
    );
    await fixture.whenStable();
    fixture.detectChanges();

    expect(sawSignal).toBe(false);
    expect(received).toBeTruthy();
  });
});

describe('强类型改造 - outputs.merge / mergeAsync (#12)', () => {
  it('merge 的回调在组件 emit 时被调用', async () => {
    const captured: string[] = [];
    const merged = typedFieldComponentPipe(nfcOnly, typeDefine, (d) => [
      d(['e'], 'emit1', [
        d.outputs.merge({
          output1: (input: string) => {
            captured.push(input);
          },
        }),
      ]),
    ]);

    const { fixture, element } = await createSchemaComponent(
      signal(merged),
      signal({ num: 5 }),
      typeDefine.define,
    );
    await fixture.whenStable();
    fixture.detectChanges();

    (element.querySelector('.emit1-output1') as HTMLElement).click();
    expect(captured).toEqual(['emit1-output1-data']);
  });

  it('mergeAsync 的回调拿到 field 并在 emit 时被调用', async () => {
    const captured: string[] = [];
    let fieldOk = false;
    const merged = typedFieldComponentPipe(nfcOnly, typeDefine, (d) => [
      d(['e'], 'emit1', [
        d.outputs.mergeAsync({
          output1: (field) => (input: string) => {
            fieldOk = field.fullPath.join('.') === 'e';
            captured.push(input);
          },
        }),
      ]),
    ]);

    const { fixture, element } = await createSchemaComponent(
      signal(merged),
      signal({ num: 5 }),
      typeDefine.define,
    );
    await fixture.whenStable();
    fixture.detectChanges();

    (element.querySelector('.emit1-output1') as HTMLElement).click();
    expect(fieldOk).toBe(true);
    expect(captured).toEqual(['emit1-output1-data']);
  });

  it('类型: merge / mergeAsync 的 key 必须是组件真实存在的 output', async () => {
    const captured: string[] = [];
    const valid = typedFieldComponentPipe(nfcOnly, typeDefine, (d) => [
      d(['e'], 'emit1', [
        d.outputs.merge({
          output1: (input: string) => captured.push('merge:' + input),
        }),
      ]),
      d(['e'], 'emit1', [
        d.outputs.mergeAsync({
          output2: () => (input: string) => captured.push('mergeAsync:' + input),
        }),
      ]),
    ]);

    const badMerge = typedFieldComponentPipe(nfcOnly, typeDefine, (d) => [
      d(['e'], 'emit1', [
        // @ts-expect-error emit1 没有 output3
        d.outputs.merge({ output3: () => {} }),
      ]),
    ]);

    const badMergeAsync = typedFieldComponentPipe(nfcOnly, typeDefine, (d) => [
      d(['e'], 'emit1', [
        // @ts-expect-error emit1 没有 output3
        d.outputs.mergeAsync({ output3: () => () => {} }),
      ]),
    ]);

    // 运行时: 合法 key 的 handler 真的接上了, 且收到组件 emit 的原值
    const { fixture, element } = await createSchemaComponent(
      signal(valid),
      signal({ num: 5 }),
      typeDefine.define,
    );
    await fixture.whenStable();
    fixture.detectChanges();
    (element.querySelector('.emit1-output1') as HTMLElement).click();
    (element.querySelector('.emit1-output2') as HTMLElement).click();
    expect(captured).toEqual([
      'merge:emit1-output1-data',
      'mergeAsync:emit1-output2-data',
    ]);

    // 非法 key 只在编译期有意义(编译不过就是失败), 运行时不会凭空多出 output3
    expect(badMerge).toBeTruthy();
    expect(badMergeAsync).toBeTruthy();
  });
});

describe('强类型改造 - 零 input / 零 output 组件 (#10)', () => {
  // EmptyComponent 不是真组件, 渲染不了, 这两条只能靠编译期断言
  it('类型: 空对象合法', () => {
    const merged = typedFieldComponentPipe(numOnly, emptyDefine, (d) => [
      d(['num'], 'empty', [d.inputs.patch({})]),
      d(['num'], 'empty', [d.outputs.patch({})]),
      d(['num'], 'empty', [d.inputs.remove([])]),
    ]);

    expect(merged).toBeTruthy();
  });

  it('类型: 写了不存在的 key 直接报错(旧实现会静默放行)', () => {
    const patchFail = typedFieldComponentPipe(numOnly, emptyDefine, (d) => [
      d(['num'], 'empty', [
        // @ts-expect-error 组件没有任何 input
        d.inputs.patch({ shouldFail: 1 }),
      ]),
    ]);

    const patchAsyncFail = typedFieldComponentPipe(numOnly, emptyDefine, (d) => [
      d(['num'], 'empty', [
        // @ts-expect-error 组件没有任何 input
        d.inputs.patchAsync({ shouldFail: () => 1 }),
      ]),
    ]);

    const outPatchFail = typedFieldComponentPipe(numOnly, emptyDefine, (d) => [
      d(['num'], 'empty', [
        // @ts-expect-error 组件没有任何 output
        d.outputs.patch({ shouldFail: () => {} }),
      ]),
    ]);

    const mergeFail = typedFieldComponentPipe(numOnly, emptyDefine, (d) => [
      d(['num'], 'empty', [
        // @ts-expect-error 组件没有任何 output
        d.outputs.merge({ shouldFail: () => {} }),
      ]),
    ]);

    const mergeAsyncFail = typedFieldComponentPipe(numOnly, emptyDefine, (d) => [
      d(['num'], 'empty', [
        // @ts-expect-error 组件没有任何 output
        d.outputs.mergeAsync({ shouldFail: () => () => {} }),
      ]),
    ]);

    expect(
      [
        patchFail,
        patchAsyncFail,
        outPatchFail,
        mergeFail,
        mergeAsyncFail,
      ].every(Boolean),
    ).toBe(true);
  });

  it('类型: 有 input 的组件仍然正常收窄到具体 key', async () => {
    const narrowed = typedFieldComponentPipe(numOnly, typeDefine, (d) => [
      d(['num'], 'test1', [d.inputs.patch({ input1: 'ok' })]),
    ]);

    const badPatch = typedFieldComponentPipe(numOnly, typeDefine, (d) => [
      d(['num'], 'test1', [
        // @ts-expect-error test1 没有 input3
        d.inputs.patch({ input3: 'x' }),
      ]),
    ]);

    // 运行时: 收窄到 input1 的 patch 真的下发到了组件
    const { fixture, element } = await createSchemaComponent(
      signal(narrowed),
      signal({ num: 5 }),
      typeDefine.define,
    );
    await fixture.whenStable();
    fixture.detectChanges();
    expect(
      (element.querySelector('.test1-div-input1') as HTMLElement).innerHTML,
    ).toBe('ok');
    // 非法 key 由编译期保证, 运行时不报意外
    expect(badPatch).toBeTruthy();
  });
});

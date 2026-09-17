import { describe, it, expect } from 'vitest';
import { lazy } from 'solid-js';
import { fireEvent } from '@testing-library/dom';
import { of, map } from 'rxjs';
import * as v from 'valibot';
import { NFCSchema, lazyMark, type PiFieldAtPath } from '@piying/view-core';
import { typedFieldComponentPipe } from '../src/util/typed-field-component-pipe';
import type {
  GetComponentEmits,
  GetComponentInputs,
  ResolveLazyComponent,
  SolidAttributeName,
  SolidStandardAttrName,
} from '../src/util/component-types';
import { createComponent } from './util/create-component';
import { delay } from './util/delay';
import { TypedEmit } from './component/typed-emit';
import { TypedEmitMulti, TypedInputs } from './component/typed-inputs';
import type { TypedInputsMeta } from './component/typed-inputs';
import { EmptyCmp } from './component/empty-cmp';
import { InputsTest } from './component/inputs-test';
import { AnyInputs } from './component/any-inputs';

type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false;

type IsAny<T> = 0 extends 1 & T ? true : false;

const numOnly = v.object({ num: v.number() });
const nfcOnly = v.object({ e: NFCSchema });
const nfcPair = v.object({ a: NFCSchema, b: NFCSchema });

const baseDefine = {
  types: {
    emit: { type: TypedEmit },
    inputs: { type: InputsTest },
    anyInputs: { type: AnyInputs },
    empty: { type: EmptyCmp },
  },
};

const lazyEmit = () =>
  import('./component/typed-emit').then((m) => m.TypedEmit);
// Solid 适配层直接拿 define.type 渲染, 懒加载必须用 solid 的 lazy 包一层
const solidLazyEmit = lazy(() =>
  import('./component/typed-emit').then(({ TypedEmit }) => ({
    default: TypedEmit,
  })),
);
const lazyDefine = { types: { emit: { type: solidLazyEmit } } };
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
        // @ts-expect-error inputs-test 没有 nope
        d.inputs.patch({ nope: 1 }),
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

  it('组件没有非函数 prop 时 key 被封死', () => {
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
    const inputs: Equal<
      keyof GetComponentInputs<typeof TypedEmit>,
      'name' | 'count'
    > = true;
    const emits: Equal<
      keyof GetComponentEmits<typeof TypedEmit>,
      'onChange' | 'onSubmit'
    > = true;

    expect([inputs, emits]).toEqual([true, true]);
  });

  it('类型: emit 处理器保留真实参数元组', () => {
    const change: Equal<
      GetComponentEmits<typeof TypedEmit>['onChange'],
      (value: number) => any
    > = true;
    const submit: Equal<
      GetComponentEmits<typeof TypedEmit>['onSubmit'],
      () => any
    > = true;

    expect([change, submit]).toEqual([true, true]);
  });
});

describe('typedFieldComponentPipe - inputs 真实值类型(非 any)', () => {
  const typedDefine = {
    types: {
      typed: { type: TypedInputs },
      multi: { type: TypedEmitMulti },
    },
  };

  it('类型: 每个 input 的值类型都直接来自组件 props', () => {
    type Inputs = GetComponentInputs<typeof TypedInputs>;

    const keys: Equal<
      keyof Inputs,
      'label' | 'count' | 'enabled' | 'tags' | 'meta'
    > = true;
    const label: Equal<Inputs['label'], string> = true;
    const count: Equal<Inputs['count'], number> = true;
    const enabled: Equal<Inputs['enabled'], boolean | undefined> = true;
    const tags: Equal<Inputs['tags'], string[] | undefined> = true;
    const meta: Equal<Inputs['meta'], TypedInputsMeta | undefined> = true;

    expect([keys, label, count, enabled, tags, meta]).toEqual([
      true,
      true,
      true,
      true,
      true,
      true,
    ]);
  });

  it('类型: 值类型不匹配会被逐个拦下', () => {
    const ok = typedFieldComponentPipe(numOnly, typedDefine, (d) => [
      d(['num'], 'typed', [
        d.inputs.patch({ label: 'ok', count: 1 }),
        d.inputs.set({
          label: 'ok',
          count: 1,
          enabled: true,
          tags: ['a'],
          meta: { id: 1, name: 'n' },
        }),
        d.inputs.patchAsync({ count: () => 2 }),
        d.inputs.remove(['label', 'meta']),
      ]),
    ]);

    const badCount = typedFieldComponentPipe(numOnly, typedDefine, (d) => [
      d(['num'], 'typed', [
        // @ts-expect-error count 是 number, 给 string 要报错
        d.inputs.patch({ count: 'nope' }),
      ]),
    ]);

    const badLabel = typedFieldComponentPipe(numOnly, typedDefine, (d) => [
      d(['num'], 'typed', [
        // @ts-expect-error label 是 string, 给 number 要报错
        d.inputs.patch({ label: 1 }),
      ]),
    ]);

    const badTags = typedFieldComponentPipe(numOnly, typedDefine, (d) => [
      d(['num'], 'typed', [
        // @ts-expect-error tags 是 string[], 给 number[] 要报错
        d.inputs.patch({ tags: [1, 2] }),
      ]),
    ]);

    const badMeta = typedFieldComponentPipe(numOnly, typedDefine, (d) => [
      d(['num'], 'typed', [
        d.inputs.patch({
          // @ts-expect-error meta.name 是 string
          meta: { id: 1, name: 2 },
        }),
      ]),
    ]);

    expect(ok && badCount && badLabel && badTags && badMeta).toBeTruthy();
  });

  it('类型: patchAsync 的返回值同样受值类型约束', () => {
    const bad = typedFieldComponentPipe(numOnly, typedDefine, (d) => [
      d(['num'], 'typed', [
        // @ts-expect-error count 是 number, async 回 string 要报错
        d.inputs.patchAsync({ count: () => 'nope' }),
      ]),
    ]);

    expect(bad).toBeTruthy();
  });

  it('类型: InputsTest 的 input 是具体类型, 不是 any', () => {
    type Inputs = GetComponentInputs<typeof InputsTest>;

    const keys: Equal<keyof Inputs, 'value1' | 'value2'> = true;
    const value1: Equal<Inputs['value1'], string | undefined> = true;
    const value2: Equal<Inputs['value2'], number | undefined> = true;
    // 0 extends 1 & T 是 any 独有的性质, 这里必须都是 false
    const value1NotAny: 0 extends 1 & Inputs['value1'] ? true : false = false;
    const value2NotAny: 0 extends 1 & Inputs['value2'] ? true : false = false;

    expect([keys, value1, value2, value1NotAny, value2NotAny]).toEqual([
      true,
      true,
      true,
      false,
      false,
    ]);
  });

  it('类型: InputsTest 的值类型写错会被拦下', () => {
    const ok = typedFieldComponentPipe(numOnly, baseDefine, (d) => [
      d(['num'], 'inputs', [
        d.inputs.patch({ value1: '1' }),
        d.inputs.set({ value1: '1', value2: 2 }),
      ]),
    ]);

    const badValue1 = typedFieldComponentPipe(numOnly, baseDefine, (d) => [
      d(['num'], 'inputs', [
        // @ts-expect-error value1 是 string, 给 number 要报错
        d.inputs.patch({ value1: 1 }),
      ]),
    ]);

    const badValue2 = typedFieldComponentPipe(numOnly, baseDefine, (d) => [
      d(['num'], 'inputs', [
        // @ts-expect-error value2 是 number, 给 string 要报错
        d.inputs.patch({ value2: '2' }),
      ]),
    ]);

    expect(ok && badValue1 && badValue2).toBeTruthy();
  });

  it('对照: any prop 什么都收, 完全看不出类型来源', () => {
    const anyValue: Equal<GetComponentInputs<typeof AnyInputs>['value1'], any> =
      true;
    const loose = typedFieldComponentPipe(numOnly, baseDefine, (d) => [
      d(['num'], 'anyInputs', [
        d.inputs.patch({ value1: '1' }),
        d.inputs.patch({ value1: 123 }),
        d.inputs.patch({ value1: { nested: true } }),
      ]),
    ]);

    expect([anyValue, loose]).toEqual([true, loose]);
  });

  it('类型: 多参数 emit 回调保留完整参数元组', () => {
    type Emits = GetComponentEmits<typeof TypedEmitMulti>;

    const range: Equal<Emits['onRange'], (start: number, end: string) => any> =
      true;
    const tag: Equal<
      Emits['onTag'],
      (index: number, tag: string, ok: boolean) => any
    > = true;

    expect([range, tag]).toEqual([true, true]);
  });

  it('类型: emit 回调参数写错会被拦下', () => {
    const ok = typedFieldComponentPipe(numOnly, typedDefine, (d) => [
      d(['num'], 'multi', [
        d.outputs.patch({
          onRange: (_start: number, _end: string) => {},
          onTag: (_index: number, _tag: string, _ok: boolean) => {},
        }),
      ]),
    ]);

    const badEnd = typedFieldComponentPipe(numOnly, typedDefine, (d) => [
      d(['num'], 'multi', [
        d.outputs.patch({
          // @ts-expect-error onRange 第二参是 string
          onRange: (_start: number, _end: number) => {},
        }),
      ]),
    ]);

    const badOk = typedFieldComponentPipe(numOnly, typedDefine, (d) => [
      d(['num'], 'multi', [
        d.outputs.patch({
          // @ts-expect-error onTag 第三参是 boolean
          onTag: (_index: number, _tag: string, _ok: string) => {},
        }),
      ]),
    ]);

    expect(ok && badEnd && badOk).toBeTruthy();
  });

  it('运行时: 强类型 input 真的渲染到组件上', async () => {
    const merged = typedFieldComponentPipe(nfcOnly, typedDefine, (d) => [
      d(['e'], 'typed', [
        d.inputs.patch({
          label: 'L',
          count: 7,
          enabled: true,
          tags: ['x', 'y'],
          meta: { id: 9, name: 'nine' },
        }),
      ]),
    ]);

    const { instance } = await createComponent(merged, undefined, {
      defaultConfig: { types: { typed: { type: TypedInputs } } },
    });

    expect(instance.container.querySelector('.label')?.textContent).toBe('L');
    expect(instance.container.querySelector('.count')?.textContent).toBe('7');
    expect(instance.container.querySelector('.enabled')?.textContent).toBe(
      'true',
    );
    expect(instance.container.querySelector('.tags')?.textContent).toBe('x,y');
    expect(instance.container.querySelector('.meta')?.textContent).toBe(
      '9:nine',
    );
  });

  it('运行时: 多参数 emit 的回调真的收到完整参数', async () => {
    const calls: unknown[][] = [];
    const merged = typedFieldComponentPipe(nfcOnly, typedDefine, (d) => [
      d(['e'], 'multi', [
        d.outputs.patch({
          onRange: (start: number, end: string) => {
            calls.push([start, end]);
          },
          onTag: (index: number, tag: string, ok: boolean) => {
            calls.push([index, tag, ok]);
          },
        }),
      ]),
    ]);

    const { instance } = await createComponent(merged, undefined, {
      defaultConfig: { types: { multi: { type: TypedEmitMulti } } },
    });

    fireEvent.click(
      instance.container.querySelector('.btn-range') as HTMLElement,
    );
    fireEvent.click(
      instance.container.querySelector('.btn-tag') as HTMLElement,
    );

    expect(calls).toEqual([
      [1, 'z'],
      [0, 'a', true],
    ]);
  });
});

describe('typedFieldComponentPipe - outputs 强类型', () => {
  it('key 收在组件真实函数 prop 名上', () => {
    const ok = typedFieldComponentPipe(numOnly, baseDefine, (d) => [
      d(['num'], 'emit', [
        d.outputs.patch({ onChange: (_value: number) => {} }),
        d.outputs.merge({ onSubmit: () => {} }),
        d.outputs.mergeAsync({ onChange: () => (_value: number) => {} }),
        d.outputs.remove(['onChange', 'onSubmit']),
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

  it('outputChange 的监听项锁定本条 entry 组件的 output 名', () => {
    const ok = typedFieldComponentPipe(numOnly, baseDefine, (d) => [
      d(['num'], 'emit', [
        d.outputChange((fn) => {
          fn([{ list: undefined, output: 'onChange' }]);
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

  it('类型: 零 output 组件跨字段监听, output 名不再塌成 never', () => {
    const ok = typedFieldComponentPipe(nfcPair, baseDefine, (d) => [
      d(['a'], 'empty', [
        d.outputChange((fn) => {
          fn([{ list: ['..', 'b'], output: 'onChange' }]).subscribe(
            ({ listenFields }) => {
              const f0: Equal<
                (typeof listenFields)[0],
                PiFieldAtPath<typeof nfcPair, ['b']>
              > = true;
              expect(f0).toBe(true);
            },
          );
        }),
      ]),
      d(['b'], 'emit', []),
    ]);

    expect(ok).toBeTruthy();
  });

  it('类型: 监听自身(list 缺省)仍然锁在本组件 outputs 上', () => {
    const bad = typedFieldComponentPipe(nfcPair, baseDefine, (d) => [
      d(['a'], 'empty', [
        d.outputChange((fn) => {
          // @ts-expect-error empty-cmp 一个 output 也没有
          fn([{ list: undefined, output: 'onChange' }]);
        }),
      ]),
    ]);

    expect(bad).toBeTruthy();
  });

  it('运行时: 零 output 组件跨字段监听, 照样收到对方 emit 的参数', async () => {
    const received: unknown[] = [];
    const merged = typedFieldComponentPipe(nfcPair, baseDefine, (d) => [
      d(['a'], 'empty', [
        d.outputChange((fn) => {
          fn([{ list: ['..', 'b'], output: 'onChange' }]).subscribe(
            (stream) => {
              received.push(stream);
            },
          );
        }),
      ]),
      d(['b'], 'emit', []),
    ]);

    const { instance } = await createComponent(merged, undefined, {
      defaultConfig: {
        types: {
          empty: { type: EmptyCmp },
          emit: { type: TypedEmit },
        },
      },
    });

    expect(instance.container.querySelectorAll('.empty-cmp').length).toBe(1);
    fireEvent.click(
      instance.container.querySelector('.btn-change') as HTMLElement,
    );
    await delay(10);

    expect(received.length).toBe(1);
    const stream = received[0] as {
      field: { fullPath: unknown };
      listenFields: { fullPath: unknown }[];
      list: unknown[];
    };
    expect(stream.field.fullPath).toEqual(['a']);
    expect(stream.listenFields[0].fullPath).toEqual(['b']);
    expect(stream.list[0]).toEqual([42]);
  });

  it('Solid 版不暴露 models: 没有双向绑定通道', () => {
    const bad = typedFieldComponentPipe(numOnly, baseDefine, (d) => [
      d(['num'], 'emit', [
        // @ts-expect-error Solid 运行时不消费 field.models
        d.models.patch({}),
      ]),
    ]);

    expect(bad).toBeTruthy();
  });
});

describe('typedFieldComponentPipe - attributes / events / wrappers', () => {
  it('attributes 收在标准 HTML 属性名上, 自定义名放行', () => {
    const ok = typedFieldComponentPipe(numOnly, baseDefine, (d) => [
      d(['num'], 'emit', [
        d.attributes.patch({ class: 'hello', id: 'a1', role: 'button' }),
        d.attributes.patch({ 'data-x': 1 }),
        d.attributes.top.set({ title: 'top-title' }),
        d.attributes.patchAsync({ class: () => 'async-class' }),
        d.attributes.remove(['class', 'my-attr']),
      ]),
    ]);

    expect(ok).toBeTruthy();
  });

  it('attributes 不再把 onXxx 当成属性名, 但自定义名依旧放行', () => {
    const classOk: 'class' extends SolidStandardAttrName ? true : false = true;
    const ariaOk: 'aria-label' extends SolidStandardAttrName ? true : false =
      true;
    const eventExcluded: 'onCopy' | 'onSubmit' extends SolidStandardAttrName
      ? true
      : false = false;
    const customOk: 'my-attr' extends SolidAttributeName ? true : false = true;

    expect([classOk, ariaOk, eventExcluded, customOk]).toEqual([
      true,
      true,
      false,
      true,
    ]);
  });

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
    const define = {
      wrappers: {
        block: { type: InputsTest },
      },
    };

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

describe('typedFieldComponentPipe - valueChange / hideWhen / disableWhen / class / hooks 等门面', () => {
  const formPair = v.object({ a: v.string(), b: v.number() });
  type AField = PiFieldAtPath<typeof formPair, ['a']>;

  it('类型: valueChange 的 list / listenFields 与路径元组逐位对齐', () => {
    const merged = typedFieldComponentPipe(formPair, baseDefine, (d) => [
      d(['a'], 'empty', [
        d.valueChange((fn, field) => {
          fn({ list: [undefined, ['..', 'b']] }).subscribe((s) => {
            const f0: Equal<
              (typeof s.listenFields)[0],
              PiFieldAtPath<typeof formPair, ['a']>
            > = true;
            const f1: Equal<
              (typeof s.listenFields)[1],
              PiFieldAtPath<typeof formPair, ['b']>
            > = true;
            const notAny: IsAny<(typeof s.listenFields)[1]> = false;
            const sameField: Equal<typeof s.field, typeof field> = true;
            const values: Equal<typeof s.list, [string, number]> = true;

            expect([f0, f1, notAny, sameField, values]).toEqual([
              true,
              true,
              false,
              true,
              true,
            ]);
          });
        }),
      ]),
    ]);

    expect(merged).toBeTruthy();
  });

  it('类型: valueChange 路径写错会被拦下, 不静默退化成 any', () => {
    const merged = typedFieldComponentPipe(formPair, baseDefine, (d) => [
      d(['a'], 'empty', [
        d.valueChange((fn) => {
          // @ts-expect-error 'nope' 不在父级 root 的路径集合里
          fn({ list: [['..', 'nope']] }).subscribe((s) => {
            const wrongIsAny: IsAny<(typeof s.list)[0]> = false;
            expect(wrongIsAny).toBe(false);
          });
        }),
      ]),
    ]);

    expect(merged).toBeTruthy();
  });

  it('类型: valueChange 不传 list 时退化为只监听自身', () => {
    const merged = typedFieldComponentPipe(formPair, baseDefine, (d) => [
      d(['a'], 'empty', [
        d.valueChange((fn, field) => {
          fn().subscribe((s) => {
            const shape: Equal<typeof s.list, [string]> = true;
            const self: Equal<
              (typeof s.listenFields)[0],
              PiFieldAtPath<typeof formPair, ['a']>
            > = true;
            const sameRef: Equal<typeof s.field, typeof field> = true;

            expect([shape, self, sameRef]).toEqual([true, true, true]);
          });
        }),
      ]),
    ]);

    expect(merged).toBeTruthy();
  });

  it('运行时: valueChange 逐位收到监听字段的值', async () => {
    const lists: unknown[][] = [];
    const merged = typedFieldComponentPipe(formPair, baseDefine, (d) => [
      d(['a'], 'empty', [
        d.valueChange((fn) => {
          fn({ list: [undefined, ['..', 'b']] }).subscribe((s) => {
            lists.push(s.list);
          });
        }),
      ]),
    ]);

    await createComponent(
      merged,
      { a: 'x', b: 1 },
      {
        defaultConfig: { types: { empty: { type: EmptyCmp } } },
      },
    );
    await delay(20);

    expect(lists.length).toBeGreaterThan(0);
    expect(lists[lists.length - 1]).toEqual(['x', 1]);
  });

  it('类型: hideWhen / disableWhen 回调 field 与 entry 路径一致', () => {
    const merged = typedFieldComponentPipe(formPair, baseDefine, (d) => [
      d(['a'], 'empty', [
        d.hideWhen({
          listen: (_fn, field) => {
            const eq: Equal<typeof field, AField> = true;
            const notAny: IsAny<typeof field> = false;
            expect([eq, notAny]).toEqual([true, false]);
            return of(false);
          },
        }),
        d.disableWhen({
          listen: (_fn, field) => {
            const eq: Equal<typeof field, AField> = true;
            expect(eq).toBe(true);
            return of(false);
          },
        }),
      ]),
    ]);

    expect(merged).toBeTruthy();
  });

  it('类型: hideWhen / disableWhen 的 fn 路径同样受约束', () => {
    const merged = typedFieldComponentPipe(formPair, baseDefine, (d) => [
      d(['a'], 'empty', [
        d.disableWhen({
          listen: (fn) =>
            fn({ list: [undefined, ['..', 'b']] }).pipe(
              map((s) => {
                const f0: Equal<
                  (typeof s.listenFields)[0],
                  PiFieldAtPath<typeof formPair, ['a']>
                > = true;
                const f1: Equal<
                  (typeof s.listenFields)[1],
                  PiFieldAtPath<typeof formPair, ['b']>
                > = true;
                const values: Equal<typeof s.list, [string, number]> = true;
                expect([f0, f1, values]).toEqual([true, true, true]);
                return false;
              }),
            ),
        }),
        d.hideWhen({
          listen: (fn) =>
            fn({ list: [undefined, ['..', 'b']] }).pipe(
              map((s) => {
                const notAny: IsAny<(typeof s.list)[1]> = false;
                expect(notAny).toBe(false);
                return false;
              }),
            ),
        }),
      ]),
    ]);

    expect(merged).toBeTruthy();
  });

  it('类型: disableWhen 路径写错同样被拦下', () => {
    const merged = typedFieldComponentPipe(formPair, baseDefine, (d) => [
      d(['a'], 'empty', [
        d.disableWhen({
          listen: (fn) =>
            // @ts-expect-error 'nope' 不在父级 root 的路径集合里
            fn({ list: [['..', 'nope']] }).pipe(map(() => false)),
        }),
      ]),
    ]);

    expect(merged).toBeTruthy();
  });

  it('运行时: hideWhen 为 true 时字段真的不渲染', async () => {
    const merged = typedFieldComponentPipe(formPair, baseDefine, (d) => [
      d(['a'], 'empty', [d.hideWhen({ listen: () => of(true) })]),
    ]);

    const { instance } = await createComponent(
      merged,
      { a: 'x', b: 1 },
      {
        defaultConfig: { types: { empty: { type: EmptyCmp } } },
      },
    );
    await delay(20);

    expect(instance.container.querySelector('.empty-cmp')).toBeNull();
  });

  it('类型: class.async* 回调 field 精确', () => {
    const merged = typedFieldComponentPipe(formPair, baseDefine, (d) => [
      d(['a'], 'empty', [
        d.class.asyncTop((field) => {
          const eq: Equal<typeof field, AField> = true;
          expect(eq).toBe(true);
          return 'c-async-top';
        }),
        d.class.asyncBottom((field) => {
          const eq: Equal<typeof field, AField> = true;
          expect(eq).toBe(true);
          return 'c-async-bottom';
        }),
        d.class.asyncComponent((field) => {
          const eq: Equal<typeof field, AField> = true;
          expect(eq).toBe(true);
          return 'c-async-comp';
        }),
      ]),
    ]);

    expect(merged).toBeTruthy();
  });

  it('运行时: class.async* 真的落到组件节点上', async () => {
    const merged = typedFieldComponentPipe(formPair, baseDefine, (d) => [
      d(['a'], 'empty', [
        d.class.top('c-top'),
        d.class.component('c-comp'),
        d.class.asyncComponent(() => 'c-async-comp'),
      ]),
    ]);

    const { instance } = await createComponent(
      merged,
      { a: 'x', b: 1 },
      {
        defaultConfig: { types: { empty: { type: EmptyCmp } } },
      },
    );
    await delay(20);

    const el = instance.container.querySelector('.empty-cmp');
    expect(el?.classList.contains('c-async-comp')).toBe(true);
  });

  it('类型: hooks 回调 field 精确, 且运行时确实被调到', async () => {
    const seen: string[] = [];
    const merged = typedFieldComponentPipe(formPair, baseDefine, (d) => [
      d(['a'], 'empty', [
        d.hooks.set({
          fieldResolved: (field) => {
            const eq: Equal<typeof field, AField> = true;
            expect(eq).toBe(true);
            seen.push('resolved@' + field.fullPath.join('/'));
          },
          allFieldsResolved: (field) => {
            seen.push('all@' + field.fullPath.join('/'));
          },
        }),
      ]),
    ]);

    await createComponent(
      merged,
      { a: 'x', b: 1 },
      {
        defaultConfig: { types: { empty: { type: EmptyCmp } } },
      },
    );
    await delay(20);

    expect(seen).toContain('resolved@a');
    expect(seen).toContain('all@a');
  });

  it('类型: props / slots / createOptions / providers 照常可用', () => {
    const merged = typedFieldComponentPipe(formPair, baseDefine, (d) => [
      d(['a'], 'empty', [
        d.props.patch({ myProp: 1 }),
        d.props.set({ p: 'x' }),
        d.slots.patch({ mySlot: 'sv' }),
        d.createOptions.patch({ lazy: true }),
        d.providers.set([]),
        d.providers.patch([]),
      ]),
    ]);

    expect(merged).toBeTruthy();
  });
});

describe('typedFieldComponentPipe - 运行时', () => {
  it('inputs.patch 真的下发到组件', async () => {
    const merged = typedFieldComponentPipe(nfcOnly, baseDefine, (d) => [
      d(['e'], 'emit', [d.inputs.patch({ name: 'hello', count: 3 })]),
    ]);

    const { instance } = await createComponent(merged, undefined, {
      defaultConfig: { types: { emit: { type: TypedEmit } } },
    });

    expect(instance.container.querySelector('.name')?.textContent).toBe(
      'hello',
    );
    expect(instance.container.querySelector('.count')?.textContent).toBe('3');
  });

  it('outputs.patch 的回调在组件 emit 时被调用', async () => {
    const calls: number[] = [];
    const merged = typedFieldComponentPipe(nfcOnly, baseDefine, (d) => [
      d(['e'], 'emit', [
        d.outputs.patch({
          onChange: (value: number) => {
            calls.push(value);
          },
        }),
      ]),
    ]);

    const { instance } = await createComponent(merged, undefined, {
      defaultConfig: { types: { emit: { type: TypedEmit } } },
    });

    fireEvent.click(
      instance.container.querySelector('.btn-change') as HTMLElement,
    );
    expect(calls).toEqual([42]);
  });

  it('outputChange 监听自身 emit 并拿到参数', async () => {
    let received: unknown = 'init';
    const merged = typedFieldComponentPipe(nfcOnly, baseDefine, (d) => [
      d(['e'], 'emit', [
        d.outputChange((fn) => {
          fn([{ list: undefined, output: 'onChange' }]).subscribe((stream) => {
            received = stream.list;
          });
        }),
      ]),
    ]);

    const { instance } = await createComponent(merged, undefined, {
      defaultConfig: { types: { emit: { type: TypedEmit } } },
    });

    expect(received).toBe('init');
    fireEvent.click(
      instance.container.querySelector('.btn-change') as HTMLElement,
    );
    await delay(10);
    expect(received).toEqual([[42]]);
  });

  it('每条 entry 都自动下发 setComponent', async () => {
    const merged = typedFieldComponentPipe(nfcOnly, baseDefine, (d) => [
      d(['e'], 'inputs', [d.inputs.patch({ value1: 'auto-component' })]),
    ]);

    const { instance } = await createComponent(merged, undefined, {
      defaultConfig: { types: { inputs: { type: InputsTest } } },
    });

    expect(
      instance.container.querySelector('.inputs-test')?.textContent,
    ).toContain('auto-component');
  });

  it('attributes.patch 真的落到组件根节点', async () => {
    const merged = typedFieldComponentPipe(nfcOnly, baseDefine, (d) => [
      d(['e'], 'empty', [d.attributes.patch({ class: 'attr-class' })]),
    ]);

    const { instance } = await createComponent(merged, undefined, {
      defaultConfig: { types: { empty: { type: EmptyCmp } } },
    });

    expect(instance.container.querySelector('.attr-class')).not.toBeNull();
  });
});

describe('typedFieldComponentPipe - 懒加载组件', () => {
  it('类型: 懒加载解出的组件与直接导入等价', () => {
    const resolved: Equal<
      ResolveLazyComponent<typeof lazyEmit>,
      typeof TypedEmit
    > = true;
    const emits: Equal<
      keyof GetComponentEmits<ResolveLazyComponent<typeof lazyEmit>>,
      keyof GetComponentEmits<typeof TypedEmit>
    > = true;

    expect([resolved, emits]).toEqual([true, true]);
  });

  it('类型: lazyMark 包装的懒加载同样能解开', () => {
    const resolved: Equal<
      ResolveLazyComponent<typeof markedEmit>,
      typeof TypedEmit
    > = true;

    expect(resolved).toBe(true);
  });

  it('类型 + 运行时: solid lazy 配置下依旧收窄并渲染', async () => {
    const markedDefine = { types: { emit: { type: solidLazyEmit } } };

    const bad = typedFieldComponentPipe(numOnly, markedDefine, (d) => [
      d(['num'], 'emit', [
        // @ts-expect-error typed-emit 没有 nope
        d.inputs.patch({ nope: 1 }),
      ]),
    ]);

    const merged = typedFieldComponentPipe(nfcOnly, markedDefine, (d) => [
      d(['e'], 'emit', [d.inputs.patch({ name: 'marked-name' })]),
    ]);
    const { instance } = await createComponent(merged, undefined, {
      defaultConfig: { types: { emit: { type: solidLazyEmit } } },
    });
    await delay(80);

    expect(bad).toBeTruthy();
    expect(instance.container.querySelector('.name')?.textContent).toBe(
      'marked-name',
    );
  });

  it('类型: 懒加载配置下 inputs / outputs 依旧收窄', () => {
    const ok = typedFieldComponentPipe(numOnly, lazyDefine, (d) => [
      d(['num'], 'emit', [
        d.inputs.patch({ name: 'lazy' }),
        d.outputs.patch({ onChange: (_value: number) => {} }),
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

    const { instance } = await createComponent(merged, undefined, {
      defaultConfig: { types: { emit: { type: solidLazyEmit } } },
    });
    await delay(80);

    expect(instance.container.querySelector('.name')?.textContent).toBe(
      'lazy-name',
    );
  });
});

describe('typedFieldComponentPipe - 默认组件(省略 component)', () => {
  const strOnly = v.object({ a: v.string() });
  const strDefine = { types: { string: { type: InputsTest } } };

  it('类型: 省略 component 时按 schema 的 type 反推表, 错 key 照样报错', () => {
    const ok = typedFieldComponentPipe(strOnly, strDefine, (d) => [
      d(['a'], [d.inputs.patch({ value1: 'x' })]),
      d(['a'], undefined, [d.inputs.patchAsync({ value2: () => 2 })]),
    ]);

    const bad = typedFieldComponentPipe(strOnly, strDefine, (d) => [
      d(
        ['a'],
        [
          // @ts-expect-error inputs-test 没有 nope
          d.inputs.patch({ nope: 'x' }),
        ],
      ),
    ]);

    expect(ok && bad).toBeTruthy();
  });

  it('运行时: 省略 component 时按 schema 的 type 渲染默认组件', async () => {
    const merged = typedFieldComponentPipe(strOnly, strDefine, (d) => [
      d(['a'], [d.props.patchAsync({ keep: () => true })]),
    ]);

    const { instance } = await createComponent(merged, { a: 'x' }, {});
    await delay(80);

    expect(instance.container.querySelector('input[type="text"]')).toBeTruthy();
  });
});

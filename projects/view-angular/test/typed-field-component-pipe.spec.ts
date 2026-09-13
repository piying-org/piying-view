import { signal } from '@angular/core';
import * as v from 'valibot';
import { setAlias } from '@piying/view-angular-core';
import { typedComponent } from '../lib/util/typed-component';
import { typedFieldComponentPipe } from '../lib/util/typed-field-component-pipe';
import { Test1Component } from './test1/test1.component';
import { createSchemaComponent } from './util/create-component';

/** 类型工具: 判断两个类型是否完全相等 */
type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false;
type Val<C> = NonNullable<C> extends { value: infer V } ? V : never;

const root = v.object({
  a: v.string(),
  num: v.number(),
  list: v.array(
    v.object({ c: v.number(), s: v.pipe(v.string(), setAlias('ss')) }),
  ),
});
type RootT = { a: string; num: number; list: { c: number; s: string }[] };
const modelValue = { a: 'hello', num: 5, list: [{ c: 1, s: 'x' }] };

/** num 单独成 schema, 便于用「有没有渲染出 Test1Component」判断组件是否被替换 */
const numOnly = v.object({ num: v.number() });

const typeDefine = typedComponent({
  types: { test1: { type: Test1Component } },
});

describe('typedFieldComponentPipe（typedFieldPipe + typedComponent 组合）', () => {
  it('d(path, component): 下发 setComponent, 组件按类型接收 inputs', async () => {
    const merged = typedFieldComponentPipe(numOnly, typeDefine, (d) => [
      d(['num'], 'test1', ($) => [$.inputs.patch({ input1: 'from-pipe' })]),
    ]);
    const { fixture, element } = await createSchemaComponent(
      signal(merged),
      signal({ num: 5 }),
      typeDefine.define,
    );
    await fixture.whenStable();
    fixture.detectChanges();

    // num 默认渲染 CustomInputComponent, 被 setComponent 换成 Test1Component
    const input1 = element.querySelector('.test1-div-input1') as HTMLElement;
    expect(input1).toBeTruthy();
    expect(input1.innerHTML).toEqual('from-pipe');
  });

  it('类型: 回调 field 与路径一致, 自身/父级/根级/别名 全部强类型', async () => {
    let count = 0;
    const merged = typedFieldComponentPipe(root, typeDefine, (d) => [
      d(['list', 0, 'c'], 'test1', ($) => [
        $.props.patchAsync({
          check: (field) => {
            const self: Equal<Val<typeof field.form.control>, number> = true;

            const up = field.get(['..'])!;
            const upV: Equal<
              Val<typeof up.form.control>,
              { c: number; s: string }
            > = true;

            const rootF = field.get(['#'])!;
            const rootV: Equal<Val<typeof rootF.form.control>, RootT> = true;

            const alias = field.get(['@ss'])!;
            const aliasV: Equal<Val<typeof alias.form.control>, string> = true;

            // @ts-expect-error 自身是 number, 不是 string
            const wrong: string = field.form.control!.value;

            expect([self, upV, rootV, aliasV]).toEqual([true, true, true, true]);
            expect(up.fullPath).toEqual(['list', 0]);
            expect(rootF.fullPath).toEqual([]);
            expect(alias.fullPath).toEqual(['list', 0, 's']);
            void wrong;
            count++;
            return 1;
          },
        }),
      ]),
    ]);
    const { fixture, field$$ } = await createSchemaComponent(
      signal(merged),
      signal({ ...modelValue }),
      typeDefine.define,
    );
    await fixture.whenStable();

    // 类型断言全在回调里, 靠这个确认它们真的跑了
    expect(count).toBe(1);
    expect(field$$()!.get(['list', 0, 'c'])!.props()['check']).toEqual(1);
  });

  it('outputs: 按组件 output() 类型约束, 运行时被组件真实触发', async () => {
    const received: string[] = [];
    const merged = typedFieldComponentPipe(root, typeDefine, (d) => [
      d(['a'], 'test1', ($) => [
        $.outputs.patch({
          output1: (input) => {
            const str: string = input;
            received.push(str);
          },
        }),
        $.outputs.mapAsync((field) => (value) => value),
      ]),
    ]);
    const { fixture } = await createSchemaComponent(
      signal(merged),
      signal({ ...modelValue }),
      typeDefine.define,
    );
    await fixture.whenStable();
    fixture.detectChanges();

    const comp = fixture.debugElement.query(
      (el) => el.componentInstance instanceof Test1Component,
    ).componentInstance as Test1Component;
    comp.valueChange2('abc');

    expect(received).toEqual(['abc']);
  });

  it('inputs.patchAsync: key 限定为组件 input 名, 支持 Promise / Signal', async () => {
    const merged = typedFieldComponentPipe(root, typeDefine, (d) => [
      d(['a'], 'test1', ($) => [
        $.inputs.patchAsync({
          input1: (field) =>
            Promise.resolve(`async-${field.fullPath.join('/')}`),
          input2: () => signal(99),
        }),
      ]),
    ]);
    const { fixture, field$$ } = await createSchemaComponent(
      signal(merged),
      signal({ ...modelValue }),
      typeDefine.define,
    );
    await fixture.whenStable();
    fixture.detectChanges();

    expect(field$$()!.get(['a'])!.inputs()['input1']).toEqual('async-a');
    expect(field$$()!.get(['a'])!.inputs()['input2']).toEqual(99);
  });

  it('原 schema 不被修改', async () => {
    const merged = typedFieldComponentPipe(root, typeDefine, (d) => [
      d(['a'], 'test1', ($) => [$.props.patchAsync({ p: () => 'P' })]),
    ]);
    expect(merged).not.toBe(root);

    const { fixture, field$$ } = await createSchemaComponent(
      signal(root),
      signal({ ...modelValue }),
      typeDefine.define,
    );
    await fixture.whenStable();
    expect(field$$()!.get(['a'])!.props()['p']).toBeUndefined();
  });

  it('多条 entry 叠加, 节点上原有的 pipe 成员不丢失', async () => {
    const withAlias = v.object({ a: v.pipe(v.string(), setAlias('aa')) });
    const merged = typedFieldComponentPipe(withAlias, typeDefine, (d) => [
      d(['a'], 'test1', ($) => [$.props.patchAsync({ x: () => 1 })]),
      d(['a'], 'test1', ($) => [$.props.patchAsync({ y: () => 2 })]),
    ]);
    const { fixture, field$$ } = await createSchemaComponent(
      signal(merged),
      signal({ a: 'v' }),
      typeDefine.define,
    );
    await fixture.whenStable();

    expect(field$$()!.get(['a'])!.props()).toEqual({ x: 1, y: 2 });
    // 原有 setAlias 仍在
    expect(field$$()!.get(['@aa'])!.keyPath).toEqual(['a']);
  });

  it('类型: 错误路径 / 未注册类型 / 组件不存在的输入输出 会报错', () => {
    // 纯编译期断言, 运行时不执行(非法路径会抛错)
    const typeOnlyChecks = () =>
      typedFieldComponentPipe(root, typeDefine, (d) => [
        // @ts-expect-error 不存在的路径
        d(['nope'], 'test1', ($) => [$.inputs.patch({ input1: 'x' })]),
        // @ts-expect-error 未注册的类型 key
        d(['a'], 'unknownType', ($) => [$.inputs.patch({ input1: 'x' })]),
        // @ts-expect-error 组件没有这个 input
        d(['a'], 'test1', ($) => [$.inputs.patch({ notAnInput: 'x' })]),
        // @ts-expect-error 组件没有这个 output
        d(['a'], 'test1', ($) => [$.outputs.patch({ notAnOutput: () => {} })]),
        // @ts-expect-error '#' 特殊段不参与 define 路径的联想
        d(['#'], 'test1', ($) => [$.props.patch({ x: 1 })]),
        // @ts-expect-error '..' 同上
        d(['..'], 'test1', ($) => [$.props.patch({ x: 1 })]),
        // @ts-expect-error '@alias' 同上
        d(['@ss'], 'test1', ($) => [$.props.patch({ x: 1 })]),
        // @ts-expect-error 嵌套位置同样不接受特殊段
        d(['list', '#'], 'test1', ($) => [$.props.patch({ x: 1 })]),
      ]);
    expect(typeOnlyChecks).toBeDefined();
  });
});

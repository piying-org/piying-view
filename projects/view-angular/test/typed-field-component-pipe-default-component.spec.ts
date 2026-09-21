import { signal } from '@angular/core';
import * as v from 'valibot';
import {
  ComponentKeyAt,
  SchemaTypeAt,
  setComponent,
} from '@piying/view-angular-core';
import {
  type GetComponentInputsOrigin,
  typedComponent,
} from '../lib/util/typed-component';
import { typedFieldComponentPipe } from '../lib/util/typed-field-component-pipe';
import { Test1Component } from './test1/test1.component';
import { createSchemaComponent } from './util/create-component';

type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false;

const typeDefine = typedComponent({
  types: { test1: { type: Test1Component } },
});

const Schema = v.object({
  radio1: v.pipe(
    v.optional(v.picklist(['v1', 'v2'])),
    setComponent('test1'),
    v.title('radio1-title'),
  ),
  // 多个 setComponent: 只有最后一个真正生效
  multi: v.pipe(
    v.optional(v.picklist(['v1', 'v2'])),
    setComponent('notThisOne'),
    setComponent('test1'),
  ),
  // 直接传组件类: 不查配置, 类型层直接用该组件
  direct: v.pipe(
    v.optional(v.picklist(['v1', 'v2'])),
    setComponent(Test1Component),
  ),
});

describe('typedFieldComponentPipe: 默认组件跟随 setComponent', () => {
  it('类型: 省略 component 时按 setComponent 的组件名查配置', () => {
    const a1: Equal<SchemaTypeAt<typeof Schema, ['radio1']>, 'test1'> = true;
    expect(a1).toBe(true);
  });

  it('类型: 省略 component 时 inputs 的 key 来自 setComponent 指向的组件', () => {
    // input1 是 Test1Component 的 input; 若默认组件仍按 picklist 推导, 这里编译不过
    const merged = typedFieldComponentPipe(Schema, typeDefine, (d) => [
      d(['radio1'], [d.inputs.patch({ input1: 'from-set-component' })]),
    ]);
    expect(merged).toBeTruthy();
  });

  it('类型: 多个 setComponent 时取最后一个对应的组件', () => {
    const a1: Equal<SchemaTypeAt<typeof Schema, ['multi']>, 'test1'> = true;
    const a2: Equal<
      SchemaTypeAt<typeof Schema, ['multi']>,
      'notThisOne'
    > = false;

    // inputs 的 key 来自最后一个 setComponent 指向的 Test1Component
    const merged = typedFieldComponentPipe(Schema, typeDefine, (d) => [
      d(['multi'], [d.inputs.patch({ input1: 'multi-last' })]),
    ]);

    expect([a1, a2]).toEqual([true, false]);
    expect(merged).toBeTruthy();
  });

  it('类型: setComponent 直接传组件类时, inputs 来自该组件', () => {
    const a1: Equal<
      ComponentKeyAt<typeof Schema, ['direct']>,
      typeof Test1Component
    > = true;

    // input1 是 Test1Component 的 input; 组件类没被带进类型的话这里编译不过
    const merged = typedFieldComponentPipe(Schema, typeDefine, (d) => [
      d(['direct'], [d.inputs.patch({ input1: 'direct-class' })]),
    ]);

    expect(a1).toBe(true);
    expect(merged).toBeTruthy();
  });

  it('类型: setComponent(组件类) 时, 该组件多个 input 一起 patch 不报错', () => {
    const merged = typedFieldComponentPipe(Schema, typeDefine, (d) => [
      d(
        ['direct'],
        [d.inputs.patch({ input1: 'a', input2: 2, transformed: 1 })],
      ),
    ]);
    expect(merged).toBeTruthy();
  });

  it('类型: setComponent(组件类) 时, 该组件多个 output 一起 patch 不报错', () => {
    const merged = typedFieldComponentPipe(Schema, typeDefine, (d) => [
      d(
        ['direct'],
        [
          d.outputs.patch({
            output1: () => {},
            ngControlChange: () => {},
            destroyedChange: () => {},
          }),
        ],
      ),
    ]);
    expect(merged).toBeTruthy();
  });

  it('类型: 表确实收紧了, 组件没有的属性不在可 patch 集合内', () => {
    type DirectKeys = keyof GetComponentInputsOrigin<typeof Test1Component>;
    const has: 'input1' extends DirectKeys ? true : false = true;
    const absent: 'notExist' extends DirectKeys ? true : false = false;
    expect([has, absent]).toEqual([true, false]);
  });

  it('运行时: 组件类形态直接渲染该组件', async () => {
    const merged = typedFieldComponentPipe(Schema, typeDefine, (d) => [
      d(['radio1'], [d.inputs.patch({ input1: 'a-string-key' })]),
      d(['multi'], [d.inputs.patch({ input1: 'b-multi-last' })]),
      d(['direct'], [d.inputs.patch({ input1: 'c-direct-class' })]),
    ]);

    const { fixture, element } = await createSchemaComponent(
      signal(merged),
      signal({ radio1: 'v1', multi: 'v1', direct: 'v1' }),
      typeDefine.define,
    );
    await fixture.whenStable();
    fixture.detectChanges();

    const rendered = Array.from(
      element.querySelectorAll('.test1-div-input1'),
    ).map((el) => el.innerHTML);
    // 三个字段最终都是 Test1Component: string key 查配置的和直接传组件类的
    expect(rendered.sort()).toEqual([
      'a-string-key',
      'b-multi-last',
      'c-direct-class',
    ]);
  });

  it('运行时: 该 input 真的下发到 Test1Component', async () => {
    const merged = typedFieldComponentPipe(Schema, typeDefine, (d) => [
      d(['radio1'], [d.inputs.patch({ input1: 'from-set-component' })]),
    ]);

    const { fixture, element } = await createSchemaComponent(
      signal(merged),
      signal({ radio1: 'v1' }),
      typeDefine.define,
    );
    await fixture.whenStable();
    fixture.detectChanges();

    const input1 = element.querySelector('.test1-div-input1') as HTMLElement;
    expect(input1.innerHTML).toEqual('from-set-component');
  });
});

import { Signal, Type } from '@angular/core';
import { Observable } from 'rxjs';
import * as v from 'valibot';
import {
  actions,
  asyncMergeOutputs,
  mergeOutputs,
  setComponent,
  typedFieldPipe,
} from '@piying/view-angular-core';
import type {
  ConfigAction,
  FieldEntry,
  KeyPath,
  PathsOf,
  PiCommonConfig,
  PiFieldAtPath,
  PiTypeConfig,
  TypedActions,
} from '@piying/view-angular-core';
import type {
  ActionComponent,
  GetComponentInputs,
  GetComponentInputsOrigin,
  GetComponentOutputs,
  GetComponentOutputsOrigin,
} from './typed-component';

type AsyncResult<T = any> = Promise<T> | Observable<T> | Signal<T> | (T & {});

/** 组件的「值 -> 异步回调」映射: key 锁定为组件的输入/输出名, 回调里拿到路径推导出的 field */
type AsyncValueMap<Values extends Record<string, any>, Field> = {
  [K in keyof Values]?: (field: Field) => AsyncResult<Values[K]>;
};

/** inputs: 值类型来自组件 input(), field 类型来自 schema 路径 */
export interface TypedComponentInputActions<Field, Component> {
  patch: <Input = any>(
    value: GetComponentInputsOrigin<Component>,
  ) => ConfigAction<Input>;
  set: <Input = any>(
    value: GetComponentInputsOrigin<Component>,
  ) => ConfigAction<Input>;
  patchAsync: <
    Data extends AsyncValueMap<GetComponentInputsOrigin<Component>, Field>,
  >(
    dataObj: Data,
  ) => ConfigAction<any>;
  remove: <Input = any>(
    list: (keyof GetComponentInputs<Component>)[],
  ) => ConfigAction<Input>;
  mapAsync: <Input = any>(
    fn: (
      field: Field,
    ) => (
      value: GetComponentInputs<Component>,
    ) => GetComponentInputs<Component>,
  ) => ConfigAction<Input>;
}

/** outputs: 值类型来自组件 output(), field 类型来自 schema 路径 */
export interface TypedComponentOutputActions<Field, Component> {
  patch: <Input = any>(
    value: GetComponentOutputsOrigin<Component>,
  ) => ConfigAction<Input>;
  set: <Input = any>(
    value: GetComponentOutputsOrigin<Component>,
  ) => ConfigAction<Input>;
  patchAsync: <
    Data extends AsyncValueMap<GetComponentOutputsOrigin<Component>, Field>,
  >(
    dataObj: Data,
  ) => ConfigAction<any>;
  remove: <Input = any>(
    list: (keyof GetComponentOutputs<Component>)[],
  ) => ConfigAction<Input>;
  merge: typeof mergeOutputs;
  mergeAsync: typeof asyncMergeOutputs;
  mapAsync: <Input = any>(
    fn: (
      field: Field,
    ) => (
      value: GetComponentOutputs<Component>,
    ) => GetComponentOutputs<Component>,
  ) => ConfigAction<Input>;
}

/**
 * 在 TypedActions 的基础上, 把 inputs / outputs 换成「按组件类型约束」的形态。
 * 其余 action 族(props / models / slots / attributes / events / hooks ...)保持原样,
 * 回调里的 field 依然是 `PiFieldAtPath<Root, P>`, 可以直接 field.get(['..'] / ['#'] / ['@alias'])。
 */
export type TypedComponentFieldActions<
  Root extends v.BaseSchema<any, any, any>,
  P extends KeyPath,
  Component,
> = Omit<TypedActions<Root, P>, 'inputs' | 'outputs'> & {
  inputs: TypedComponentInputActions<PiFieldAtPath<Root, P>, Component>;
  outputs: TypedComponentOutputActions<PiFieldAtPath<Root, P>, Component>;
};

type TypesOf<Cfg> = NonNullable<Cfg extends { types?: infer T } ? T : never>;

/** 可用的组件标识: 配置里注册的类型 key, 或者直接传组件类 */
export type ComponentKeyOf<Cfg> = keyof TypesOf<Cfg> | Type<any>;

/** 由组件标识解析出真正的组件类型 */
export type ComponentOf<Cfg, K> = K extends keyof TypesOf<Cfg>
  ? TypesOf<Cfg>[K] extends PiTypeConfig
    ? ActionComponent<TypesOf<Cfg>[K]>
    : any
  : K;

/**
 * 定义单条 entry: 路径 + 组件 -> 该路径下的强类型 actions。
 * 泛型 P / K 在这里独立推断, 所以每条路径各自精确。
 */
export type DefineComponentEntry<
  Root extends v.BaseSchema<any, any, any>,
  Cfg,
> = <
  P extends PathsOf<v.InferOutput<Root>>,
  K extends ComponentKeyOf<Cfg>,
>(
  path: [...P],
  component: K,
  fn: (
    $: TypedComponentFieldActions<Root, P, ComponentOf<Cfg, K>>,
  ) => readonly any[],
) => FieldEntry;

/** 兼容直接传 fieldGlobalConfig, 也兼容 typedComponent() 的返回值 */
type UnwrapConfig<C> = C extends { define: infer D } ? D : C;

/**
 * typedFieldPipe + typedComponent 的组合形态。
 *
 * 按「路径 + 组件」写配置:
 * - 回调里的 field 与 `builder.get(path)` 类型完全等价, 可以直接 get;
 * - `$.inputs` / `$.outputs` 的 key 与值类型由该组件的 input()/output() 推导。
 *
 * 每条 entry 都会下发 `setComponent(component)`, 保证「校验用的类型」就是「真正渲染的组件」。
 * 不需要组件类型时, 直接用 `typedFieldPipe`。
 *
 * 注意: 必须使用返回值, 原 schema 不被修改。
 */
export function typedFieldComponentPipe<
  S extends v.BaseSchema<any, any, any>,
  C extends PiCommonConfig | { define: PiCommonConfig },
>(
  schema: S,
  config: C,
  cb: (define: DefineComponentEntry<S, UnwrapConfig<C>>) => readonly FieldEntry[],
): S {
  const define: any = (path: KeyPath, component: any, fn: any): FieldEntry => ({
    path,
    actions: [setComponent(component), ...(fn(actions) ?? [])],
  });

  return typedFieldPipe(schema, () => cb(define));
}

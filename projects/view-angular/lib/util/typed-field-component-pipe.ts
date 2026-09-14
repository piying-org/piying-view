import * as v from 'valibot';
import { Observable } from 'rxjs';
import { Signal, Type } from '@angular/core';
import {
  asyncMergeOutputs,
  mergeOutputs,
  setComponent,
  typedFieldPipe,
  ɵtypedFieldActions,
} from '@piying/view-angular-core';
import type {
  ActionFactories,
  ConfigAction,
  FieldEntry,
  FieldPathsOf,
  KeyPath,
  PiCommonConfig,
  PiFieldAtPath,
  PiTypeConfig,
  ValibotAction,
  ValueOfField,
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

/**
 * 组件版 action 的类型。
 *
 * C 不出现在结构里, 全靠「同一泛型别名的逐实参配对推断」传递:
 * 工厂返回 `CompAction<F, C>`, 期望元素类型是 `CompAction<Field, 组件>`,
 * TS 按别名身份把两侧实参配对, C 就反推成了这条 entry 的组件。
 *
 * 因此工厂与 `CompEntryAction` 两侧必须都写 `CompAction`:
 * 任何一侧换成 `ConfigAction<F>` 或其他别名, 配对就断了,
 * C 拿不到候选而落到 unknown, 实参会塌成 `never`。
 */
type CompAction<F, _C> = ConfigAction<F>;

/** 组件版 entry 的期望元素类型: 专用工厂(带组件约束) 或 符合 valibot 定义的通用 action */
export type CompEntryAction<
  Root extends v.BaseSchema<any, any, any>,
  P extends KeyPath,
  C,
> =
  | CompAction<PiFieldAtPath<Root, P>, C>
  | ValibotAction<ValueOfField<PiFieldAtPath<Root, P>>>;

/**
 * 组件泛型丢失(推不出具体组件)时的降级形态。
 *
 * 降级不等于封死: inputs / outputs 退化成普通 key/value 对象,
 * 根路径、props、hooks 等基础功能全部保留, 只是不再校验 key 名。
 */
type FallbackInputs = Record<string, any>;
type FallbackOutputs = Record<string, (...args: any[]) => any>;

/** C 为 never(推不出组件) 时降级, 否则走组件精确类型 */
type InputsOriginOf<C> = [C] extends [never]
  ? FallbackInputs
  : GetComponentInputsOrigin<C>;
type OutputsOriginOf<C> = [C] extends [never]
  ? FallbackOutputs
  : GetComponentOutputsOrigin<C>;
type InputsOf<C> = [C] extends [never] ? FallbackInputs : GetComponentInputs<C>;
type OutputsOf<C> = [C] extends [never]
  ? FallbackOutputs
  : GetComponentOutputs<C>;
type InputKeysOf<C> = [C] extends [never]
  ? string
  : keyof GetComponentInputs<C>;
type OutputKeysOf<C> = [C] extends [never]
  ? string
  : keyof GetComponentOutputs<C>;

/** inputs: 值类型来自组件 input(), field 类型由 entry 的期望元素类型反推 */
export interface TypedComponentInputActionsFactory {
  patch: <F, C>(value: InputsOriginOf<C>) => CompAction<F, C>;
  set: <F, C>(value: InputsOriginOf<C>) => CompAction<F, C>;
  patchAsync: <F, C, Data extends AsyncValueMap<InputsOriginOf<C>, F>>(
    dataObj: Data,
  ) => CompAction<F, C>;
  remove: <F, C>(list: InputKeysOf<C>[]) => CompAction<F, C>;
  mapAsync: <F, C>(
    fn: (field: F) => (value: InputsOf<C>) => InputsOf<C>,
  ) => CompAction<F, C>;
}

/** outputs: 值类型来自组件 output(), field 类型由 entry 的期望元素类型反推 */
export interface TypedComponentOutputActionsFactory {
  patch: <F, C>(value: OutputsOriginOf<C>) => CompAction<F, C>;
  set: <F, C>(value: OutputsOriginOf<C>) => CompAction<F, C>;
  patchAsync: <F, C, Data extends AsyncValueMap<OutputsOriginOf<C>, F>>(
    dataObj: Data,
  ) => CompAction<F, C>;
  remove: <F, C>(list: OutputKeysOf<C>[]) => CompAction<F, C>;
  merge: typeof mergeOutputs;
  mergeAsync: typeof asyncMergeOutputs;
  mapAsync: <F, C>(
    fn: (field: F) => (value: OutputsOf<C>) => OutputsOf<C>,
  ) => CompAction<F, C>;
}

/** 组件版 action 工厂集合: inputs / outputs 换成组件约束形态, 其余沿用通用工厂 */
export type TypedComponentActionFactories = Omit<
  ActionFactories,
  'inputs' | 'outputs'
> & {
  inputs: TypedComponentInputActionsFactory;
  outputs: TypedComponentOutputActionsFactory;
};

type TypesOf<Cfg> = NonNullable<Cfg extends { types?: infer T } ? T : never>;

/** 可用的组件标识: 配置里注册的类型 key, 或者直接传组件类 */
export type ComponentKeyOf<Cfg> = keyof TypesOf<Cfg> | Type<any>;

/** 能不能从配置项里解析出组件: 要么直接给 type, 要么给了非空 actions */
type IsComponentLike<A> = A extends { type: Type<any> }
  ? true
  : A extends { actions: readonly [any, ...any[]] }
    ? true
    : false;

/**
 * 由组件标识解析出真正的组件类型。
 *
 * 解析不出组件时落到 never 而不是 any:
 * `any` 会让 `GetComponentInputsOrigin<any>` 退化成宽松对象,
 * 配置项写错(比如把 type 拼成别的 key)时不报错, input/output 的 key 约束整体静默失效。
 */
export type ComponentOf<Cfg, K> = K extends keyof TypesOf<Cfg>
  ? IsComponentLike<TypesOf<Cfg>[K]> extends true
    ? ActionComponent<Extract<TypesOf<Cfg>[K], PiTypeConfig<any, any>>>
    : never
  : K;

/**
 * 定义单条 entry: 路径 + 组件 + 该路径下的 actions。
 *
 * - 路径 P 由第一个实参推断, 组件 K 由第二个实参推断;
 * - actions 的期望元素类型与 `typedFieldPipe` 同构: 组件约束只体现在工厂的**实参**上,
 *   所以 `d.inputs.patchAsync({...})` 的 key/值类型依旧由该条 entry 的组件决定。
 */
export type DefineComponentEntry<
  Root extends v.BaseSchema<any, any, any>,
  Cfg,
> = TypedComponentActionFactories & {
  <P extends FieldPathsOf<Root>, K extends ComponentKeyOf<Cfg>>(
    path: [...P],
    component: K,
    actions: readonly CompEntryAction<Root, P, ComponentOf<Cfg, K>>[],
  ): FieldEntry;
};

/** 兼容直接传 fieldGlobalConfig, 也兼容 typedComponent() 的返回值 */
type UnwrapConfig<C> = C extends { define: infer D } ? D : C;

/**
 * typedFieldPipe + typedComponent 的组合形态。
 *
 * 按「路径 + 组件」写配置:
 * - 回调里的 field 与 `builder.get(path)` 类型完全等价, 可以直接 get;
 * - `d.inputs` / `d.outputs` 的 key 与值类型由该条 entry 的组件推导。
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
  cb: (
    define: DefineComponentEntry<S, UnwrapConfig<C>>,
  ) => readonly FieldEntry[],
): S {
  const define: any = (
    path: KeyPath,
    component: any,
    actions: readonly any[],
  ): FieldEntry => ({
    path,
    actions: [setComponent(component), ...(actions ?? [])],
  });
  Object.assign(define, ɵtypedFieldActions);

  return typedFieldPipe(schema, () => cb(define));
}

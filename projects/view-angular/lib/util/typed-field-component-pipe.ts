import * as v from 'valibot';
import { Type, WritableSignal } from '@angular/core';
import {
  setComponent,
  typedFieldPipe,
  ɵtypedFieldActions,
} from '@piying/view-angular-core';
import type {
  ActionFactories,
  AnyOutputsHandlerMap,
  AsyncResult,
  ConfigAction,
  EventChangeFn,
  FieldEntry,
  FieldPathsOf,
  KeyPath,
  LazyImport,
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
  GetComponentModelKeys,
  GetComponentModelsOrigin,
  GetComponentOutputs,
  GetComponentOutputsHandlerMap,
  GetComponentOutputsOrigin,
} from './typed-component';

/**
 * 组件零 input / 零 output 时, 映射类型会退化成 `{}`。
 * TS 对 `{}` 目标不做多余属性检查, `patch({ 随便写: 1 })` 会静默通过,
 * 所以空映射一律换成 `Record<string, never>` 把 key 封住(空对象仍合法)。
 */
type TightenEmpty<T extends Record<string, any>> = [keyof T] extends [never]
  ? Record<string, never>
  : T;

/** 组件的「值 -> 异步回调」映射: key 锁定为组件的输入/输出名, 回调里拿到路径推导出的 field */
type AsyncValueMap<Values extends Record<string, any>, Field> = TightenEmpty<{
  [K in keyof Values]?: (field: Field) => AsyncResult<Values[K]>;
}>;

/**
 * 「值 -> 同步产出该值的回调」映射(mergeAsync 用)。
 * mergeAsync 运行时是同步取 handler, 不走 Promise/Observable, 所以不包 AsyncResult。
 */
type HandlerValueMap<Values extends Record<string, any>, Field> = TightenEmpty<{
  [K in keyof Values]?: (field: Field) => NonNullable<Values[K]>;
}>;

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
type FallbackModels = Record<string, WritableSignal<any>>;

/** C 为 never(推不出组件) 时降级, 否则走组件精确类型 */
type InputsOriginOf<C> = [C] extends [never]
  ? FallbackInputs
  : TightenEmpty<GetComponentInputsOrigin<C>>;
type OutputsOriginOf<C> = [C] extends [never]
  ? FallbackOutputs
  : TightenEmpty<GetComponentOutputsOrigin<C>>;
type InputKeysOf<C> = [C] extends [never]
  ? string
  : keyof GetComponentInputs<C>;
type OutputKeysOf<C> = [C] extends [never]
  ? string
  : keyof GetComponentOutputs<C>;
type ModelsOriginOf<C> = [C] extends [never]
  ? FallbackModels
  : TightenEmpty<GetComponentModelsOrigin<C>>;
type ModelKeysOf<C> = [C] extends [never] ? string : GetComponentModelKeys<C>;

/** inputs: 值类型来自组件 input(), field 类型由 entry 的期望元素类型反推 */
export interface TypedComponentInputActionsFactory {
  patch: <F, C>(value: InputsOriginOf<C>) => CompAction<F, C>;
  set: <F, C>(value: InputsOriginOf<C>) => CompAction<F, C>;
  patchAsync: <F, C, Data extends AsyncValueMap<InputsOriginOf<C>, F>>(
    dataObj: Data,
  ) => CompAction<F, C>;
  remove: <F, C>(list: InputKeysOf<C>[]) => CompAction<F, C>;
  /**
   * map 运行时拿到的是「已解析的普通值对象」, 不是 InputSignal 引用,
   * 所以 value 用 origin 形态; 返回不做约束(就是返回一个新的值对象)。
   */
  mapAsync: <F, C>(
    fn: (field: F) => (value: InputsOriginOf<C>) => any,
  ) => CompAction<F, C>;
}

/**
 * models: key 锁在「`model()` 声明的 ∪ `xxx` + `xxxChange` 配对的」上,
 * 值是宿主侧的 WritableSignal —— 运行时走 `twoWayBinding(key, signal)`。
 */
export interface TypedComponentModelActionsFactory {
  patch: <F, C>(value: ModelsOriginOf<C>) => CompAction<F, C>;
  set: <F, C>(value: ModelsOriginOf<C>) => CompAction<F, C>;
  patchAsync: <F, C, Data extends AsyncValueMap<ModelsOriginOf<C>, F>>(
    dataObj: Data,
  ) => CompAction<F, C>;
  remove: <F, C>(list: ModelKeysOf<C>[]) => CompAction<F, C>;
  mapAsync: <F, C>(
    fn: (field: F) => (value: ModelsOriginOf<C>) => any,
  ) => CompAction<F, C>;
}

/**
 * events 的 key: 标准 DOM 事件名(lib.dom.d.ts 的 HTMLElementEventMap)保留补全与精确参数,
 * `string & {}` 放行自定义名 —— Web Component 的 `my-changed`、Angular 的
 * `window:resize` / `document:x` / `key.control.a` 都不在标准表里, 必须留口子。
 *
 * 代价: 自定义名与「标准名拼错」在类型上无法区分, 所以 clickk 不会报错。
 */
type DomEventName = keyof HTMLElementEventMap;
type EventName = DomEventName | (string & {});

/**
 * 标准事件参数精确到 Event 子类(click -> PointerEvent)。
 *
 * 自定义名必须用 `(...args: any[]) => any` 而不是 `(event: Event) => any`:
 * 索引签名比标准名的参数窄时, 逆变会让 `click: (e: PointerEvent) => void`
 * 反而过不了索引签名检查。放宽后顺带能直接标 `CustomEvent<Detail>`。
 */
type DomEventHandler<K> = K extends DomEventName
  ? (event: HTMLElementEventMap[K]) => any
  : (...args: any[]) => any;

type EventsHandlerMap = { [K in EventName]?: DomEventHandler<K> };
type EventsAsyncHandlerMap<F> = {
  [K in EventName]?: (field: F) => DomEventHandler<K>;
};

/** events 与组件无关, 只把 key 收在「标准 DOM 事件 ∪ 任意自定义名」 */
export interface TypedComponentEventsActionsFactory {
  patch: <F, C>(value: EventsHandlerMap) => CompAction<F, C>;
  set: <F, C>(value: EventsHandlerMap) => CompAction<F, C>;
  patchAsync: <F, C, Data extends EventsAsyncHandlerMap<F>>(
    dataObj: Data,
  ) => CompAction<F, C>;
  remove: <F, C>(list: EventName[]) => CompAction<F, C>;
  mapAsync: <F, C>(
    fn: (field: F) => (value: EventsHandlerMap) => any,
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
  /** merge / mergeAsync 与 patch 同族, key 同样按组件 output 名约束 */
  merge: <F, C>(outputs: OutputsOriginOf<C>) => CompAction<F, C>;
  mergeAsync: <F, C>(
    outputs: HandlerValueMap<OutputsOriginOf<C>, F>,
  ) => CompAction<F, C>;
  mapAsync: <F, C>(
    fn: (field: F) => (value: OutputsOriginOf<C>) => any,
  ) => CompAction<F, C>;
}

/**
 * outputChange 的组件形态: 监听项的 output 名锁定在本组件的 output() 上。
 *
 * 运行时 handler 挂在「本条 entry 的 field」的 outputs 上,
 * 所以按本条 entry 的组件约束就是准确的。
 *
 * 第三个泛型把组件 output() 的 emit 参数送进 stream, 让 list 每一位也是强类型。
 */
type OutputsHandlerMapOf<C> = [C] extends [never]
  ? AnyOutputsHandlerMap
  : GetComponentOutputsHandlerMap<C>;

type CompOutputChangeFn<F, C> = EventChangeFn<
  F,
  OutputKeysOf<C>,
  OutputsHandlerMapOf<C>
>;

/**
 * wrappers 的 key: 对齐配置里 `wrappers` 的 key。
 * 运行时 `defaultWrapperMetadataGroup` 就是 `fieldGlobalConfig.wrappers`,
 * 合法名只有这一份, 没有内置魔法名; 配置里没声明时降级成裸 string, 不封死。
 */
type WrappersOf<Cfg> = NonNullable<
  Cfg extends { wrappers?: infer W } ? W : never
>;
type WrapperNameOf<Cfg> = keyof WrappersOf<Cfg> & string;
type WrapperNameInput<Cfg> = [WrapperNameOf<Cfg>] extends [never]
  ? string
  : WrapperNameOf<Cfg>;

/** 对象形态的 wrapper 定义(`{ type: X, ... }`), 从通用工厂参数里扣出来复用 */
type WrapperEntryObj = Exclude<
  Parameters<ActionFactories['wrappers']['set']>[0][number],
  string
>;

/** wrappers: 名字形态收在配置声明的 key 上, 对象形态原样保留 */
export interface TypedWrappersActionsFactory<Cfg> {
  set: <F, C>(
    wrappers: (WrapperEntryObj | WrapperNameInput<Cfg>)[],
  ) => CompAction<F, C>;
  patch: <F, C>(
    wrappers: (WrapperEntryObj | WrapperNameInput<Cfg>)[],
  ) => CompAction<F, C>;
  patchAsync: <F, C>(
    type: WrapperEntryObj | WrapperNameInput<Cfg>,
    actions?: ConfigAction<any>[],
    options?: { insertIndex?: number },
  ) => CompAction<F, C>;
  remove: <F, C>(
    list: WrapperNameInput<Cfg>[] | ((list: any) => any),
  ) => CompAction<F, C>;
}

/** 组件版 action 工厂集合: inputs / outputs 换成组件约束形态, 其余沿用通用工厂 */
export type TypedComponentActionFactories<Cfg = unknown> = Omit<
  ActionFactories,
  'inputs' | 'outputs' | 'models' | 'outputChange' | 'events' | 'wrappers'
> & {
  inputs: TypedComponentInputActionsFactory;
  outputs: TypedComponentOutputActionsFactory;
  models: TypedComponentModelActionsFactory;
  events: TypedComponentEventsActionsFactory;
  wrappers: Omit<
    ActionFactories['wrappers'],
    'set' | 'patch' | 'patchAsync' | 'remove'
  > &
    TypedWrappersActionsFactory<Cfg>;
  /** 与 outputs 同族: 靠 CompAction 别名配对把 C 送进回调内部的 output 名约束 */
  outputChange: <F, C>(fn: CompOutputChangeFn<F, C>) => CompAction<F, C>;
};

type TypesOf<Cfg> = NonNullable<Cfg extends { types?: infer T } ? T : never>;

/** 可用的组件标识: 配置里注册的类型 key, 直接传组件类, 或者直接传懒加载函数 */
export type ComponentKeyOf<Cfg> =
  | keyof TypesOf<Cfg>
  | Type<any>
  | LazyImport<any>;

/** 能不能从配置项里解析出组件: 直接给 type(含懒加载), 要么给了非空 actions */
type IsComponentLike<A> = A extends {
  type: Type<any> | LazyImport<any>;
}
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
> = TypedComponentActionFactories<Cfg> & {
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
  const define = Object.assign(
    (path: KeyPath, component: any, actions: readonly any[]): FieldEntry => ({
      path,
      actions: [setComponent(component), ...(actions ?? [])],
    }),
    ɵtypedFieldActions,
  ) as unknown as DefineComponentEntry<S, UnwrapConfig<C>>;

  return typedFieldPipe(schema, () => cb(define));
}

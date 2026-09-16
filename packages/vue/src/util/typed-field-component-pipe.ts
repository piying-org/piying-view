import * as v from 'valibot';
import { setComponent, typedFieldPipe, ɵtypedFieldActions } from '@piying/view-core';
import type {
  ActionFactories,
  AnyOutputsHandlerMap,
  AsyncResult,
  ConfigAction,
  EventChangeFn,
  FieldEntry,
  FieldPathsOf,
  KeyPath,
  PiCommonConfig,
  PiFieldAtPath,
  PiTypeConfig,
  ValibotAction,
  ValueOfField,
} from '@piying/view-core';
import type {
  ActionComponent,
  GetComponentInputsKeys,
  GetComponentInputsOrigin,
  GetComponentOutputsHandlerMap,
  GetComponentOutputsKeys,
  GetComponentOutputsOrigin,
  VueComponentKey,
} from './component-types';

/**
 * 组件零 input / 零 output 时, 映射类型会退化成 `{}`。
 * TS 对 `{}` 目标不做多余属性检查, `patch({ 随便写: 1 })` 会静默通过,
 * 所以空映射一律换成 `Record<string, never>` 把 key 封住(空对象仍合法)。
 */
type TightenEmpty<T extends Record<string, any>> = [keyof T] extends [never]
  ? Record<string, never>
  : T;

/** 组件的「值 -> 异步回调」映射: key 锁定为组件的 props/emit 名, 回调里拿到路径推导出的 field */
type AsyncValueMap<Values extends Record<string, any>, Field> = TightenEmpty<{
  [K in keyof Values]?: (field: Field) => AsyncResult<Values[K]>;
}>;

/**
 * 「值 -> 同步产出该值的回调」映射(mergeAsync 用)。
 * mergeAsync 运行时是同步取 handler, 不走 Promise, 所以不包 AsyncResult。
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
 */
type CompAction<F, _C> = ConfigAction<F>;

/** 组件版 entry 的期望元素类型: 专用工厂(带组件约束) 或 符合 valibot 定义的通用 action */
export type CompEntryAction<Root extends v.BaseSchema<any, any, any>, P extends KeyPath, C> =
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
  : TightenEmpty<GetComponentInputsOrigin<C>>;
type OutputsOriginOf<C> = [C] extends [never]
  ? FallbackOutputs
  : TightenEmpty<GetComponentOutputsOrigin<C>>;
type InputKeysOf<C> = [C] extends [never] ? string : GetComponentInputsKeys<C>;
type OutputKeysOf<C> = [C] extends [never] ? string : GetComponentOutputsKeys<C>;

/** inputs: 值类型来自组件 props(), field 类型由 entry 的期望元素类型反推 */
export interface TypedComponentInputActionsFactory {
  patch: <F, C>(value: InputsOriginOf<C>) => CompAction<F, C>;
  set: <F, C>(value: InputsOriginOf<C>) => CompAction<F, C>;
  patchAsync: <F, C, Data extends AsyncValueMap<InputsOriginOf<C>, F>>(
    dataObj: Data,
  ) => CompAction<F, C>;
  remove: <F, C>(list: InputKeysOf<C>[]) => CompAction<F, C>;
  /**
   * map 运行时拿到的是「已解析的普通值对象」, 不是响应式引用,
   * 所以 value 用 origin 形态; 返回不做约束(就是返回一个新的值对象)。
   */
  mapAsync: <F, C>(fn: (field: F) => (value: InputsOriginOf<C>) => any) => CompAction<F, C>;
}

/**
 * outputs: 值类型来自组件 emits, field 类型由 entry 的期望元素类型反推。
 *
 * Vue 里 output 就是 `v-on` 的事件名(`emit('change')` -> key `change`),
 * 不是 `onUpdate:modelValue` 这种宿主写法。
 */
export interface TypedComponentOutputActionsFactory {
  patch: <F, C>(value: OutputsOriginOf<C>) => CompAction<F, C>;
  set: <F, C>(value: OutputsOriginOf<C>) => CompAction<F, C>;
  patchAsync: <F, C, Data extends AsyncValueMap<OutputsOriginOf<C>, F>>(
    dataObj: Data,
  ) => CompAction<F, C>;
  remove: <F, C>(list: OutputKeysOf<C>[]) => CompAction<F, C>;
  /** merge / mergeAsync 与 patch 同族, key 同样按组件 emit 名约束 */
  merge: <F, C>(outputs: OutputsOriginOf<C>) => CompAction<F, C>;
  mergeAsync: <F, C>(outputs: HandlerValueMap<OutputsOriginOf<C>, F>) => CompAction<F, C>;
  mapAsync: <F, C>(fn: (field: F) => (value: OutputsOriginOf<C>) => any) => CompAction<F, C>;
}

/**
 * outputChange 的组件形态: 监听项的 emit 名锁定在本组件的 emits 上。
 *
 * 第三个泛型把组件 emit 的参数送进 stream, 让 list 每一位也是强类型。
 */
type OutputsHandlerMapOf<C> = [C] extends [never]
  ? AnyOutputsHandlerMap
  : GetComponentOutputsHandlerMap<C>;

type CompOutputChangeFn<F, C> = EventChangeFn<F, OutputKeysOf<C>, OutputsHandlerMapOf<C>>;

/**
 * events 的 key: 标准 DOM 事件名(lib.dom.d.ts 的 HTMLElementEventMap)保留补全与精确参数,
 * `string & {}` 放行自定义名 —— Web Component 的 `my-changed` 这类都不在标准表里。
 */
type DomEventName = keyof HTMLElementEventMap;
type EventName = DomEventName | (string & {});

/**
 * 标准事件参数精确到 Event 子类(click -> PointerEvent)。
 *
 * 自定义名必须用 `(...args: any[]) => any` 而不是 `(event: Event) => any`:
 * 索引签名比标准名的参数窄时, 逆变会让 `click: (e: PointerEvent) => void`
 * 反而过不了索引签名检查。
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
  patchAsync: <F, C, Data extends EventsAsyncHandlerMap<F>>(dataObj: Data) => CompAction<F, C>;
  remove: <F, C>(list: EventName[]) => CompAction<F, C>;
  mapAsync: <F, C>(fn: (field: F) => (value: EventsHandlerMap) => any) => CompAction<F, C>;
}

/**
 * wrappers 的 key: 对齐配置里 `wrappers` 的 key。
 * 配置里没声明时降级成裸 string, 不封死。
 */
type WrappersOf<Cfg> = NonNullable<Cfg extends { wrappers?: infer W } ? W : never>;
type WrapperNameOf<Cfg> = keyof WrappersOf<Cfg> & string;
type WrapperNameInput<Cfg> = [WrapperNameOf<Cfg>] extends [never] ? string : WrapperNameOf<Cfg>;

/** 对象形态的 wrapper 定义(`{ type: X, ... }`), 从通用工厂参数里扣出来复用 */
type WrapperEntryObj = Exclude<Parameters<ActionFactories['wrappers']['set']>[0][number], string>;

/** wrappers: 名字形态收在配置声明的 key 上, 对象形态原样保留 */
export interface TypedWrappersActionsFactory<Cfg> {
  set: <F, C>(wrappers: (WrapperEntryObj | WrapperNameInput<Cfg>)[]) => CompAction<F, C>;
  patch: <F, C>(wrappers: (WrapperEntryObj | WrapperNameInput<Cfg>)[]) => CompAction<F, C>;
  patchAsync: <F, C>(
    type: WrapperEntryObj | WrapperNameInput<Cfg>,
    actions?: ConfigAction<any>[],
    options?: { insertIndex?: number },
  ) => CompAction<F, C>;
  remove: <F, C>(list: WrapperNameInput<Cfg>[] | ((list: any) => any)) => CompAction<F, C>;
}

/**
 * 组件版 action 工厂集合。
 *
 * 与 Angular 版的差异: 没有 `models`。
 * Vue 的 v-model 在运行时就是「prop + `update:xxx` 事件」, 本包没有独立的
 * 双向绑定通道(field.models 不参与渲染), 所以这里直接不暴露, 避免写出无效配置。
 */
export type TypedComponentActionFactories<Cfg = unknown> = Omit<
  ActionFactories,
  'inputs' | 'outputs' | 'models' | 'outputChange' | 'events' | 'wrappers'
> & {
  inputs: TypedComponentInputActionsFactory;
  outputs: TypedComponentOutputActionsFactory;
  events: TypedComponentEventsActionsFactory;
  wrappers: Omit<ActionFactories['wrappers'], 'set' | 'patch' | 'patchAsync' | 'remove'> &
    TypedWrappersActionsFactory<Cfg>;
  /** 与 outputs 同族: 靠 CompAction 别名配对把 C 送进回调内部的 emit 名约束 */
  outputChange: <F, C>(fn: CompOutputChangeFn<F, C>) => CompAction<F, C>;
};

type TypesOf<Cfg> = NonNullable<Cfg extends { types?: infer T } ? T : never>;

/** 可用的组件标识: 配置里注册的类型 key, 直接传组件, 或者直接传懒加载函数 */
export type ComponentKeyOf<Cfg> = keyof TypesOf<Cfg> | VueComponentKey;

/** 能不能从配置项里解析出组件: 直接给 type(含懒加载), 要么给了非空 actions */
type IsComponentLike<A> = A extends { type: VueComponentKey }
  ? true
  : A extends { actions: readonly [any, ...any[]] }
    ? true
    : false;

/** 由组件标识解析出真正的组件类型 */
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
 * typedFieldPipe + 组件类型约束的组合形态。
 *
 * 按「路径 + 组件」写配置:
 * - 回调里的 field 与 `builder.get(path)` 类型完全等价, 可以直接 get;
 * - `d.inputs` 的 key 来自组件 props, `d.outputs` 的 key 来自组件 emits。
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
  // 只参与类型推断, 运行时不需要配置
  _config: C,
  cb: (define: DefineComponentEntry<S, UnwrapConfig<C>>) => readonly FieldEntry[],
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

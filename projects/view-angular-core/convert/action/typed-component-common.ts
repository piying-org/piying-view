import type { Observable } from 'rxjs';
import type * as v from 'valibot';
import type { PiFieldAtPath, PiFieldScopeOf } from '../../builder-base';
import type {
  PipeOf,
  VsPipeHost,
  VsWrappedHost,
  WrappedOf,
} from '../../builder-base/type/valibot-shape';
import type { KeyPath } from '../../util/type';
import type { ConfigAction } from './input-common';
import type { AsyncResult } from './type/async-callback';
import type {
  ActionFactories,
  ValibotAction,
  ValueOfField,
} from './typed-field-pipe';
import type {
  AnyOutputsHandlerMap,
  OutputEmitArgsOf,
  OutputListenFieldOf,
} from './output';
import type { ListenPathOf } from './value-change';

/**
 * 组件零 input / 零 output 时, 映射类型会退化成 `{}`。
 * TS 对 `{}` 目标不做多余属性检查, `patch({ 随便写: 1 })` 会静默通过,
 * 所以空映射一律换成 `Record<string, never>` 把 key 封住(空对象仍合法)。
 */
export type TightenEmpty<T extends Record<string, any>> = [keyof T] extends [never]
  ? Record<string, never>
  : T;

/** 组件的「值 -> 异步回调」映射: key 锁定为表上的名字, 回调里拿到路径推导出的 field */
export type AsyncValueMap<Values extends Record<string, any>, Field> = TightenEmpty<{
  [K in keyof Values]?: (field: Field) => AsyncResult<Values[K]>;
}>;

/**
 * 「值 -> 同步产出该值的回调」映射(mergeAsync 用)。
 * mergeAsync 运行时是同步取 handler, 不走 Promise/Observable, 所以不包 AsyncResult。
 */
export type HandlerValueMap<Values extends Record<string, any>, Field> =
  TightenEmpty<{
    [K in keyof Values]?: (field: Field) => NonNullable<Values[K]>;
  }>;

/**
 * 组件类型解析后的「表」基型 —— 框架与骨架的分界线。
 *
 * 框架侧只负责把组件类型翻译成这个形状:
 * Angular 读 `input()` / `output()` / `model()`,
 * Vue 读 `$props` 里的普通 prop 与 `onXxx` 处理器。
 *
 * 之后 core 的工厂只认这张表, 不再碰组件类型本身。
 * TS 没有 HKT, 没法把「组件类型 -> 表」的函数塞进 core,
 * 所以改成把表**打包成一个对象类型**, 顺着 `CompAction` 的配对通道流过去。
 */
export interface CompTables {
  inputKeys: string;
  inputsOrigin: Record<string, any>;
  outputKeys: string;
  outputsOrigin: Record<string, any>;
  outputsHandlerMap: AnyOutputsHandlerMap;
  modelKeys: string;
  modelsOrigin: Record<string, any>;
}

/**
 * 组件版 action 的类型。
 *
 * 第二个参数不出现在结构里, 全靠「同一泛型别名的逐实参配对推断」传递:
 * 工厂返回 `CompAction<F, T>`, 期望元素类型是 `CompAction<Field, 表>`,
 * TS 按别名身份把两侧实参配对, T 就反推成了这条 entry 的表。
 *
 * 因此工厂与 `CompEntryAction` 两侧必须都写 `CompAction`:
 * 任何一侧换成 `ConfigAction<F>` 或其他别名, 配对就断了,
 * T 拿不到候选而落到 unknown, 实参会塌成 `never`。
 */
export type CompAction<F, _T> = ConfigAction<F>;

/** 组件版 entry 的期望元素类型: 专用工厂(带表约束) 或 符合 valibot 定义的通用 action */
export type CompEntryAction<
  Root extends v.BaseSchema<any, any, any>,
  P extends KeyPath,
  T,
> =
  | CompAction<PiFieldAtPath<Root, P>, T>
  | ValibotAction<ValueOfField<PiFieldAtPath<Root, P>>>;

/** inputs 工厂: 值类型取自表, field 类型由 entry 的期望元素类型反推 */
export interface CompInputActionsFactory<Tables extends CompTables = CompTables> {
  patch: <F, T extends Tables = Tables>(
    value: T['inputsOrigin'],
  ) => CompAction<F, T>;
  set: <F, T extends Tables = Tables>(
    value: T['inputsOrigin'],
  ) => CompAction<F, T>;
  patchAsync: <
    F,
    T extends Tables = Tables,
    Data extends AsyncValueMap<T['inputsOrigin'], F> = AsyncValueMap<
      T['inputsOrigin'],
      F
    >,
  >(
    dataObj: Data,
  ) => CompAction<F, T>;
  remove: <F, T extends Tables = Tables>(
    list: T['inputKeys'][],
  ) => CompAction<F, T>;
  /**
   * map 运行时拿到的是「已解析的普通值对象」, 不是响应式引用,
   * 所以 value 用 origin 形态; 返回不做约束(就是返回一个新的值对象)。
   */
  mapAsync: <F, T extends Tables = Tables>(
    fn: (field: F) => (value: T['inputsOrigin']) => any,
  ) => CompAction<F, T>;
}

/** outputs 工厂: 值类型取自表, 与 inputs 同族 */
export interface CompOutputActionsFactory<Tables extends CompTables = CompTables> {
  patch: <F, T extends Tables = Tables>(
    value: T['outputsOrigin'],
  ) => CompAction<F, T>;
  set: <F, T extends Tables = Tables>(
    value: T['outputsOrigin'],
  ) => CompAction<F, T>;
  patchAsync: <
    F,
    T extends Tables = Tables,
    Data extends AsyncValueMap<T['outputsOrigin'], F> = AsyncValueMap<
      T['outputsOrigin'],
      F
    >,
  >(
    dataObj: Data,
  ) => CompAction<F, T>;
  remove: <F, T extends Tables = Tables>(
    list: T['outputKeys'][],
  ) => CompAction<F, T>;
  /** merge / mergeAsync 与 patch 同族, key 同样按表约束 */
  merge: <F, T extends Tables = Tables>(
    outputs: T['outputsOrigin'],
  ) => CompAction<F, T>;
  mergeAsync: <F, T extends Tables = Tables>(
    outputs: HandlerValueMap<T['outputsOrigin'], F>,
  ) => CompAction<F, T>;
  mapAsync: <F, T extends Tables = Tables>(
    fn: (field: F) => (value: T['outputsOrigin']) => any,
  ) => CompAction<F, T>;
}

/** models 工厂: 值是宿主侧的可写信号, 运行时走 twoWayBinding(key, signal) */
export interface CompModelActionsFactory<Tables extends CompTables = CompTables> {
  patch: <F, T extends Tables = Tables>(
    value: T['modelsOrigin'],
  ) => CompAction<F, T>;
  set: <F, T extends Tables = Tables>(
    value: T['modelsOrigin'],
  ) => CompAction<F, T>;
  patchAsync: <
    F,
    T extends Tables = Tables,
    Data extends AsyncValueMap<T['modelsOrigin'], F> = AsyncValueMap<
      T['modelsOrigin'],
      F
    >,
  >(
    dataObj: Data,
  ) => CompAction<F, T>;
  remove: <F, T extends Tables = Tables>(
    list: T['modelKeys'][],
  ) => CompAction<F, T>;
  mapAsync: <F, T extends Tables = Tables>(
    fn: (field: F) => (value: T['modelsOrigin']) => any,
  ) => CompAction<F, T>;
}

/**
 * outputChange 的单条监听项: 只有「监听自身(list 缺省)」才锁 output 名。
 *
 * 跨字段时 list 只是 schema 路径, 类型层拿不到目标组件
 * (`setComponent('radio')` 的 key 没进类型, 字段类型上的组件位是 any),
 * 硬按本条 entry 的组件约束会误报, 所以放开成 string。
 */
export type CompOutputChangeEntry<
  F,
  OutputName extends string = string,
> =
  | { list?: undefined; output: OutputName }
  | { list: Exclude<ListenPathOf<F>, undefined>; output: string };

/** 逐位对齐的回调流: list 为每项 output 触发时的参数数组, listenFields 与监听项逐位对齐 */
export interface CompOutputChangeStream<F, L, Outputs> {
  field: F;
  list: { [I in keyof L]: OutputEmitArgsOf<Outputs, L[I]> | undefined };
  listenFields: { [I in keyof L]: OutputListenFieldOf<F, L[I]> };
}

/**
 * 监听函数: 传入监听项元组, 返回与该元组逐位对齐的强类型流。
 * `const L` 保证 `['..', 'k1']` 这类字面量不会被拓宽成 `string[]`。
 */
export interface CompOutputChangeListenFn<
  F,
  OutputName extends string = string,
  Outputs extends AnyOutputsHandlerMap = AnyOutputsHandlerMap,
> {
  <const L extends readonly CompOutputChangeEntry<F, OutputName>[]>(
    list: [...L],
  ): Observable<CompOutputChangeStream<F, L, Outputs>>;
}

export type CompOutputChangeFn<
  F,
  OutputName extends string = string,
  Outputs extends AnyOutputsHandlerMap = AnyOutputsHandlerMap,
> = (fn: CompOutputChangeListenFn<F, OutputName, Outputs>) => void;

/**
 * events 的 key: 标准 DOM 事件名(lib.dom.d.ts 的 HTMLElementEventMap)保留补全与精确参数,
 * `string & {}` 放行自定义名 —— Web Component 的 `my-changed`、Angular 的
 * `window:resize` / `document:x` / `key.control.a` 都不在标准表里, 必须留口子。
 *
 * 代价: 自定义名与「标准名拼错」在类型上无法区分, 所以 clickk 不会报错。
 */
export type DomEventName = keyof HTMLElementEventMap;
export type EventName = DomEventName | (string & {});

/**
 * 标准事件参数精确到 Event 子类(click -> PointerEvent)。
 *
 * 自定义名必须用 `(...args: any[]) => any` 而不是 `(event: Event) => any`:
 * 索引签名比标准名的参数窄时, 逆变会让 `click: (e: PointerEvent) => void`
 * 反而过不了索引签名检查。放宽后顺带能直接标 `CustomEvent<Detail>`。
 */
export type DomEventHandler<K> = K extends DomEventName
  ? (event: HTMLElementEventMap[K]) => any
  : (...args: any[]) => any;
export type EventsHandlerMap = {
  [K in EventName]?: DomEventHandler<K>;
};
export type EventsAsyncHandlerMap<F> = {
  [K in EventName]?: (field: F) => DomEventHandler<K>;
};

/** events 与组件无关, 只把 key 收在「标准 DOM 事件 ∪ 任意自定义名」 */
export interface TypedComponentEventsActionsFactory {
  patch: <F, T extends CompTables = CompTables>(
    value: EventsHandlerMap,
  ) => CompAction<F, T>;
  set: <F, T extends CompTables = CompTables>(
    value: EventsHandlerMap,
  ) => CompAction<F, T>;
  patchAsync: <
    F,
    T extends CompTables = CompTables,
    Data extends EventsAsyncHandlerMap<F> = EventsAsyncHandlerMap<F>,
  >(
    dataObj: Data,
  ) => CompAction<F, T>;
  remove: <F, T extends CompTables = CompTables>(
    list: EventName[],
  ) => CompAction<F, T>;
  mapAsync: <F, T extends CompTables = CompTables>(
    fn: (field: F) => (value: EventsHandlerMap) => any,
  ) => CompAction<F, T>;
}

export type TypesOf<Cfg> = NonNullable<
  Cfg extends { types?: infer T } ? T : never
>;

/**
 * wrappers 的 key: 对齐配置里 `wrappers` 的 key。
 * 运行时 `defaultWrapperMetadataGroup` 就是 `fieldGlobalConfig.wrappers`,
 * 合法名只有这一份, 没有内置魔法名; 配置里没声明时降级成裸 string, 不封死。
 */
export type WrappersOf<Cfg> = NonNullable<
  Cfg extends { wrappers?: infer W } ? W : never
>;
export type WrapperNameOf<Cfg> = keyof WrappersOf<Cfg> & string;
export type WrapperNameInput<Cfg> = [WrapperNameOf<Cfg>] extends [never]
  ? string
  : WrapperNameOf<Cfg>;

/** 对象形态的 wrapper 定义(`{ type: X, ... }`), 从通用工厂参数里扣出来复用 */
export type WrapperEntryObj = Exclude<
  Parameters<ActionFactories['wrappers']['set']>[0][number],
  string
>;

/** wrappers: 名字形态收在配置声明的 key 上, 对象形态原样保留 */
export interface TypedWrappersActionsFactory<Cfg> {
  set: <F, T extends CompTables = CompTables>(
    wrappers: (WrapperEntryObj | WrapperNameInput<Cfg>)[],
  ) => CompAction<F, T>;
  patch: <F, T extends CompTables = CompTables>(
    wrappers: (WrapperEntryObj | WrapperNameInput<Cfg>)[],
  ) => CompAction<F, T>;
  patchAsync: <F, T extends CompTables = CompTables>(
    type: WrapperEntryObj | WrapperNameInput<Cfg>,
    actions?: ConfigAction<any>[],
    options?: { insertIndex?: number },
  ) => CompAction<F, T>;
  remove: <F, T extends CompTables = CompTables>(
    list: WrapperNameInput<Cfg>[] | ((list: any) => any),
  ) => CompAction<F, T>;
}

/**
 * 组件版 action 工厂集合: inputs / outputs / models / outputChange 换成表约束形态。
 *
 * `Tables` 只是配对通道上的**上界**; 真正生效的表由 entry 的期望元素类型反推,
 * 所以框架侧直接复用这一份即可, 不需要按组件再写一遍。
 */
export type CompActionFactoriesOf<
  Tables extends CompTables = CompTables,
  Cfg = unknown,
> = Omit<
  ActionFactories,
  'inputs' | 'outputs' | 'models' | 'outputChange' | 'events' | 'wrappers'
> & {
  inputs: CompInputActionsFactory<Tables>;
  outputs: CompOutputActionsFactory<Tables>;
  models: CompModelActionsFactory<Tables>;
  events: TypedComponentEventsActionsFactory;
  wrappers: Omit<
    ActionFactories['wrappers'],
    'set' | 'patch' | 'patchAsync' | 'remove'
  > &
    TypedWrappersActionsFactory<Cfg>;
  /** 与 outputs 同族: 靠 CompAction 别名配对把表送进回调内部的 output 名约束 */
  outputChange: <F, T extends Tables = Tables>(
    fn: CompOutputChangeFn<F, T['outputKeys'], T['outputsHandlerMap']>,
  ) => CompAction<F, T>;
};

/** 兼容直接传 fieldGlobalConfig, 也兼容 typedComponent() 的返回值 */
export type UnwrapConfig<C> = C extends { define: infer D } ? D : C;

/**
 * 剥到「决定 type 的那一层」, 与 valibot-visit 的 flatSchema + defineSchema 对齐:
 * - pipe 只看首成员, 其余成员是校验/转换, 不参与 type;
 * - wrapped(optional/nullable/...) 只改 undefinedable/nullable 标记, 不改 type, 一路向内;
 *   注意 `pipe(optional(x), ...)` 在类型上同样保留了 `wrapped`, 所以会走 wrapped 分支,
 *   与运行时「wrapped 被摘出去」的行为一致。
 */
type PlainSchemaOf<S> = S extends VsPipeHost
  ? PipeOf<S> extends readonly [infer H, ...any[]]
    ? PlainSchemaOf<H>
    : never
  : S extends VsWrappedHost
    ? WrappedOf<S> extends infer W
      ? PlainSchemaOf<W>
      : never
    : S;

/**
 * 该路径 schema 节点的「运行时 type」, 也就是配置 `types` 的默认 key。
 *
 * 运行时 `builder` 就是拿 `field.type` 去 `globalConfig.types` 里查组件,
 * 而 `field.type` 直接来自 schema 节点的 `type` 字段(见 defineSchema)。
 * 所以「不指定组件」时, 类型层用同一个值去查配置, 两边不会跑偏。
 */
export type SchemaTypeAt<
  Root extends v.BaseSchema<any, any, any>,
  P extends KeyPath,
> =
  PlainSchemaOf<PiFieldScopeOf<PiFieldAtPath<Root, P>>['schema']> extends {
    readonly type: infer T;
  }
    ? T extends string
      ? T
      : never
    : never;

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
  FieldEntry,
  ValibotAction,
  ValueOfField,
} from './typed-field-pipe';
import { setComponent } from './component';
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
export type TightenEmpty<T extends Record<string, any>> = [keyof T] extends [
  never,
]
  ? Record<string, never>
  : T;

/** 组件的「值 -> 异步回调」映射: key 锁定为表上的名字, 回调里拿到路径推导出的 field */
export type AsyncValueMap<
  Values extends Record<string, any>,
  Field,
> = TightenEmpty<{
  [K in keyof Values]?: (field: Field) => AsyncResult<Values[K]>;
}>;

/**
 * 「值 -> 同步产出该值的回调」映射(mergeAsync 用)。
 * mergeAsync 运行时是同步取 handler, 不走 Promise/Observable, 所以不包 AsyncResult。
 */
export type HandlerValueMap<
  Values extends Record<string, any>,
  Field,
> = TightenEmpty<{
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
export interface CompInputActionsFactory<
  Tables extends CompTables = CompTables,
> {
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
export interface CompOutputActionsFactory<
  Tables extends CompTables = CompTables,
> {
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
export interface CompModelActionsFactory<
  Tables extends CompTables = CompTables,
> {
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
 * 跨字段时 list 只是 schema 路径, 目标组件还可能被那条 entry 显式改写
 * (d(['other'], 'otherComp', [...]) 这种写法从当前字段类型里看不全),
 * 硬按本条 entry 的组件约束会误报, 所以放开成 string。
 */
export type CompOutputChangeEntry<F, OutputName extends string = string> =
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

/** `setComponent('xxx')` 落到 schema 上的就是 valibot-visit 的 defineType 动作 */
type DefineTypeShape = {
  readonly type: 'defineType';
  readonly value: string;
};

/**
 * `setComponent(组件类)` 走的是 rawConfig 分支, 组件本身留在 `__type` 上。
 *
 * 运行时 builder 对非 string 的 `field.type` 不查配置, 直接拿来当组件用。
 */
type ComponentInstanceShape = {
  readonly __type: unknown;
};

/**
 * 显式组件标识的包装, rank 表达跨形态优先级。
 *
 * 运行时 `#getDefineType`(处理 string 版 defineType) 先跑, 组件类走的 `rawConfig`
 * 要到 initMetadata 才执行, 所以**组件类总是盖过 string, 与书写顺序无关**;
 * 同一形态内部仍是后写覆盖先写。
 */
type NoExplicitKey = {
  readonly rank: -1;
  readonly key: never;
};
type StringKey<K extends string> = {
  readonly rank: 0;
  readonly key: K;
};
type ClassKey<C> = {
  readonly rank: 1;
  readonly key: C;
};

type RankOf<T> = T extends { readonly rank: infer R } ? R : -1;

/** 两个候选取优: rank 大者胜, 同 rank 取 a(在 pipe 里更靠尾) */
type BetterKey<A, B> = [RankOf<A>] extends [1]
  ? A
  : [RankOf<B>] extends [1]
    ? B
    : [RankOf<A>] extends [0]
      ? A
      : [RankOf<B>] extends [0]
        ? B
        : A;

/**
 * 只找「显式写下的组件标识」(setComponent), 找不到返回 NoExplicitKey。
 *
 * 与运行时同构: pipe 成员、wrapped 内层都要往里看, 但绝不回落到 schema 自身的 `type`。
 */
type ExplicitComponentKeyOf<S> = S extends ComponentInstanceShape
  ? ClassKey<S['__type']>
  : S extends DefineTypeShape
    ? StringKey<S['value']>
    : S extends VsPipeHost
      ? PipeOf<S> extends readonly unknown[]
        ? ExplicitComponentKeyInPipe<PipeOf<S>>
        : NoExplicitKey
      : S extends VsWrappedHost
        ? ExplicitComponentKeyOf<WrappedOf<S>>
        : NoExplicitKey;

/** 从尾往头扫, 同 rank 时尾部那个赢 */
type ExplicitComponentKeyInPipe<P extends readonly unknown[]> =
  P extends readonly [...infer Rest, infer Last]
    ? BetterKey<ExplicitComponentKeyOf<Last>, ExplicitComponentKeyInPipe<Rest>>
    : NoExplicitKey;

/** 没有 setComponent 时, 才回落到 schema 节点自身的 `type` */
type BuiltinTypeOf<S> =
  PlainSchemaOf<S> extends { readonly type: infer T }
    ? T extends string
      ? T
      : never
    : never;

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
 * 显式 setComponent 优先, 否则用 schema 自身的 type。
 * 先用 infer 把递归结果落一次, 避免同一个递归类型被求值两次。
 */
type ComponentKeyOfNode<S> =
  ExplicitComponentKeyOf<S> extends infer E
    ? [E] extends [NoExplicitKey]
      ? BuiltinTypeOf<S>
      : E extends { readonly key: infer K }
        ? K
        : never
    : never;

/**
 * 该路径最终生效的「组件标识」:
 * - `setComponent('radio')` -> 'radio', 运行时拿它去 `globalConfig.types` 查组件;
 * - `setComponent(SomeComponent)` -> SomeComponent, 运行时不查配置直接用它;
 * - 都没写 -> schema 自身的 `type`(如 'string')。
 */
export type ComponentKeyAt<
  Root extends v.BaseSchema<any, any, any>,
  P extends KeyPath,
> = ComponentKeyOfNode<PiFieldScopeOf<PiFieldAtPath<Root, P>>['schema']>;

/**
 * 该路径的 string 型组件 key, 也就是配置 `types` 的 key。
 *
 * `setComponent(组件类)` 这种不查配置的形态在这里落到 never,
 * 需要完整标识(含组件类)时用 `ComponentKeyAt`。
 */
export type SchemaTypeAt<
  Root extends v.BaseSchema<any, any, any>,
  P extends KeyPath,
> =
  ComponentKeyAt<Root, P> extends infer T
    ? T extends string
      ? T
      : never
    : never;

/**
 * attributes 的共通骨架: 只把「属性名」参数化, 值一律 any。
 *
 * 各框架 HTML 属性名的来源不同(Vue 的 HTMLAttributes / React 的 HTMLAttributes / ...),
 * 但 action 的形状完全一致, 所以新框架接进来时只要传自己的 AttrName, 不必重抄这一份。
 */
export interface TypedAttributesActionsFactory<AttrName extends string> {
  patch: <F, T extends CompTables = CompTables>(
    value: Partial<Record<AttrName, any>>,
  ) => CompAction<F, T>;
  set: <F, T extends CompTables = CompTables>(
    value: Partial<Record<AttrName, any>>,
  ) => CompAction<F, T>;
  patchAsync: <
    F,
    T extends CompTables = CompTables,
    Data extends AsyncValueMap<Partial<Record<AttrName, any>>, F> =
      AsyncValueMap<Partial<Record<AttrName, any>>, F>,
  >(
    dataObj: Data,
  ) => CompAction<F, T>;
  remove: <F, T extends CompTables = CompTables>(
    list: AttrName[],
  ) => CompAction<F, T>;
  mapAsync: <F, T extends CompTables = CompTables>(
    fn: (field: F) => (value: Partial<Record<AttrName, any>>) => any,
  ) => CompAction<F, T>;
  top: {
    set: <F, T extends CompTables = CompTables>(
      value: Partial<Record<AttrName, any>>,
    ) => CompAction<F, T>;
    patch: <F, T extends CompTables = CompTables>(
      value: Partial<Record<AttrName, any>>,
    ) => CompAction<F, T>;
  };
}

/**
 * 「不消费 field.models」的框架共用的工厂集合:
 * 摘掉 `models` 与 `attributes`, 后者换成按 AttrName 约束的那一份。
 *
 * 需要 models 的框架(如 Angular)不要用它, 直接组 `CompActionFactoriesOf` 即可。
 */
export type TypedComponentActionFactoriesOf<
  Cfg = unknown,
  AttrName extends string = string,
> = Omit<CompActionFactoriesOf<CompTables, Cfg>, 'models' | 'attributes'> & {
  attributes: TypedAttributesActionsFactory<AttrName>;
};

/**
 * 「路径 + 可选组件 + actions」的 entry 工厂, 各框架共用一份运行时。
 *
 * component 省略或显式传 undefined 时**不下发 `setComponent`**:
 * 字段保留 schema 自己的 `type`, 运行时由 builder 按 `globalConfig.types` 查默认组件,
 * 与类型层 `SchemaTypeAt` 反推的表同源。
 *
 * 返回未标注类型, 由调用方 cast 成自己的 `DefineComponentEntry` ——
 * 「组件 -> 表」是框架绑定层, 不在这里参数化。
 */
export function createDefineComponentEntry(typedActions: object): object {
  return Object.assign((path: KeyPath, ...args: any[]): FieldEntry => {
    const [component, actions] = args.length > 1 ? args : [undefined, args[0]];
    return {
      path,
      actions:
        component === undefined
          ? (actions ?? [])
          : [setComponent(component), ...(actions ?? [])],
    };
  }, typedActions);
}

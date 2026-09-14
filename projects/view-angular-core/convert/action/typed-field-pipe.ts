import * as v from 'valibot';
import { ClassValue } from 'clsx';
import {
  HookConfig,
  PiFieldAtPath,
  PiFieldTypeRef,
  _PiResolvedCommonViewFieldConfig,
} from '../../builder-base/type/common-field-config';
import {
  EntriesOf,
  ItemOf,
  ItemsOf,
  OptionsOf,
  PipeOf,
  ValueNodeOf,
  VsEntriesHost,
  VsOptionsHost,
  VsPipeHost,
  VsTupleHost,
  VsValueHost,
  VsWrappedHost,
  WrappedOf,
} from '../../builder-base/type/valibot-shape';
import { KeyPath } from '../../util';
import { __actions } from './input-common';
import type { ConfigAction } from './input-common';
import { classAction } from './class';
import { wrappers } from './wrapper';
import { mergeHooks, removeHooks, setHooks, patchHooks } from './hook';
import { setProviders, patchProviders, changeProviders } from './provider';
import { hideWhen } from './hide-when';
import type { HideWhenOption } from './hide-when';
import { disableWhen } from './disable-when';
import type { DisableWhenOption } from './disable-when';
import { valueChange } from './value-change';
import type { ValueChangeFn } from './value-change';
import type { AsyncCallback, AsyncResult } from './type/async-callback';

/* ---------------- 类型: 未绑定 field 的 action 工厂 ---------------- */

/**
 * 带 field 回调的 action 统一用这个约束承接路径推导出的字段类型。
 * 约束本身很松(所有字段形态都满足), 目的是让 F 能从期望返回类型反推。
 */
type AnyField = _PiResolvedCommonViewFieldConfig;

/**
 * 与「已绑定 field」的写法同构, 但 F 不写在类型上,
 * 而是由 `d(path, [...])` 的期望元素类型 `ConfigAction<F>` 反推。
 *
 * 两条铁律(改这里之前先看):
 * 1. F 不给默认值 —— 反推不到时落到 unknown, 用错会直接报错, 不会静默退化;
 * 2. F 必须出现在返回类型里 —— 只藏在实参里, TS 拿不到上下文候选。
 */
interface KeyGroupFactory {
  patch: <F>(value: Record<string, any>) => ConfigAction<F>;
  set: <F>(value: Record<string, any>) => ConfigAction<F>;
  patchAsync: <F, Data extends Record<string, (field: F) => AsyncResult<any>>>(
    dataObj: Data,
  ) => ConfigAction<F>;
  remove: <F>(list: string[]) => ConfigAction<F>;
  mapAsync: <F>(fn: (field: F) => (value: any) => any) => ConfigAction<F>;
}

interface OutputsGroupFactory extends Omit<KeyGroupFactory, 'patchAsync'> {
  patch: <F>(value: Record<string, (...args: any[]) => any>) => ConfigAction<F>;
  set: <F>(value: Record<string, (...args: any[]) => any>) => ConfigAction<F>;
  patchAsync: <
    F,
    Data extends Record<string, (field: F) => (...args: any[]) => any>,
  >(
    dataObj: Data,
  ) => ConfigAction<F>;
  /** merge / mergeAsync 与 patch 同族, 回调里的 field 同样要精确 */
  merge: <F>(
    outputs: Record<string, (...args: any[]) => void>,
  ) => ConfigAction<F>;
  mergeAsync: <F extends AnyField>(
    outputs: Record<string, (field: F) => (...args: any[]) => void>,
  ) => ConfigAction<F>;
}

interface EventsGroupFactory extends Omit<KeyGroupFactory, 'patchAsync'> {
  patch: <F>(value: Record<string, (event: Event) => any>) => ConfigAction<F>;
  set: <F>(value: Record<string, (event: Event) => any>) => ConfigAction<F>;
  patchAsync: <
    F,
    Data extends Record<string, (field: F) => (event: Event) => any>,
  >(
    dataObj: Data,
  ) => ConfigAction<F>;
}

interface AttributesGroupFactory extends KeyGroupFactory {
  top: {
    set: <F>(value: Record<string, any>) => ConfigAction<F>;
    patch: <F>(value: Record<string, any>) => ConfigAction<F>;
  };
}

interface HooksGroupFactory {
  set: <F>(hooks: HookConfig<F>) => ConfigAction<F>;
  patch: <F>(hooks: HookConfig<F>) => ConfigAction<F>;
  merge: <F>(
    hooks: HookConfig<F>,
    options?: { position: 'top' | 'bottom' },
  ) => ConfigAction<F>;
  remove: <F>(list: (keyof HookConfig<F>)[]) => ConfigAction<F>;
}

/** 挂在 `d` 上的全部 action 工厂, F 由每条 entry 的期望元素类型各自反推 */
export interface ActionFactories {
  props: KeyGroupFactory;
  inputs: KeyGroupFactory;
  models: KeyGroupFactory;
  slots: KeyGroupFactory;
  attributes: AttributesGroupFactory;
  outputs: OutputsGroupFactory;
  events: EventsGroupFactory;
  hooks: HooksGroupFactory;
  createOptions: {
    patch: <F>(value: any) => ConfigAction<F>;
    set: <F>(value: any) => ConfigAction<F>;
  };
  providers: {
    set: typeof setProviders;
    patch: typeof patchProviders;
    change: typeof changeProviders;
  };
  /**
   * class 族: 同步形态不涉 field, 异步形态的回调必须拿到路径精确的 field。
   * 这里重新声明而不是 `typeof classAction`: 底层函数把 field 写死成了松散形态。
   */
  class: {
    top: <F>(className: ClassValue, merge?: boolean) => ConfigAction<F>;
    bottom: <F>(className: ClassValue, merge?: boolean) => ConfigAction<F>;
    component: <F>(className: ClassValue, merge?: boolean) => ConfigAction<F>;
    asyncTop: <F extends AnyField>(
      classNameFn: AsyncCallback<ClassValue, F>,
    ) => ConfigAction<F>;
    asyncBottom: <F extends AnyField>(
      classNameFn: AsyncCallback<string, F>,
    ) => ConfigAction<F>;
    asyncComponent: <F extends AnyField>(
      classNameFn: AsyncCallback<string, F>,
    ) => ConfigAction<F>;
  };
  wrappers: typeof wrappers;
  hideWhen: <F extends AnyField>(options: HideWhenOption<F>) => ConfigAction<F>;
  disableWhen: <F extends AnyField>(
    options: DisableWhenOption<F>,
  ) => ConfigAction<F>;
  valueChange: <F extends AnyField>(
    listenFn: ValueChangeFn<F>,
  ) => ConfigAction<F>;
}

/** 收集到的一条「路径 -> actions」 */
export interface FieldEntry {
  readonly path: KeyPath;
  readonly actions: readonly any[];
}

/**
 * 递归深度上限, 防止病态宽 schema 组合爆炸。
 *
 * 预算只按「消耗了一个路径段的跳转」计: object key / tuple 下标 / array 下标 /
 * record|map|set 的 value 跳转。pipe 与 wrapped 不产生 key, 因此**不消耗预算**
 * (见 `NodeDeepPaths`), 长 wrapped/pipe 链不会再莫名截断。
 * 预算耗尽后 `PathsOfCore` 直接收到 `[]`, 不再往下展开。
 */
type PathDepth = [
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
];

/**
 * 不透明节点: 自带改变自身行为的附加属性, 重建会静默丢失, 因此禁止下钻。
 * (节点自身仍是合法终点, 只是不能再往里走)
 */
type VsOpaqueHost =
  | { readonly fallback: unknown }
  | { readonly cache: unknown };

/** 元组的下标 key: '0' | '1' ... */
type IndexKey<T extends readonly any[]> = Extract<keyof T, `${number}`>;

/** '0' -> 0 */
type ToIndex<K> = K extends `${infer N extends number}` ? N : never;

/** 下标型容器(tuple / intersect / union / variant)的单条路径: [下标, 该成员的后续路径] */
type IdxPath<T, K, D extends readonly unknown[]> = [
  ToIndex<K>,
  ...PathsOfCore<T[K & keyof T], D>,
];

/** 下标型容器(tuple / intersect / union / variant): 下标 -> 该下标的后续路径 */
type IndexedPathsOf<T, D extends readonly unknown[]> = T extends readonly any[]
  ? { [K in IndexKey<T>]: IdxPath<T, K, D> }[IndexKey<T>]
  : never;

/** object 族的单条路径: [key, 该字段的后续路径] */
type EntryPath<
  E extends Record<string, any>,
  K extends keyof E & string,
  D extends readonly unknown[],
> = [K, ...PathsOfCore<E[K], D>];

/** object 族: key -> 该字段的后续路径 */
type EntriesPathsOf<E, D extends readonly unknown[]> =
  E extends Record<string, any>
    ? { [K in keyof E & string]: EntryPath<E, K, D> }[keyof E & string]
    : never;

/**
 * 到达某个 schema 节点后「还能继续往下写」的路径。
 * 每个节点自身也是合法终点, 所以固定并上 `[]` ——
 * 否则叶子节点的 `never` 会把 `[K, ...never]` 整条路径吞掉。
 */
type NodePathsOf<S, D extends readonly unknown[]> = [] | NodeDeepPaths<S, D>;

/**
 * record / map 的 key 节点 -> 可寻址的路径段类型。
 * 运行时该段只是「进 value 节点」的占位, 不参与重建:
 * record 只有一个 value 节点, 所以挂在 `['rec', 'k1', 'x']` 上的 action
 * 实际对**所有** entry 生效, `k1` 本身被丢弃。
 * 但类型上按 key schema 的输出收窄, 避免一律 `string | number`。
 * set 没有 key 节点, 落到 `string | number`。
 *
 * 已知缺口: map 的 entry 在运行时不会生成可寻址 field,
 * 所以 `['map', k, 'x']` 类型上合法但 action 不触发(见对应 spec)。
 */
type KeySegmentOf<S> = (
  S extends v.RecordSchema<infer K, any, any>
    ? K
    : S extends v.MapSchema<infer K, any, any>
      ? K
      : never
) extends infer K
  ? [K] extends [never]
    ? string | number
    : K extends v.BaseSchema<any, infer KO, any>
      ? [KO] extends [never]
        ? string | number
        : KO extends string
          ? string
          : KO extends number
            ? number
            : string | number
      : string | number
  : string | number;

/**
 * 单个 schema 节点的「下钻路径」, 与运行时 `mergeAt` 的分支顺序严格一一对应:
 * pipe -> 只进第一个成员; wrapped -> 向内; entries -> 按 key;
 * array -> 一段进 item; tuple / intersect / union / variant -> 按下标;
 * record / map / set -> 一段进 value 节点。
 *
 * 必须先认 pipe: `SchemaWithPipe` 在类型上保留了首成员的 entries 等字段。
 *
 * pipe / wrapped 走 `NodePathsOf` 而非 `PathsOfCore`: 它们不产生 key, 所以不消耗深度预算。
 * 两者都是「一层跳一层」的线性结构, 不会重复展开内层子树 ——
 * 实例化缓存以 (schema, 剩余预算) 为键, 不消耗预算反而让同一节点只展开一次。
 * 每个提取结果均经 `extends infer X` 绑定一次再往下传: 提取类(如 `WrappedOf`)返回的是
 * 未解析的条件类型, 直接当 `S` 传下去会让 `S extends VsPipeHost`(交叉类型)做昂贵的
 * 结构比较, 直接 TS2589。
 */
type NodeDeepPaths<S, D extends readonly unknown[]> = S extends VsOpaqueHost
  ? never
  : S extends VsPipeHost
    ? PipeOf<S> extends readonly [infer H, ...any[]]
      ? NodePathsOf<H, D>
      : never
    : S extends VsWrappedHost
      ? WrappedOf<S> extends infer W
        ? NodePathsOf<W, D>
        : never
      : S extends VsEntriesHost
        ? EntriesOf<S> extends infer E
          ? EntriesPathsOf<E, D>
          : never
        : S extends v.ArraySchema<any, any>
          ? ItemOf<S> extends infer I
            ? [number, ...PathsOfCore<I, D>]
            : never
          : S extends VsTupleHost
            ? ItemsOf<S> extends infer IT
              ? IndexedPathsOf<IT, D>
              : never
            : S extends VsOptionsHost
              ? OptionsOf<S> extends infer OP
                ? IndexedPathsOf<OP, D>
                : never
              : S extends VsValueHost
                ? ValueNodeOf<S> extends infer VN
                  ? [KeySegmentOf<S>, ...PathsOfCore<VN, D>]
                  : never
                : never;

/**
 * 路径联合的核心实现。
 *
 * 注意: 参数是 **schema 本身**, 不是 `v.InferOutput`。
 * 值类型上不存在「intersect/union 的第 N 个成员」这类结构路径(交叉类型会被合并、
 * Map/Set 无隐式索引签名), 基于值类型推导根本写不出 `[0, 'a']`。
 *
 * 也不包含 '#' / '..' / '@alias': pipe 只按结构下钻合并,
 * 这些「作用域解析」专用的段在合并侧没有落点, 写了就是运行期抱错。
 * 回调里的 `field.get([...])` 走 `KeyPath`, 不受此约束, 依旧可用。
 */
type PathsOfCore<S, D extends readonly unknown[]> = D extends [
  unknown,
  ...infer R,
]
  ? [] | NodePathsOf<S, R>
  : [];

/**
 * 由 schema 结构逐段展开「合法路径联合」, 让写错的路径在编译期就报错。
 * D 用于限深, 防止宽 schema 发生组合爆炸。
 */
export type PathsOf<S, D extends readonly unknown[] = PathDepth> = PathsOfCore<
  S,
  D
>;

/**
 * `PathsOf` 的别名, 保留给组件版 pipe(typedFieldComponentPipe)使用。
 * 两者实现完全一致 —— 特殊段('#' / '..' / '@alias')在两个 pipe 里都不参与合并,
 * 所以不存在「组件版才有纯字段路径」的差异, 只是历史名字。
 */
export type FieldPathsOf<S, D extends readonly unknown[] = PathDepth> = PathsOf<
  S,
  D
>;

/** 从字段类型反查 schema, 再取其输出类型(pipe 之后的 value) */
export type ValueOfField<F> =
  (
    F extends { __piTypes?: PiFieldTypeRef<infer S, any, any, any> } ? S : never
  ) extends v.BaseSchema<any, infer O, any>
    ? O
    : never;

/**
 * 官方通用 action。
 *
 * 靠 valibot 的 `kind` 判别式与 ConfigAction 分流, 两者不抢推断候选:
 * - validation / transformation 的回调参数拿到该路径的精确 value 类型;
 * - metadata 类只能用泛型擦除结构兜底 —— 它的 kind 与 ConfigAction 同为 'metadata',
 *   若改用 BaseMetadata<V> 会双喂候选, 把 F 污染成 `V | Field`。
 */
export type ValibotAction<V> =
  | v.BaseSchema<V, any, v.BaseIssue<unknown>>
  | v.BaseSchemaAsync<V, any, v.BaseIssue<unknown>>
  | v.BaseValidation<V, V, v.BaseIssue<unknown>>
  | v.BaseValidationAsync<V, V, v.BaseIssue<unknown>>
  | v.BaseTransformation<V, unknown, v.BaseIssue<unknown>>
  | v.BaseTransformationAsync<V, unknown, v.BaseIssue<unknown>>
  | { readonly kind: 'metadata'; readonly type: string };

/**
 * 该路径下 action 的期望元素类型。
 *
 * - 专用工厂(ConfigAction): 决定回调里 field 的具体类型;
 * - 官方 action: 按 valibot 定义直接可塞, 回调参数按该路径的 value 精确。
 */
export type FieldActionOf<
  Root extends v.BaseSchema<any, any, any>,
  P extends KeyPath,
> =
  | ConfigAction<PiFieldAtPath<Root, P>>
  | ValibotAction<ValueOfField<PiFieldAtPath<Root, P>>>;

/**
 * 定义单条 entry: 路径 + 该路径下的 actions。
 *
 * - 路径 P 由第一个实参推断, 写错编译期报错;
 * - actions 的期望类型是 `ConfigAction<PiFieldAtPath<Root, P>>`,
 *   工厂上的 F 由此反推, 所以 `d.props.patchAsync({ x: (field) => ... })`
 *   里的 field 与 `builder.get(path)` 完全等价(自身 / 父级 / 根级 / 别名)。
 *
 * 注意: 工厂调用必须写在本次的 actions 数组里, 提前存到变量会丢上下文。
 */
export interface DefineEntry<
  Root extends v.BaseSchema<any, any, any>,
> extends ActionFactories {
  <P extends PathsOf<Root>>(
    path: [...P],
    actions: readonly FieldActionOf<Root, P>[],
  ): FieldEntry;
}

/* ---------------- 运行时: 把 actions 按路径合并进 schema ---------------- */

/**
 * pipe 可用的完整 action 表。
 * 组件版(typedFieldComponentPipe)要复用同一份, 所以导出复用而不是另拼一份,
 * 避免两边集合不同步(比如漏了 hideWhen / disableWhen)。
 *
 * 注意不要写 `: any`: 下面 `AssertActionsShape` 靠推断出的真实键集合来做对齐。
 */
export const ɵtypedFieldActions = {
  ...__actions,
  hooks: {
    merge: mergeHooks,
    remove: removeHooks,
    set: setHooks,
    patch: patchHooks,
  },
  providers: {
    set: setProviders,
    patch: patchProviders,
    change: changeProviders,
  },
  class: classAction,
  wrappers,
  hideWhen,
  disableWhen,
  valueChange,
};

/**
 * 编译期对齐: 只校「键集合 + 嵌套层级」。
 *
 * `ActionFactories` 是强类型门面, 运行时函数是泛型擦除形态, 两者本来就不是同一个类型,
 * 但键必须一一对应 —— 运行时漏挂 / 改名, 这里直接编译报错, 而不是拖到运行期抱错。
 */
type ActionShape<A> = {
  [K in keyof A]: A[K] extends (...args: any[]) => any
    ? unknown
    : ActionShape<Extract<A[K], object>>;
};
type AssertAssignable<T extends U, U> = T;
type _AssertActionsShape = AssertAssignable<
  typeof ɵtypedFieldActions,
  ActionShape<ActionFactories>
>;

type AnySchema = v.BaseSchema<any, any, any>;

/** pipe 节点, pipe 成员本身可以是 pipe, 所以能任意嵌套 pipe(pipe(pipe())) */
type PipeSchema = v.SchemaWithPipe<readonly [AnySchema, ...any[]]>;
/** object 族 */
type EntriesSchema =
  | v.ObjectSchema<any, any>
  | v.LooseObjectSchema<any, any>
  | v.StrictObjectSchema<any, any>
  | v.ObjectWithRestSchema<any, any, any>;
/** tuple 族 */
type ItemsSchema =
  | v.TupleSchema<any, any>
  | v.LooseTupleSchema<any, any>
  | v.StrictTupleSchema<any, any>
  | v.TupleWithRestSchema<any, any, any>;
/** intersect / union / variant */
type OptionsSchema =
  | v.IntersectSchema<any, any>
  | v.UnionSchema<any, any>
  | v.VariantSchema<any, any, any>;
/** record / map / set */
type ValueSchema =
  | v.RecordSchema<any, any, any>
  | v.MapSchema<any, any, any>
  | v.SetSchema<any, any>;
/** wrapped 家族 */
type WrappedSchema =
  | v.OptionalSchema<any, any>
  | v.NullableSchema<any, any>
  | v.NullishSchema<any, any>
  | v.ExactOptionalSchema<any, any>
  | v.UndefinedableSchema<any, any>
  | v.NonNullableSchema<any, any>
  | v.NonNullishSchema<any, any>
  | v.NonOptionalSchema<any, any>;

/** 可重建的非 pipe 容器节点, 全部取自 valibot 自带的 schema 类型 */
type RebuildSchema =
  | EntriesSchema
  | v.ArraySchema<any, any>
  | ItemsSchema
  | OptionsSchema
  | ValueSchema
  | WrappedSchema;

const isPipeSchema = (s: AnySchema): s is PipeSchema => 'pipe' in s;
const isEntriesSchema = (s: AnySchema): s is EntriesSchema => 'entries' in s;
const isItemSchema = (s: AnySchema): s is v.ArraySchema<any, any> =>
  'item' in s;
const isItemsSchema = (s: AnySchema): s is ItemsSchema => 'items' in s;
/** options 只有 intersect/union/variant 是子 schema 列表(picklist/enum 的是值列表) */
const isOptionsSchema = (s: AnySchema): s is OptionsSchema =>
  'options' in s &&
  (s.type === 'intersect' || s.type === 'union' || s.type === 'variant');
const isValueSchema = (s: AnySchema): s is ValueSchema => 'value' in s;
/** wrapped 只出现在 optional/nullable/nullish, 不会与其他子结构字段共存 */
const isWrappedSchema = (s: AnySchema): s is WrappedSchema => 'wrapped' in s;

/** 重建补丁: key 必须是容器节点的子结构字段名 */
type RebuildPatch = {
  [K in 'entries' | 'item' | 'items' | 'options' | 'value' | 'wrapped']?: any;
};

/**
 * 追加 actions: 把原 schema 整体当作一层, 在外层再包一个 pipe。
 * 不能拆散原 pipe —— 展平会改变原节点的层级结构,
 * 而 pipe 本身可以任意嵌套(pipe(pipe(pipe()))), 遍历侧会自行展开。
 */
function appendActions(s: AnySchema, actions: readonly any[]) {
  if (!actions.length) return s;
  return v.pipe(s, ...actions);
}

/** 重建容器节点: 只能用 valibot 公开构造函数, 浅拷贝会让 ~standard 仍指向旧结构 */
function rebuild(s: RebuildSchema, changed: RebuildPatch) {
  // fallback / cache 挂在节点自身上, 公开构造函数无法还原, 重建会静默丢行为
  if ('fallback' in s || 'cache' in s) {
    throw new Error('[typedFieldPipe] 不支持在 fallback/cache 节点下下钻');
  }
  switch (s.type) {
    case 'object':
      return v.object(changed.entries, s.message);
    case 'loose_object':
      return v.looseObject(changed.entries, s.message);
    case 'strict_object':
      return v.strictObject(changed.entries, s.message);
    case 'object_with_rest':
      return v.objectWithRest(changed.entries, s.rest, s.message);
    case 'array':
      return v.array(changed.item, s.message);
    case 'tuple':
      return v.tuple(changed.items, s.message);
    case 'loose_tuple':
      return v.looseTuple(changed.items, s.message);
    case 'strict_tuple':
      return v.strictTuple(changed.items, s.message);
    case 'tuple_with_rest':
      return v.tupleWithRest(changed.items, s.rest, s.message);
    case 'intersect':
      return v.intersect(changed.options, s.message);
    case 'union':
      return v.union(changed.options, s.message);
    case 'variant':
      return v.variant(s.key, changed.options, s.message);
    case 'optional':
      return v.optional(changed.wrapped, s.default);
    case 'nullable':
      return v.nullable(changed.wrapped, s.default);
    case 'nullish':
      return v.nullish(changed.wrapped, s.default);
    case 'exact_optional':
      return v.exactOptional(changed.wrapped, s.default);
    case 'undefinedable':
      return v.undefinedable(changed.wrapped, s.default);
    case 'non_nullable':
      return v.nonNullable(changed.wrapped, s.message);
    case 'non_nullish':
      return v.nonNullish(changed.wrapped, s.message);
    case 'non_optional':
      return v.nonOptional(changed.wrapped, s.message);
    case 'record':
      return v.record(s.key, changed.value, s.message);
    case 'map':
      return v.map(s.key, changed.value, s.message);
    case 'set':
      return v.set(changed.value, s.message);
    default:
      throw new Error(
        `[typedFieldPipe] 暂不支持重建的 schema 类型: ${(s as AnySchema).type}`,
      );
  }
}

/** 按原声明顺序复制 entries, 只替换目标 key, 保证字段顺序不变 */
function replaceEntry(
  entries: Record<string, AnySchema>,
  key: string,
  value: AnySchema,
) {
  const next: Record<string, AnySchema> = {};
  for (const name of Object.keys(entries)) {
    next[name] = name === key ? value : entries[name];
  }
  return next;
}

// 递归函数, 返回值无法推导, 必须显式声明
function mergeAt(
  s: AnySchema,
  path: KeyPath,
  actions: readonly any[],
): AnySchema {
  if (path.length === 0) return appendActions(s, actions);

  const [key, ...rest] = path;

  // pipe 层: 只对第一项下钻, 其余成员(含嵌套 pipe)原样保留在原位置
  if (isPipeSchema(s)) {
    const [first, ...others] = s.pipe;
    const next = mergeAt(first, path, actions);
    return others.length ? v.pipe(next, ...others) : next;
  }

  // wrapped 层: key 不消耗, 继续向内下钻
  if (isWrappedSchema(s)) {
    return rebuild(s, { wrapped: mergeAt(s.wrapped, path, actions) });
  }

  if (isEntriesSchema(s)) {
    const k = String(key);
    if (!(k in s.entries)) {
      throw new Error(`[typedFieldPipe] schema 中不存在 key: ${k}`);
    }
    return rebuild(s, {
      entries: replaceEntry(s.entries, k, mergeAt(s.entries[k], rest, actions)),
    });
  }

  if (isItemSchema(s)) {
    return rebuild(s, { item: mergeAt(s.item, rest, actions) });
  }

  if (isItemsSchema(s)) {
    const i = Number(key);
    if (i >= s.items.length) {
      throw new Error(`[typedFieldPipe] tuple 下标越界: ${i}`);
    }
    const items = [...s.items];
    items[i] = mergeAt(items[i], rest, actions);
    return rebuild(s, { items });
  }

  if (isOptionsSchema(s)) {
    const i = Number(key);
    if (i >= s.options.length) {
      throw new Error(`[typedFieldPipe] intersect/union 下标越界: ${i}`);
    }
    const options = [...s.options];
    options[i] = mergeAt(options[i], rest, actions);
    return rebuild(s, { options });
  }

  if (isValueSchema(s)) {
    return rebuild(s, { value: mergeAt(s.value, rest, actions) });
  }

  throw new Error(
    `[typedFieldPipe] 无法在类型 "${(s as AnySchema).type}" 上继续下钻路径`,
  );
}

/**
 * 以 schema 变量为实参(避开 typeof 自引用), 按「路径 -> actions」把 action 合并进 schema。
 *
 * 合并后 schema 的值类型不变(action 不改变 value), 但每个 action 回调里的 field
 * 拥有与 `builder.get(path)` 完全等价的类型: 自身 / 父级 / 根级 / 别名。
 *
 * 注意: 必须使用返回值, 原 schema 不被修改。
 */
export function typedFieldPipe<S extends v.BaseSchema<any, any, any>>(
  schema: S,
  cb: (define: DefineEntry<S>) => readonly FieldEntry[],
): S {
  const define = Object.assign(
    (path: KeyPath, actions: readonly any[]): FieldEntry => ({
      path,
      actions: actions ?? [],
    }),
    ɵtypedFieldActions,
  ) as unknown as DefineEntry<S>;

  let result: AnySchema = schema;
  for (const entry of cb(define) ?? []) {
    result = mergeAt(result, entry.path, entry.actions);
  }
  return result as S;
}

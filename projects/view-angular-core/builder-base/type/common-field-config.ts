import { Injector, Signal, WritableSignal } from '@angular/core';
import * as v from 'valibot';

import {
  EntriesOf,
  ItemOf,
  ItemsOf,
  OptionsOf,
  PipeOf,
  RecordValueOf,
  RestOf,
  VsArrayLikeHost,
  VsEntriesHost,
  VsTupleHost,
  WrappedOf,
} from './valibot-shape';

import { FieldArray } from '../../field/field-array';
import { FieldControl } from '../../field/field-control';
import { FieldGroup } from '../../field/field-group';
import { FieldLogicGroup } from '../../field/field-logic-group';
import { AnyCoreSchemaHandle, CoreSchemaHandle } from '../../convert';
import { KeyPath, Wrapper$, LazyImport } from '../../util';
import { CombineSignal } from '../../util/create-combine-signal';
import { AsyncObjectSignal } from '../../util/create-async-object-signal';
export interface FieldRenderConfig {
  hidden?: boolean;
}
export type ComponentData<T = any> = {
  inputs: AsyncObjectSignal<ViewInputs>;
  outputs: AsyncObjectSignal<ViewOutputs>;
  attributes: AsyncObjectSignal<ViewAttributes>;
  events: AsyncObjectSignal<ViewEvents>;
  slots: AsyncObjectSignal<ViewSlots>;
  models: AsyncObjectSignal<ViewModels>;
  /** 创建组件时的额外配置,由各前端框架确定泛型,但是仅顶层使用 */
  createOptions?: AsyncObjectSignal<T>;
};
/** 解析后define使用 */
export type CoreResolvedComponentDefine = {
  type: any;
} & Partial<ComponentData>;

export interface HookConfig<RESOLVED_FIELD> {
  /** 配置刚被解析 */
  fieldResolved?: (field: RESOLVED_FIELD) => void;
  /** 所有feilds初始化后执行,也就是可以进行表单监听 */
  allFieldsResolved?: (field: RESOLVED_FIELD) => void;
  /** todo 此hook暂时没有使用到 创建组件之前 */
  beforeCreateComponent?: (field: RESOLVED_FIELD) => void;
  /** todo 此hook暂时没有使用到 组件创建,获取componentRef */
  afterCreateComponent?: (field: RESOLVED_FIELD) => void;
}

/** 去掉 keyPath 的第一个元素 */
type RestPath<Path extends KeyPath> = Path extends [any, ...infer R]
  ? R extends KeyPath
    ? R
    : []
  : [];

/** schema 的输出类型, 非 schema 兜底为 any */
type Out<S> =
  S extends v.BaseSchema<unknown, unknown, any> ? v.InferOutput<S> : any;

/* ---------- 别名(@alias) 强类型支持 ---------- */

/** 在 pipe 中查找第一个 setAlias 的别名 */
type FindAliasInPipe<P extends readonly any[]> = P extends readonly [
  infer A,
  ...infer R,
]
  ? A extends { alias: infer Al }
    ? Al
    : FindAliasInPipe<R>
  : never;

/** 字段自身(pipe 上)的别名 -> { 别名: 目标 schema } */
type OwnAliasMap<S> = (
  S extends { alias: infer Al }
    ? Al
    : PipeOf<S> extends infer P
      ? P extends readonly any[]
        ? FindAliasInPipe<P>
        : never
      : never
) extends infer Al
  ? Al extends string
    ? { [K in Al]: S }
    : {}
  : {};

/** 合并多个别名映射, 同名 key 的 value 取并集(避免交叉成 never) */
type MergeAliasUnion<U> = {
  [K in U extends any ? keyof U : never]: U extends any
    ? K extends keyof U
      ? U[K]
      : never
    : never;
};

/**
 * 收集「同一作用域内」的别名映射。
 * 沿 object/intersect/union/pipe/wrapped 下钻, 但遇到数组 item 即停止
 * —— 数组项在运行时由独立的 ParentMap 承载, 属于内层作用域。
 */
type CollectScopeAlias<S> = unknown extends S
  ? {}
  : MergeAliasUnion<
      | OwnAliasMap<S>
      | (PipeOf<S> extends infer P
          ? P extends readonly [infer F, ...any[]]
            ? CollectScopeAlias<F>
            : {}
          : {})
      | (WrappedOf<S> extends infer W
          ? [W] extends [never]
            ? {}
            : CollectScopeAlias<W>
          : {})
      | (EntriesOf<S> extends infer E
          ? E extends Record<string, any>
            ? MergeAliasUnion<
                { [K in keyof E]: CollectScopeAlias<E[K]> }[keyof E]
              >
            : {}
          : {})
      | (OptionsOf<S> extends infer O
          ? O extends readonly any[]
            ? MergeAliasUnion<CollectScopeAlias<O[number]>>
            : {}
          : {})
    >;

/**
 * 作用域链 [最内层, ..., 最外层], 对应运行时的 ParentMap 链。
 * @alias 先在当前(最内)作用域查找, 未命中再逐级向外回退。
 * 命中时返回 [别名目标 schema, 以命中层为起点的作用域链]。
 */
type LookupAliasScope<Scopes, Name extends string> = Scopes extends readonly [
  infer Cur,
  ...infer Rest extends readonly any[],
]
  ? Name extends keyof Cur
    ? [Cur[Name], [Cur, ...Rest]]
    : LookupAliasScope<Rest, Name>
  : never;

/** 下钻数组项时压入新的作用域 */
type PushItemScope<Schema, K, Scopes> =
  ItemOf<CoreSchemaOf<Schema>> extends infer T
    ? [T] extends [never]
      ? Scopes
      : K extends number
        ? Scopes extends readonly any[]
          ? [CollectScopeAlias<T>, ...Scopes]
          : [CollectScopeAlias<T>]
        : Scopes
    : Scopes;

/** 根作用域别名链 */
export type InferAliasMap<S> = [CollectScopeAlias<S>];

/* ---------- schema 导航(支持 intersect/union 数字下标及对象/数组) ---------- */

/** tuple / tuple_with_rest 按数字下标取成员 schema */
type TupleEntryOf<S, K> =
  ItemsOf<S> extends infer I
    ? [I] extends [never]
      ? never
      : K extends number
        ? `${K}` extends Extract<keyof I, `${number}`>
          ? I[K & keyof I]
          : RestOf<S>
        : never
    : never;
/**
 * 从 schema 中按 key 取子 schema。
 * 优先级固定 array > entries > tuple > record > pipe > wrapped:
 * SchemaWithPipe 会保留被包裹 schema 的 entries 等字段, 必须先认容器再认 pipe。
 *
 * 注: 每层提取结果均经 `extends infer X` 绑定一次, 不可重复内联,
 * 否则 TS 会指数级重复实例化并爆栈。
 */
type SubSchema<S, K> = unknown extends S ? any : SubByArray<S, K>;

type SubByArray<S, K> =
  ItemOf<S> extends infer T
    ? [T] extends [never]
      ? SubByEntries<S, K>
      : K extends number
        ? T
        : never
    : never;

type SubByEntries<S, K> =
  EntriesOf<S> extends infer E
    ? [E] extends [never]
      ? SubByTuple<S, K>
      : K extends keyof E
        ? E[K]
        : RestOf<S>
    : never;

type SubByTuple<S, K> = [S] extends [VsTupleHost]
  ? TupleEntryOf<S, K>
  : SubByRecord<S, K>;

type SubByRecord<S, K> =
  RecordValueOf<S> extends infer V
    ? [V] extends [never]
      ? SubByPipe<S, K>
      : V
    : never;

type SubByPipe<S, K> =
  PipeOf<S> extends infer P
    ? [P] extends [never]
      ? SubByWrapped<S, K>
      : P extends readonly [infer F, ...any[]]
        ? SubSchema<F, K>
        : never
    : never;

type SubByWrapped<S, K> =
  WrappedOf<S> extends infer W
    ? [W] extends [never]
      ? never
      : SubSchema<W, K>
    : never;

/** 从 intersect/union schema 中按数字下标取成员 schema */
type ItemSchema<S, I> = unknown extends S ? any : ItemByOptions<S, I>;

type ItemByOptions<S, I> =
  OptionsOf<S> extends infer O
    ? [O] extends [never]
      ? ItemByPipe<S, I>
      : I extends number
        ? O[I & keyof O]
        : never
    : never;

type ItemByPipe<S, I> =
  PipeOf<S> extends infer P
    ? [P] extends [never]
      ? ItemByWrapped<S, I>
      : P extends readonly [infer F, ...any[]]
        ? ItemSchema<F, I>
        : never
    : never;

type ItemByWrapped<S, I> =
  WrappedOf<S> extends infer W
    ? [W] extends [never]
      ? never
      : ItemSchema<W, I>
    : never;
/** 子 schema 取不到时回退到 intersect/union 成员, 仍取不到则 any(保持宽松) */
type SubSchemaOrItem<S, K> = [SubSchema<S, K>] extends [never]
  ? [ItemSchema<S, K>] extends [never]
    ? any
    : ItemSchema<S, K>
  : SubSchema<S, K>;

/**
 * 根据 keyPath 递归解析出 [当前 schema, 父级 schema, 作用域链]。
 * value 类型不再单独携带, 统一由各层 schema 经 Out<> 推导。
 * - '#' 从根级开始; '..' 从父级开始(单级退回); '@alias' 通过别名查询。
 * - 下钻数组项时作用域链压入新层, 与运行时 #createArrayItem 的 ParentMap 一致。
 */
type Resolve<
  Schema,
  RootSchema,
  ParentSchema,
  AliasMap,
  Path extends KeyPath,
> = Path extends []
  ? [Schema, ParentSchema, AliasMap]
  : Path[0] extends '#'
    ? Resolve<RootSchema, RootSchema, any, AliasMap, RestPath<Path>>
    : Path[0] extends '..'
      ? Resolve<ParentSchema, RootSchema, any, AliasMap, RestPath<Path>>
      : Path[0] extends `@${infer Al}`
        ? LookupAliasScope<AliasMap, Al> extends [
            infer AS,
            infer ASC extends readonly any[],
          ]
          ? Resolve<AS, RootSchema, any, ASC, RestPath<Path>>
          : [any, any, AliasMap]
        : Path extends [infer K, ...infer Rest]
          ? Rest extends KeyPath
            ? Resolve<
                SubSchemaOrItem<Schema, K>,
                RootSchema,
                Schema,
                PushItemScope<Schema, K, AliasMap>,
                Rest
              >
            : [any, Schema, AliasMap]
          : [any, Schema, AliasMap];

/** get 的返回字段完整类型(携带正确的 RootSchema/ParentSchema/AliasMap) */
type GetResult<
  Schema,
  RootSchema,
  ParentSchema,
  AliasMap,
  Path extends KeyPath,
> =
  Resolve<Schema, RootSchema, ParentSchema, AliasMap, Path> extends [
    infer SelfSchema,
    infer ResultParentSchema,
    infer ResultAliasMap,
  ]
    ? _PiResolvedCommonViewFieldConfig<
        SelfSchema,
        RootSchema,
        ResultParentSchema,
        ResultAliasMap
      >
    : never;

/* ---------- 控件类型细分(control 类型) ---------- */
/**
 * 与运行时 schemaForEach 完全对齐的节点递归:
 * pipe -> 遍历每一项; wrapped -> 向内(可多层链); 叶子 -> 比对 type
 */
type NodeHasAction<S, T extends string> =
  PipeOf<S> extends infer P
    ? [P] extends [never]
      ? NodeHasActionNoPipe<S, T>
      : P extends readonly any[]
        ? HasPipeAction<P, T>
        : never
    : never;

type NodeHasActionNoPipe<S, T extends string> =
  WrappedOf<S> extends infer W
    ? [W] extends [never]
      ? [S] extends [{ type: T }]
        ? true
        : false
      : NodeHasAction<W, T>
    : never;
/** 判断 pipe 中是否包含指定 action type */
type HasPipeAction<
  P extends readonly any[],
  T extends string,
> = P extends readonly [infer A, ...infer Rest]
  ? NodeHasAction<A, T> extends true
    ? true
    : HasPipeAction<Rest, T>
  : false;
/** schema 是否配置了 asControl(强制作为 FieldControl) */
type IsAsControl<S> = NodeHasAction<S, 'asControl'>;
/** schema 是否配置了 asVirtualGroup(强制作为 FieldGroup) */
type IsAsVirtualGroup<S> = NodeHasAction<S, 'asVirtualGroup'>;
/** 递归解包 pipe/wrapped 得到核心 schema */
type CoreSchemaOf<S> = unknown extends S
  ? any
  : [S] extends [never]
    ? any
    : PipeOf<S> extends infer P
      ? [P] extends [never]
        ? CoreSchemaOfNoPipe<S>
        : P extends readonly [infer F, ...any[]]
          ? CoreSchemaOf<F>
          : never
      : never;

type CoreSchemaOfNoPipe<S> =
  WrappedOf<S> extends infer W
    ? [W] extends [never]
      ? S
      : CoreSchemaOf<W>
    : never;
/** 根据核心 schema 与原始 schema 推断控件类型 */
type SchemaControlOf<C, S, V> = C extends VsArrayLikeHost
  ? FieldArray<V>
  : C extends v.IntersectSchema<any, any>
    ? IsAsVirtualGroup<S> extends true
      ? FieldGroup<V>
      : FieldLogicGroup<V>
    : C extends v.UnionSchema<any, any>
      ? FieldLogicGroup<V>
      : C extends VsEntriesHost | v.RecordSchema<any, any, any>
        ? IsAsControl<S> extends true
          ? FieldControl<V>
          : FieldGroup<V>
        : FieldControl<V>;
/** 根据 schema 推断对应表单控件类型, value 类型由 schema 推导 */
type SchemaToControl<S, V = Out<S>> = unknown extends S
  ? FieldGroup<V> | FieldArray<V> | FieldControl<V> | FieldLogicGroup<V>
  : [S] extends [never]
    ? FieldGroup<V> | FieldArray<V> | FieldControl<V> | FieldLogicGroup<V>
    : SchemaControlOf<CoreSchemaOf<S>, S, V>;

export type PiResolvedCommonViewFieldConfig<
  SelfResolvedFn extends () => any,
  Define,
  Schema = any,
  RootSchema = Schema,
  ParentSchema = any,
  AliasMap = {},
> = {
  readonly hooks: HookConfig<ReturnType<SelfResolvedFn>>;
  // 额外
  readonly id?: string;
  /** 查询时使用 */
  readonly keyPath?: KeyPath | undefined;
  readonly key: string | undefined;
  readonly fullPath: KeyPath;
  readonly props: AsyncObjectSignal<Record<string, any>>;
  children?: Signal<ReturnType<SelfResolvedFn>[]>;
  fixedChildren?: WritableSignal<ReturnType<SelfResolvedFn>[]>;
  restChildren?: WritableSignal<ReturnType<SelfResolvedFn>[]>;
  parent: ReturnType<SelfResolvedFn>;
  readonly form: {
    readonly control?: SchemaToControl<Schema>;
    readonly parent: SchemaToControl<ParentSchema>;
    readonly root: SchemaToControl<RootSchema>;
  };
  /** 仅用来开发时debug使用 */
  readonly origin: any;
  /**
   * 类型占位, 运行时不存在。
   * 把 schema 相关泛型以「类型引用」形式携带,
   * 供下游(如模板指令)反查后复用 GetResult 做路径推导。
   * @internal
   */
  readonly __piTypes?: PiFieldTypeRef<
    Schema,
    RootSchema,
    ParentSchema,
    AliasMap
  >;

  injector: Injector;
  /** 外部传入引用 */
  readonly context?: any;
  arrayChild?: CoreSchemaHandle<any, any>;
  get: <K extends KeyPath>(
    keyPath: [...K],
    aliasNotFoundFn?: (
      name: string,
      field: PiResolvedCommonViewFieldConfig<any, any>,
    ) => PiResolvedCommonViewFieldConfig<any, any>,
  ) => GetResult<Schema, RootSchema, ParentSchema, AliasMap, K> | undefined;
  action: {
    set: (value: any, index?: any) => boolean;
    remove: (index: any) => void;
  };
  readonly define?: WritableSignal<Define>;
} & Readonly<Pick<AnyCoreSchemaHandle, 'priority' | 'alias' | 'providers'>> & {
    readonly inputs: AsyncObjectSignal<ViewInputs>;
    readonly models: AsyncObjectSignal<ViewModels>;
    readonly outputs: AsyncObjectSignal<ViewOutputs>;
    readonly attributes: AsyncObjectSignal<ViewAttributes>;
    readonly events: AsyncObjectSignal<ViewEvents>;
    readonly slots: AsyncObjectSignal<ViewSlots>;
    readonly wrappers: CombineSignal<CoreWrapperConfig>;
  } & Readonly<
    Wrapper$<Required<Pick<AnyCoreSchemaHandle, 'formConfig' | 'renderConfig'>>>
  >;
/**
 * 类型占位: 仅承载 schema 泛型。
 * 成员类型与泛型无关, 所以不同实参之间结构互容, 不会收紧赋值兼容性;
 * 但类型引用本身保留实参, 可以用 infer 直接反查。
 */
export interface PiFieldTypeRef<Schema, RootSchema, ParentSchema, AliasMap> {
  readonly __piRef?: never;
}

/** 从字段配置类型反查 schema 泛型; 拿不到时给宽松兜底 */
/** 字段配置 F 携带的作用域 schema(自身/根/父/别名链), 拿不到时给宽松兜底 */
export type PiFieldScopeOf<F> = F extends {
  __piTypes?: PiFieldTypeRef<infer S, infer R, infer Pa, infer A>;
}
  ? { schema: S; root: R; parent: Pa; alias: A }
  : { schema: any; root: any; parent: any; alias: {} };

type FieldSchemaParts<F> = PiFieldScopeOf<F>;

/**
 * 字段配置 F 的 value 类型(由携带的 schema 反查)。
 * 拿不到 schema 时落到 any, 保证未绑定泛型的场景依旧宽松。
 */
export type PiFieldValueOf<F> =
  FieldSchemaParts<F>['schema'] extends v.BaseSchema<any, infer O, any>
    ? O
    : any;

/**
 * 对字段配置 F 执行 `.get(P)` 的等价类型。
 * - P 未绑定(默认 [])或推断失败(any) 时, 返回 F 自身
 * - 其余情况走与 `get` 完全一致的 GetResult 推导
 */
export type PiFieldGet<F, P extends KeyPath> = 0 extends 1 & P
  ? F
  : P extends []
    ? F
    : FieldSchemaParts<F> extends {
          schema: infer S;
          root: infer R;
          parent: infer Pa;
          alias: infer A;
        }
      ? GetResult<S, R, Pa, A, P>
      : F;

/**
 * 字段配置 F 的 `form.control` 等价强类型。
 * 叶子控件的 value 类型由对应 schema 推导。
 */
type PiFieldControlOf<F> = FieldControl<Out<FieldSchemaParts<F>['schema']>>;

/**
 * 指令场景: 绑定类型 F + path P 推导出的 `fieldControl$$` 强类型。
 * 与 `PiFieldGet<F, P>` 保持同构。
 */
export type PiFieldControlGet<F, P extends KeyPath> = PiFieldControlOf<
  PiFieldGet<F, P>
>;

export type _PiResolvedCommonViewFieldConfig<
  Schema = any,
  RootSchema = Schema,
  ParentSchema = any,
  AliasMap = {},
> = PiResolvedCommonViewFieldConfig<
  () => _PiResolvedCommonViewFieldConfig<any>,
  CoreResolvedComponentDefine,
  Schema,
  RootSchema,
  ParentSchema,
  AliasMap
>;

/** 任意「字段配置」形态, 用于类型层识别 field 并做替换 */
export type AnyPiResolvedField = _PiResolvedCommonViewFieldConfig;

/**
 * 仅指定 value 类型(不关心 schema)时的字段类型。
 * 用于回调/捕获场景下手工标注 value, 例如 PiFieldWithValue<string>。
 */
export type PiFieldWithValue<V> = _PiResolvedCommonViewFieldConfig<
  v.BaseSchema<any, V, any>,
  any,
  any,
  {}
>;

/**
 * 由 schema 片段直接推导字段类型(绑定 Schema, form.control 可精确到具体控件)。
 */
export type PiFieldOfSchema<S extends v.BaseSchema<any, any, any>> =
  _PiResolvedCommonViewFieldConfig<S, S, any, {}>;

/**
 * 从「根 schema + keyPath」推导出与 `builder.get(path)` 完全等价的字段类型。
 * 自身/父级/根级/别名 全套信息齐备, 支持 ['a','b'] / ['a',0,'b'] / ['#'] / ['@alias']。
 */
export type PiFieldAtPath<
  RootSchema extends v.BaseSchema<any, any, any>,
  Path extends KeyPath,
> = GetResult<RootSchema, RootSchema, any, InferAliasMap<RootSchema>, Path>;

export interface FormBuilderOptions<T> {
  form$$: Signal<FieldGroup>;
  resolvedField$: WritableSignal<T>;
  context: any;
}

export type ViewInputs = Record<string, any>;
export type ViewModels = Record<string, WritableSignal<any>>;
export type ViewOutputs = Record<string, (...args: any[]) => any>;
export type ViewAttributes = Record<string, any>;
export type ViewEvents = Record<string, (event: Event) => any>;
export type ViewProps = Record<string, any>;
export type ViewSlots = Record<string, any>;

export type RawCoreWrapperConfig = {
  type: string | any | LazyImport<any>;
  attributes: ViewAttributes;
  inputs: ViewInputs;
  outputs: ViewOutputs;
  events: ViewEvents;
  slots: ViewSlots;
  models: ViewModels;
};

export type CoreWrapperConfig = {
  type: string | any | LazyImport<any>;
} & ComponentData;

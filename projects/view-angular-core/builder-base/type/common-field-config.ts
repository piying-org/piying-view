import { Injector, Signal, WritableSignal } from '@angular/core';
import * as v from 'valibot';

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

/** 提取字段输出类型(非 schema 时兜底为 any) */
type FieldOutput<F> = F extends v.BaseSchema<unknown, unknown, any>
  ? v.InferOutput<F>
  : any;

/** 字段自身(pipe 上)的别名 -> [value, schema] */
type OwnAliasMap<S> = (
  S extends { alias: infer Al }
    ? Al
    : S extends { pipe: infer P extends readonly any[] }
      ? FindAliasInPipe<P>
      : never
) extends infer Al
  ? Al extends string
    ? { [K in Al]: [FieldOutput<S>, S] }
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
      | (S extends { pipe: infer P extends readonly any[] }
          ? CollectScopeAlias<P[0]>
          : {})
      | (S extends { wrapped: infer W } ? CollectScopeAlias<W> : {})
      | (S extends { entries: infer E extends Record<string, any> }
          ? MergeAliasUnion<
              { [K in keyof E]: CollectScopeAlias<E[K]> }[keyof E]
            >
          : {})
      | (S extends { options: infer O extends readonly any[] }
          ? MergeAliasUnion<CollectScopeAlias<O[number]>>
          : {})
    >;

/**
 * 作用域链 [最内层, ..., 最外层], 对应运行时的 ParentMap 链。
 * @alias 先在当前(最内)作用域查找, 未命中再逐级向外回退。
 * 命中时返回 [别名目标, 以命中层为起点的作用域链]。
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
type PushItemScope<Schema, K, Scopes> = [
  CoreSchemaOf<Schema>,
] extends [{ item: infer T }]
  ? K extends number
    ? Scopes extends readonly any[]
      ? [CollectScopeAlias<T>, ...Scopes]
      : [CollectScopeAlias<T>]
    : Scopes
  : Scopes;

/** 根作用域别名链 */
export type InferAliasMap<S> = [CollectScopeAlias<S>];

/* ---------- schema 导航(支持 intersect/union 数字下标及对象/数组) ---------- */
/** 从 schema 中按 key 取子 schema(支持对象/数组/pipe/optional 等包裹) */
type SubSchema<S, K> = unknown extends S
  ? any
  : S extends { item: infer T }
    ? K extends number
      ? T
      : never
    : S extends { entries: infer E extends Record<string, any> }
      ? K extends keyof E
        ? E[K]
        : never
      : S extends { pipe: infer P extends readonly any[] }
        ? SubSchema<P[0], K>
        : S extends { wrapped: infer W }
          ? SubSchema<W, K>
          : never;

/** 从 intersect/union schema 中按数字下标取成员 schema */
type ItemSchema<S, I> = unknown extends S
  ? any
  : S extends { options: infer O extends readonly any[] }
    ? I extends number
      ? O[I]
      : never
    : S extends { pipe: infer P extends readonly any[] }
      ? ItemSchema<P[0], I>
      : S extends { wrapped: infer W }
        ? ItemSchema<W, I>
        : never;

/**
 * 根据 keyPath 递归解析出 [value 类型, schema, 作用域链]。
 * Value: 当前字段值类型; Schema: 当前字段 schema。
 * RootValue/RootSchema: 根级; ParentValue/ParentSchema: 父级。
 * - '#' 从根级开始; '..' 从父级开始(单级退回); '@alias' 通过别名查询。
 * - 下钻数组项时作用域链压入新层, 与运行时 #createArrayItem 的 ParentMap 一致。
 */
type Resolve<
  Value,
  Schema,
  RootValue,
  RootSchema,
  ParentValue,
  ParentSchema,
  AliasMap,
  Path extends KeyPath,
> = Path extends []
  ? [Value, Schema, AliasMap]
  : Path[0] extends '#'
    ? Resolve<RootValue, RootSchema, RootValue, RootSchema, any, any, AliasMap, RestPath<Path>>
    : Path[0] extends '..'
      ? Resolve<ParentValue, ParentSchema, RootValue, RootSchema, any, any, AliasMap, RestPath<Path>>
      : Path[0] extends `@${infer Al}`
        ? LookupAliasScope<AliasMap, Al> extends [[infer AV, infer AS], infer ASC extends readonly any[]]
          ? Resolve<AV, AS, RootValue, RootSchema, any, any, ASC, RestPath<Path>>
          : [any, any, AliasMap]
        : Path extends [infer K, ...infer Rest]
          ? Rest extends KeyPath
            ? K extends keyof Value
              ? Resolve<Value[K], SubSchema<Schema, K>, RootValue, RootSchema, Value, Schema, PushItemScope<Schema, K, AliasMap>, Rest>
              : K extends number
                ? Resolve<FieldOutput<ItemSchema<Schema, K>>, ItemSchema<Schema, K>, RootValue, RootSchema, Value, Schema, PushItemScope<Schema, K, AliasMap>, Rest>
                : [any, any, AliasMap]
            : K extends keyof Value
              ? [Value[K], SubSchema<Schema, K>, AliasMap]
              : K extends number
                ? [FieldOutput<ItemSchema<Schema, K>>, ItemSchema<Schema, K>, AliasMap]
                : [any, any, AliasMap]
          : [any, any, AliasMap];

/** 解析路径末端的 value 类型 */
type GetPathValue<
  Value,
  Schema,
  RootValue,
  RootSchema,
  ParentValue,
  ParentSchema,
  AliasMap,
  Path extends KeyPath,
> = Resolve<Value, Schema, RootValue, RootSchema, ParentValue, ParentSchema, AliasMap, Path>[0];

/** 解析路径末端的 schema */
type GetPathSchema<
  Value,
  Schema,
  RootValue,
  RootSchema,
  ParentValue,
  ParentSchema,
  AliasMap,
  Path extends KeyPath,
> = Resolve<Value, Schema, RootValue, RootSchema, ParentValue, ParentSchema, AliasMap, Path>[1];

/** 解析路径末端所处的作用域链 */
type GetPathScopes<
  Value,
  Schema,
  RootValue,
  RootSchema,
  ParentValue,
  ParentSchema,
  AliasMap,
  Path extends KeyPath,
> = Resolve<Value, Schema, RootValue, RootSchema, ParentValue, ParentSchema, AliasMap, Path>[2];

/** 返回字段的父级值类型: 普通路径的父级是路径倒数第二个 key 的值; 特殊路径无法推导为 any */
type GetParentValue<Value, Schema, ParentValue, Path extends KeyPath> =
  Path extends []
    ? ParentValue
    : Path[0] extends '#' | '..' | `@${string}`
      ? any
      : Path extends [infer K, ...infer Rest]
        ? Rest extends KeyPath
          ? Rest extends []
            ? Value
            : K extends keyof Value
              ? GetParentValue<Value[K], SubSchema<Schema, K>, ParentValue, Rest>
              : K extends number
                ? GetParentValue<FieldOutput<ItemSchema<Schema, K>>, ItemSchema<Schema, K>, ParentValue, Rest>
                : any
          : any
        : any;

/** 返回字段的父级 schema */
type GetParentSchema<Value, Schema, ParentSchema, Path extends KeyPath> =
  Path extends []
    ? ParentSchema
    : Path[0] extends '#' | '..' | `@${string}`
      ? any
      : Path extends [infer K, ...infer Rest]
        ? Rest extends KeyPath
          ? Rest extends []
            ? Schema
            : K extends keyof Value
              ? GetParentSchema<Value[K], SubSchema<Schema, K>, ParentSchema, Rest>
              : K extends number
                ? GetParentSchema<FieldOutput<ItemSchema<Schema, K>>, ItemSchema<Schema, K>, ParentSchema, Rest>
                : any
          : any
        : any;

/** get 的返回字段完整类型(携带正确的 RootValue/ParentValue/AliasMap/Schema) */
type GetResult<
  Value,
  RootValue,
  ParentValue,
  AliasMap,
  Schema,
  RootSchema,
  ParentSchema,
  Path extends KeyPath,
> = _PiResolvedCommonViewFieldConfig<
  GetPathValue<Value, Schema, RootValue, RootSchema, ParentValue, ParentSchema, AliasMap, Path>,
  RootValue,
  GetParentValue<Value, Schema, ParentValue, Path>,
  GetPathScopes<Value, Schema, RootValue, RootSchema, ParentValue, ParentSchema, AliasMap, Path>,
  GetPathSchema<Value, Schema, RootValue, RootSchema, ParentValue, ParentSchema, AliasMap, Path>,
  RootSchema,
  GetParentSchema<Value, Schema, ParentSchema, Path>
>;

/* ---------- 控件类型细分(control 类型) ---------- */
/** 判断 pipe 中是否包含指定 action type */
type HasPipeAction<P extends readonly any[], T extends string> =
  P extends readonly [infer A, ...infer Rest]
    ? A extends { type: T }
      ? true
      : HasPipeAction<Rest, T>
    : false;
/** schema 是否配置了 asControl(强制作为 FieldControl) */
type IsAsControl<S> = S extends { pipe: infer P extends readonly any[] }
  ? HasPipeAction<P, 'asControl'>
  : false;
/** schema 是否配置了 asVirtualGroup(强制作为 FieldGroup) */
type IsAsVirtualGroup<S> = S extends {
  pipe: infer P extends readonly any[];
}
  ? HasPipeAction<P, 'asVirtualGroup'>
  : false;
/** 递归解包 pipe/wrapped 得到核心 schema */
type CoreSchemaOf<S> = unknown extends S
  ? any
  : [S] extends [never]
    ? any
    : S extends { pipe: infer P extends readonly any[] }
      ? CoreSchemaOf<P[0]>
      : S extends { wrapped: infer W }
        ? CoreSchemaOf<W>
        : S;
/** 根据核心 schema 与原始 schema 推断控件类型 */
type SchemaControlOf<C, S, V> = C extends { type: 'array' | 'tuple' }
  ? FieldArray<V>
  : C extends { type: 'intersect' }
    ? IsAsVirtualGroup<S> extends true
      ? FieldGroup<V>
      : FieldLogicGroup<V>
    : C extends { type: 'union' }
      ? FieldLogicGroup<V>
      : C extends {
            type:
              | 'object'
              | 'loose_object'
              | 'strict_object'
              | 'object_with_rest'
              | 'record';
          }
        ? IsAsControl<S> extends true
          ? FieldControl<V>
          : FieldGroup<V>
        : FieldControl<V>;
/** 根据 schema 推断对应表单控件类型 */
type SchemaToControl<S, V> = unknown extends S
  ? FieldGroup<V> | FieldArray<V> | FieldControl<V> | FieldLogicGroup<V>
  : [S] extends [never]
    ? FieldGroup<V> | FieldArray<V> | FieldControl<V> | FieldLogicGroup<V>
    : SchemaControlOf<CoreSchemaOf<S>, S, V>;

export type PiResolvedCommonViewFieldConfig<
  SelfResolvedFn extends () => any,
  Define,
  Value = any,
  RootValue = Value,
  ParentValue = any,
  AliasMap = {},
  Schema = any,
  RootSchema = Schema,
  ParentSchema = any,
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
    readonly control?: SchemaToControl<Schema, Value>;
    readonly parent: SchemaToControl<ParentSchema, ParentValue>;
    readonly root: SchemaToControl<RootSchema, RootValue>;
  };
  /** 仅用来开发时debug使用 */
  readonly origin: any;

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
  ) => GetResult<Value, RootValue, ParentValue, AliasMap, Schema, RootSchema, ParentSchema, K> | undefined;
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
export type _PiResolvedCommonViewFieldConfig<
  Value = any,
  RootValue = Value,
  ParentValue = any,
  AliasMap = {},
  Schema = any,
  RootSchema = Schema,
  ParentSchema = any,
> = PiResolvedCommonViewFieldConfig<
  () => _PiResolvedCommonViewFieldConfig<any>,
  CoreResolvedComponentDefine,
  Value,
  RootValue,
  ParentValue,
  AliasMap,
  Schema,
  RootSchema,
  ParentSchema
>;

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

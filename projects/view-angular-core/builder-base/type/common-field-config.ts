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
export type ComponentData = {
  inputs: AsyncObjectSignal<ViewInputs>;
  outputs: AsyncObjectSignal<ViewOutputs>;
  attributes: AsyncObjectSignal<ViewAttributes>;
  events: AsyncObjectSignal<ViewEvents>;
  slots: AsyncObjectSignal<ViewSlots>;
  models: AsyncObjectSignal<ViewModels>;
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
type UnionToIntersection<U> = (U extends any ? (x: U) => void : never) extends (
  x: infer R,
) => void
  ? R
  : never;

/** 在 schema 中查找第一个 setAlias 的别名 */
type FindAlias<S> = S extends { alias: infer Al }
  ? Al
  : S extends { pipe: infer P extends readonly any[] }
    ? FindAliasInPipe<P>
    : S extends { entries: infer E extends Record<string, any> }
      ? FindAliasInEntries<E>
      : never;
type FindAliasInPipe<P extends readonly any[]> = P extends readonly [
  infer A,
  ...infer R,
]
  ? A extends { alias: infer Al }
    ? Al
    : FindAliasInPipe<R>
  : never;
type FindAliasInEntries<E extends Record<string, any>> = {
  [K in keyof E]: FindAlias<E[K]>;
}[keyof E];

/** 提取字段输出类型(非 schema 时兜底为 any) */
type FieldOutput<F> = F extends v.BaseSchema<unknown, unknown, any>
  ? v.InferOutput<F>
  : any;

/** 提取单个字段的别名映射: { [别名]: 字段value类型 } */
type ExtractFieldMap<F> = FindAlias<F> extends infer Al
  ? Al extends string
    ? { [key in Al]: FieldOutput<F> }
    : {}
  : {};

/** 从 root schema 递归提取所有别名 -> 字段类型 映射(any/unknown 及未覆盖的 schema 类型返回 {}) */
export type InferAliasMap<S> = unknown extends S
  ? {}
  : S extends { entries: infer E extends Record<string, any> }
    ? UnionToIntersection<{ [K in keyof E]: ExtractFieldMap<E[K]> }[keyof E]>
    : S extends { pipe: infer P extends readonly any[] }
      ? InferAliasMap<P[0]>
      : S extends { options: infer O extends readonly any[] }
        ? UnionToIntersection<InferAliasMap<O[number]>>
        : {};

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
 * 根据 keyPath 递归解析出 [value 类型, schema]。
 * Value: 当前字段值类型; Schema: 当前字段 schema。
 * RootValue/RootSchema: 根级; ParentValue/ParentSchema: 父级。
 * - '#' 从根级开始; '..' 从父级开始(单级退回); '@alias' 通过别名查询。
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
  ? [Value, Schema]
  : Path[0] extends '#'
    ? Resolve<RootValue, RootSchema, RootValue, RootSchema, any, any, AliasMap, RestPath<Path>>
    : Path[0] extends '..'
      ? Resolve<ParentValue, ParentSchema, RootValue, RootSchema, any, any, AliasMap, RestPath<Path>>
      : Path[0] extends `@${infer Al}`
        ? Al extends keyof AliasMap
          ? Resolve<AliasMap[Al], any, RootValue, RootSchema, any, any, AliasMap, RestPath<Path>>
          : [any, any]
        : Path extends [infer K, ...infer Rest]
          ? Rest extends KeyPath
            ? K extends keyof Value
              ? Resolve<Value[K], SubSchema<Schema, K>, RootValue, RootSchema, Value, Schema, AliasMap, Rest>
              : K extends number
                ? Resolve<FieldOutput<ItemSchema<Schema, K>>, ItemSchema<Schema, K>, RootValue, RootSchema, Value, Schema, AliasMap, Rest>
                : [any, any]
            : K extends keyof Value
              ? [Value[K], SubSchema<Schema, K>]
              : K extends number
                ? [FieldOutput<ItemSchema<Schema, K>>, ItemSchema<Schema, K>]
                : [any, any]
          : [any, any];

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
  AliasMap,
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

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

/**
 * 根据 keyPath 递归提取对应字段的值类型。
 * Value: 当前字段值类型; RootValue: 根级字段值类型; ParentValue: 父级字段值类型。
 * - '#' 从根级开始; '..' 从父级开始(单级退回)。
 */
type GetPathValue<
  Value,
  RootValue,
  ParentValue,
  AliasMap,
  Path extends KeyPath,
> = Path extends []
  ? Value
  : Path[0] extends '#'
    ? GetPathValue<RootValue, RootValue, any, AliasMap, RestPath<Path>>
    : Path[0] extends '..'
      ? GetPathValue<ParentValue, RootValue, any, AliasMap, RestPath<Path>>
      : Path[0] extends `@${infer Al}`
        ? Al extends keyof AliasMap
          ? GetPathValue<
              AliasMap[Al],
              RootValue,
              any,
              AliasMap,
              RestPath<Path>
            >
          : any
        : Path extends [infer K, ...infer Rest]
          ? K extends keyof Value
            ? Rest extends KeyPath
              ? GetPathValue<Value[K], RootValue, Value, AliasMap, Rest>
              : Value[K]
            : any
          : any;

/** 返回字段的父级值类型: 普通路径的父级是路径倒数第二个 key 的值; 特殊路径无法推导为 any */
type GetParentValue<Value, ParentValue, Path extends KeyPath> = Path extends []
  ? ParentValue
  : Path[0] extends '#' | '..' | `@${string}`
    ? any
    : Path extends [infer K, ...infer Rest]
      ? Rest extends KeyPath
        ? Rest extends []
          ? Value
          : K extends keyof Value
            ? GetParentValue<Value[K], ParentValue, Rest>
            : any
        : any
      : any;

/** get 的返回字段完整类型(携带正确的 RootValue/ParentValue/AliasMap) */
type GetResult<Value, RootValue, ParentValue, AliasMap, Path extends KeyPath> =
  _PiResolvedCommonViewFieldConfig<
    GetPathValue<Value, RootValue, ParentValue, AliasMap, Path>,
    RootValue,
    GetParentValue<Value, ParentValue, Path>,
    AliasMap
  >;

export type PiResolvedCommonViewFieldConfig<
  SelfResolvedFn extends () => any,
  Define,
  Value = any,
  RootValue = Value,
  ParentValue = any,
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
    readonly control?: FieldGroup<Value> | FieldArray<Value> | FieldControl<Value> | FieldLogicGroup<Value>;
    readonly parent: FieldGroup | FieldArray | FieldLogicGroup;
    readonly root: FieldGroup<Value> | FieldArray<Value> | FieldControl<Value> | FieldLogicGroup<Value>;
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
  ) => GetResult<Value, RootValue, ParentValue, AliasMap, K> | undefined;
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
> = PiResolvedCommonViewFieldConfig<
  () => _PiResolvedCommonViewFieldConfig<any>,
  CoreResolvedComponentDefine,
  Value,
  RootValue,
  ParentValue,
  AliasMap
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

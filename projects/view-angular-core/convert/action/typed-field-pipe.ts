import * as v from 'valibot';
import { Signal } from '@angular/core';
import { Observable } from 'rxjs';
import {
  HookConfig,
  PiFieldAtPath,
} from '../../builder-base/type/common-field-config';
import { KeyPath } from '../../util';
import { __actions } from './input-common';
import type { ConfigAction } from './input-common';
import { classAction } from './class';
import { wrappers } from './wrapper';
import { mergeHooks, removeHooks, setHooks, patchHooks } from './hook';
import { mergeOutputs, asyncMergeOutputs } from './output';
import { setProviders, patchProviders, changeProviders } from './provider';
import { hideWhen } from './hide-when';
import { disableWhen } from './disable-when';
import { valueChange } from './value-change';

type AsyncResult<T = any> = Promise<T> | Observable<T> | Signal<T> | (T & {});

/* ---------------- 类型: 把 field 回调绑定到指定 F ---------------- */

/** 可挂 field 的通用 key 组(props / inputs / models / slots) */
interface TypedKeyGroup<F> {
  patch: <T = any>(value: Record<string, any>) => ConfigAction<T>;
  set: <T = any>(value: Record<string, any>) => ConfigAction<T>;
  patchAsync: <Data extends Record<string, (field: F) => AsyncResult<any>>>(
    dataObj: Data,
  ) => ConfigAction<any>;
  remove: <T = any>(list: string[]) => ConfigAction<T>;
  mapAsync: <T = any>(
    fn: (field: F) => (value: any) => any,
  ) => ConfigAction<T>;
}

interface TypedOutputs<F> extends Omit<TypedKeyGroup<F>, 'patchAsync'> {
  patchAsync: <
    Data extends Record<string, (field: F) => (...args: any[]) => any>,
  >(
    dataObj: Data,
  ) => ConfigAction<any>;
  merge: typeof mergeOutputs;
  mergeAsync: typeof asyncMergeOutputs;
}

interface TypedEvents<F> extends Omit<TypedKeyGroup<F>, 'patchAsync'> {
  patchAsync: <
    Data extends Record<string, (field: F) => (event: Event) => any>,
  >(
    dataObj: Data,
  ) => ConfigAction<any>;
}

interface TypedAttributes<F> extends TypedKeyGroup<F> {
  top: {
    set: <T = any>(value: Record<string, any>) => ConfigAction<T>;
    patch: <T = any>(value: Record<string, any>) => ConfigAction<T>;
  };
}

interface TypedHooks<F> {
  set: <B>(hooks: HookConfig<F>) => ConfigAction<B>;
  patch: <B>(hooks: HookConfig<F>) => ConfigAction<B>;
  merge: <B>(
    hooks: HookConfig<F>,
    options?: { position: 'top' | 'bottom' },
  ) => ConfigAction<B>;
  remove: <T>(list: (keyof HookConfig<F>)[]) => ConfigAction<T>;
}

/** 所有 action 的强类型形态, F = 该路径对应的 field 类型 */
export interface TypedActions<
  Root extends v.BaseSchema<any, any, any>,
  P extends KeyPath,
> {
  props: TypedKeyGroup<PiFieldAtPath<Root, P>>;
  inputs: TypedKeyGroup<PiFieldAtPath<Root, P>>;
  models: TypedKeyGroup<PiFieldAtPath<Root, P>>;
  slots: TypedKeyGroup<PiFieldAtPath<Root, P>>;
  attributes: TypedAttributes<PiFieldAtPath<Root, P>>;
  outputs: TypedOutputs<PiFieldAtPath<Root, P>>;
  events: TypedEvents<PiFieldAtPath<Root, P>>;
  hooks: TypedHooks<PiFieldAtPath<Root, P>>;
  createOptions: {
    patch: <T = any>(value: any) => ConfigAction<T>;
    set: <T = any>(value: any) => ConfigAction<T>;
  };
  providers: {
    set: typeof setProviders;
    patch: typeof patchProviders;
    change: typeof changeProviders;
  };
  class: typeof classAction;
  wrappers: typeof wrappers;
  hideWhen: typeof hideWhen;
  disableWhen: typeof disableWhen;
  valueChange: typeof valueChange;
}

/** 收集到的一条「路径 -> actions」 */
export interface FieldEntry {
  readonly path: KeyPath;
  readonly actions: readonly any[];
}

/** 特殊路径段: 根 / 父级 / 别名, 静态无法校验, 直接放行 */
type SpecialKey = '#' | '..' | `@${string}`;

/**
 * 由 schema 的输出类型逐段展开「合法路径联合」, 让写错的路径在编译期就报错。
 * D 用于限深, 防止宽 schema 发生组合爆炸。
 */
export type PathsOf<V, D extends readonly unknown[] = [0, 0, 0, 0, 0, 0]> = D extends [
  unknown,
  ...infer R,
]
  ?
      | []
      | [SpecialKey, ...PathsOf<any, R>]
      | (V extends readonly (infer E)[] ? [number, ...PathsOf<E, R>] : never)
      | (V extends Record<string, any>
          ? {
              [K in keyof V & string]: [K, ...PathsOf<V[K], R>];
            }[keyof V & string]
          : never)
  : [];

/**
 * 不含特殊段('#' / '..' / '@alias')的「纯字段路径」联合。
 *
 * pipe 是从根级逐层往下合并 actions, `mergeAt` 只认 entries / item / items / options / value / wrapped,
 * 特殊段在合并侧根本没有落点(写了就是运行期抱错), 所以定义路径时只保留「一层一个字段」的正常路径。
 *
 * 注意: 回调里的 `field.get([...])` 走的是 `KeyPath`, 不受此类型约束,
 * '#' / '..' / '@alias' 依旧可用。
 */
export type FieldPathsOf<
  V,
  D extends readonly unknown[] = [0, 0, 0, 0, 0, 0],
> = D extends [unknown, ...infer R]
  ?
      | []
      | (V extends readonly (infer E)[]
          ? [number, ...FieldPathsOf<E, R>]
          : never)
      | (V extends Record<string, any>
          ? {
              [K in keyof V & string]: [K, ...FieldPathsOf<V[K], R>];
            }[keyof V & string]
          : never)
  : [];

/** 定义单条 entry; 泛型 P 在这里独立推断, 所以每条路径各自精确 */
export type DefineEntry<Root extends v.BaseSchema<any, any, any>> = <
  P extends PathsOf<v.InferOutput<Root>>,
>(
  path: [...P],
  fn: ($: TypedActions<Root, P>) => readonly any[],
) => FieldEntry;

/* ---------------- 运行时: 把 actions 按路径合并进 schema ---------------- */

const allActions: any = {
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
/** intersect / union */
type OptionsSchema = v.IntersectSchema<any, any> | v.UnionSchema<any, any>;
/** record / map / set */
type ValueSchema =
  | v.RecordSchema<any, any, any>
  | v.MapSchema<any, any, any>
  | v.SetSchema<any, any>;
/** optional / nullable / nullish */
type WrappedSchema =
  | v.OptionalSchema<any, any>
  | v.NullableSchema<any, any>
  | v.NullishSchema<any, any>;

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
const isItemSchema = (s: AnySchema): s is v.ArraySchema<any, any> => 'item' in s;
const isItemsSchema = (s: AnySchema): s is ItemsSchema => 'items' in s;
/** options 只有 intersect/union 是子 schema 列表(picklist/enum 的是值列表) */
const isOptionsSchema = (s: AnySchema): s is OptionsSchema =>
  'options' in s && (s.type === 'intersect' || s.type === 'union');
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
    case 'optional':
      return v.optional(changed.wrapped, s.default);
    case 'nullable':
      return v.nullable(changed.wrapped, s.default);
    case 'nullish':
      return v.nullish(changed.wrapped, s.default);
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
  const define: DefineEntry<S> = (path: KeyPath, fn: any) => ({
    path,
    actions: fn(allActions) ?? [],
  });

  let result: AnySchema = schema;
  for (const entry of cb(define) ?? []) {
    result = mergeAt(result, entry.path, entry.actions);
  }
  return result as S;
}

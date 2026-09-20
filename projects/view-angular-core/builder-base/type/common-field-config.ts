import { Injector, Signal, WritableSignal } from '@angular/core';
import * as v from 'valibot';

import {
  EntriesOf,
  ItemOf,
  ItemsOf,
  OptionsOf,
  PipeOf,
  RestOf,
  ValueNodeOf,
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
import { KeyPath, Wrapper$, LazyImport, ToKeyPath } from '../../util';
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
  ValueNodeOf<S> extends infer V
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
/**
 * 类型层看不清内部结构的 schema: 下钻结果只能保持宽松(any)。
 * lazy 的 getter 在类型层解不出来, 必须算进来,
 * 否则 `['lazyField', 'child']` 这类合法路径会被误判成「查不到」。
 */
type NavOpaque<S> = 0 extends 1 & S
  ? true
  : unknown extends S
    ? true
    : [S] extends [v.LazySchema<any> | v.AnySchema | v.UnknownSchema]
      ? true
      : [S] extends [{ readonly type: string }]
        ? string extends S['type']
          ? true
          : false
        : false;

/**
 * 子 schema 取不到时回退到 intersect/union 成员;
 * 仍取不到时区分两种情况:
 * - 结构看不清(any / unknown / lazy / 裸 BaseSchema) → any, 保持宽松;
 * - 明确是叶子(如 v.number()) → never, 让「查得过深」的路径解不出字段。
 */
type SubSchemaOrItem<S, K> = [SubSchema<S, K>] extends [never]
  ? [ItemSchema<S, K>] extends [never]
    ? NavOpaque<CoreSchemaOf<S>> extends true
      ? any
      : never
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
            ? [SubSchemaOrItem<Schema, K>] extends [never]
              ? never
              : Resolve<
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
  Resolve<Schema, RootSchema, ParentSchema, AliasMap, Path> extends infer R
    ? // Resolve 解不出时返回 never, 而 never 能匹配任意元组,
      // 必须先用 [R] 拦下, 否则会当成解到了字段
      [R] extends [never]
      ? never
      : R extends [
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
        : never
    : never;

/**
 * 字面量路径但 K 已退化成约束(= 路径不在 token 集合内) → never。
 * 与 undefined 联合后塔成 undefined, 让误用在属性访问处暴露。
 */
type GetFound<
  Schema,
  RootSchema,
  ParentSchema,
  AliasMap,
  W extends readonly unknown[],
> = [
  AllTokensValid<
    W,
    GetPathToken<Schema, RootSchema, ParentSchema, AliasMap>
  >,
] extends [false]
  ? never
  : [
      BalanceOk<ToKeyPath<W>, UpBudget<Schema, RootSchema, ParentSchema>>,
    ] extends [true]
    ? GetResult<Schema, RootSchema, ParentSchema, AliasMap, ToKeyPath<W>>
    : never;

/** 路径非法时落在实参类型上的错误标记 */
export interface PiPathNotResolvable {
  readonly __piPathNotResolvable:
    | '该路径在当前 schema 上解不出字段: 下钻过深 / 上溯越界'
    | unknown;
}

/**
 * 常量元组 vs 通用数组。
 * 常量元组的 length 是具体字面量(1/2/3...), 通用数组的 length 是 number。
 * 这是唯一能把「写死的字面量路径」和「运行时拼出来的 KeyPath」分开的类型判据。
 */
type IsConstTuple<T extends { readonly length: number }> =
  number extends T['length'] ? false : true;

/**
 * 调用处闸门。
 * 补全用的 DotPathTokens 是「按位并集」的近似 —— '#' 之后为了不把根级 key
 * 混进前面位置的补全, 尾段只能放宽成 LooseKeyPath。
 * 真实合法性在这里判定: 解不出字段就让调用处直接编译报错。
 */
type PathGate<
  Schema,
  RootSchema,
  ParentSchema,
  AliasMap,
  K extends readonly unknown[],
> = // schema 本身就是 any 时根本无从判定, 直接放行;
// 否则内部转发点(泛型未实例化)会被这个交叉卡住。
0 extends 1 & Schema
  ? unknown
  : [GetFound<Schema, RootSchema, ParentSchema, AliasMap, K>] extends [never]
    ? PiPathNotResolvable
    : unknown;

/**
 * get 的入参形态。
 * K 承接常量字面量路径(交叉 PathGate 做合法性判定);
 * G 只用来承接「通用 KeyPath 变量」—— 一旦它被推断成常量元组,
 * 说明调用方写的是一条字面量路径, 直接抹掉这个分支, 逼回 K 去报错。
 */
type GetArg<
  Schema,
  RootSchema,
  ParentSchema,
  AliasMap,
  K extends readonly unknown[],
  G extends KeyPath,
> =
  | (K & PathGate<Schema, RootSchema, ParentSchema, AliasMap, K>)
  | (IsConstTuple<G> extends true ? never : G);

/* ---------- get 路径补全提示 ---------- */

/** 别名 token: @别名 (逐层展开作用域, 避免联合类型取 keyof 只剩公共键) */
type AliasPathToken<AliasMap> = AliasMap extends readonly (infer Scope)[]
  ? Scope extends unknown
    ? `@${Extract<keyof Scope, string>}`
    : never
  : never;

/** 结构 key: 对象键 / 数组下标 / record 键 / intersect|union 成员下标 */
type StructPathKey<S> = unknown extends S
  ? string | number
  :
      | StructByArray<S>
      | StructByEntries<S>
      | StructByTuple<S>
      | StructByRecord<S>
      | StructByOptions<S>
      | StructByNested<S>;

type StructByArray<S> =
  ItemOf<S> extends infer T ? ([T] extends [never] ? never : number) : never;

type StructByEntries<S> =
  EntriesOf<S> extends infer E
    ? [E] extends [never]
      ? never
      : E extends unknown
        ? Extract<keyof E, string | number>
        : never
    : never;

type StructByTuple<S> = [S] extends [VsTupleHost] ? number : never;

type StructByRecord<S> =
  ValueNodeOf<S> extends infer V
    ? [V] extends [never]
      ? never
      : string | number
    : never;

type StructByOptions<S> =
  OptionsOf<S> extends infer O ? ([O] extends [never] ? never : number) : never;

type StructByNested<S> =
  PipeOf<S> extends infer P
    ? [P] extends [never]
      ? WrappedOf<S> extends infer W
        ? [W] extends [never]
          ? never
          : StructPathKey<W>
        : never
      : P extends readonly [infer F, ...any[]]
        ? StructPathKey<F>
        : never
    : never;

/**
 * 子 schema 集合: 对象值 / 数组项 / tuple 项 / record 值 / intersect|union 成员。
 * 先拦 never, 否则 CoreSchemaOf<never> 会退化成 any 而污染 token。
 */
type ChildSchemaOf<S> = [S] extends [never]
  ? never
  : S extends unknown
    ? ChildOfSingle<S>
    : never;

type ChildOfSingle<S> = CoreSchemaOf<S> extends infer C
  ? [C] extends [never]
    ? never
    : C extends unknown
      ?
          | EntriesOf<C>[keyof EntriesOf<C>]
          | ItemOf<C>
          | ItemsOf<C>[number]
          | ValueNodeOf<C>
          | OptionsOf<C>[number]
      : never
  : never;

/** 逐层下钻收集后代 key, 保证 ['a','b','c'] 这类多层路径同样能补全 */
type DeepStructPathKey<S, Depth extends readonly unknown[]> = unknown extends S
  ? string | number
  : Depth extends readonly [unknown, ...infer DR]
    ?
        | StructPathKey<S>
        | ([ChildSchemaOf<S>] extends [never]
            ? never
            : DeepStructPathKey<ChildSchemaOf<S>, DR>)
    : never;

/** 补全递归深度上限, 超出后不再收集更深层 key */
type PathSuggestDepth = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];

/**
 * 剔除「无结构信息」的 schema, 否则 token 会退化成无意义的窄集合。
 * 命中任一即视为未强类型化: any / unknown / v.any() / v.unknown() / 裸 BaseSchema。
 * 裸 BaseSchema 的 type 是加宽 string(具体 schema 是字面量), 拿它当判据。
 */
type ExcludeLooseSchema<T> = 0 extends 1 & T
  ? never
  : unknown extends T
    ? never
    : [T] extends [{ type: 'any' | 'unknown' }]
      ? never
      : [T] extends [{ readonly type: string }]
        ? string extends T['type']
          ? never
          : T
        : T;

/** 严格相等: 判断两个 schema 是否为同一类型 */
type SameSchema<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false;

/**
 * 是否处于根级: 既没有父级 schema, 自身又就是根 schema。
 * 根级没有上层, `..` 不该出现在补全里。
 * 只看 ParentSchema 不够 —— `get(['..'])` 的结果 ParentSchema 也是 any,
 * 但它不是根, 还能继续往上退。
 */
type IsRootLevel<Schema, RootSchema, ParentSchema> = [
  ExcludeLooseSchema<ParentSchema>,
] extends [never]
  ? SameSchema<Schema, RootSchema>
  : false;

/** 深度搜索上限, 一元组 */
type DepthCap = [1, 1, 1, 1, 1, 1, 1, 1];

/** 深度恰好为 N 长度的节点中, 是否存在与 Target 同构的节点 */
type AtDepth<Root, Target, N extends readonly unknown[]> = Root extends unknown
  ? N extends readonly [unknown, ...infer NR]
    ? AtDepth<ChildSchemaOf<Root>, Target, NR>
    : SameSchema<Root, Target>
  : never;

/** Target 在根树中的最大深度(一元组); 找不到返回 never */
type DepthOf<Root, Target, N extends readonly unknown[]> =
  true extends AtDepth<Root, Target, N>
    ? N
    : N extends readonly [unknown, ...infer NR]
      ? DepthOf<Root, Target, NR>
      : never;

/**
 * 当前字段还能上溯几层(一元组长度)。
 * 用 ParentSchema 在根树中的深度 + 1 得出, 无需给字段类型加新泛型。
 * number 表示未知/不限制, 避免误伤拿不到 schema 的场景。
 */
type UpBudget<Schema, RootSchema, ParentSchema> = [
  TightSchemas<Schema, RootSchema, ParentSchema>,
] extends [never]
  ? number
  : IsRootLevel<Schema, RootSchema, ParentSchema> extends true
    ? []
    : [ExcludeLooseSchema<ParentSchema>] extends [never]
      ? number
      : [DepthOf<RootSchema, ParentSchema, DepthCap>] extends [never]
        ? number
        : [unknown, ...DepthOf<RootSchema, ParentSchema, DepthCap>];

/**
 * 位置化路径约束: 前 N 个位置允许上溯 token, 预算用尽后不再给。
 * 必须保持「带 rest 元素的元组并集」形态 —— 纯递归元组并集会掉掉补全。
 */
type DotPath<Budget, TDot, TNo> =
  | readonly TNo[]
  | (Budget extends readonly [unknown, ...infer BRest]
      ? readonly [TDot, ...DotPath<BRest, TDot, TNo>]
      : Budget extends number
        ? readonly TDot[]
        : never);

/**
 * 路径长度上限(一元组)。同时决定枚举规模:
 * 上限 8 → 约 2k 个联合成员, 上限 10 → 约 12k, 远低于 TS 的 10 万上限。
 */
type PathLenCap = [1, 1, 1, 1, 1, 1, 1, 1];

/**
 * 本层可写的 key。
 * 层级 schema 拿不准(any / unknown) 时回退到合并 token 集, 保持宽松。
 */
type DownKeyAt<Cur, Fallback> = [ExcludeLooseSchema<Cur>] extends [never]
  ? Fallback
  : StructPathKey<Cur>;

/**
 * 精确枚举合法路径(Dyck 语言): 任意前缀里 '..' 的个数不能超过已下钻的层数。
 * Cur = 当前层 schema 集合; Up = 上一层 schema('..' 的落点); Root = 根 schema。
 * D = 当前深度(一元组); L = 剩余长度预算。
 *
 * 下钻段的 token 逐层随 Cur 收窄 —— 叶子之后不再补出任何 key。
 * 本类型不含 '#' 段: '#' 只允许出现在路径第 0 位, 由 DotPathTokens 单独拼。
 */
type DyckPaths<
  Cur,
  Up,
  Root,
  Fallback,
  AliasMap,
  D extends readonly unknown[],
  L extends readonly unknown[],
> =
  | readonly []
  | (L extends readonly [unknown, ...infer LRest]
      ?
        | readonly [
            DownKeyAt<Cur, Fallback> | AliasPathToken<AliasMap>,
            ...DyckPaths<
              ChildSchemaOf<Cur>,
              Up,
              Root,
              Fallback,
              AliasMap,
              [...D, unknown],
              LRest
            >,
          ]
        | (D extends readonly [unknown, ...infer DR]
            ? readonly [
                '..',
                ...DyckPaths<Up, any, Root, Fallback, AliasMap, DR, LRest>,
              ]
            : never)
      : never);

/** 预算封顶, 避免无限增长 */
type GrowBudget<B extends readonly unknown[]> =
  B['length'] extends DepthCap['length'] ? B : [unknown, ...B];

/**
 * 逐位校验上溯余额: 遇普通键下钻一层(余额 +1), 遇 '..' 上退一层(余额 -1)。
 * 余额不够就解析不到。补全用的是位置化近似, 这里才是真实语义。
 */
type BalanceOk<
  Path extends readonly unknown[],
  B extends readonly unknown[] | number,
> = B extends number ? true : B extends readonly unknown[] ? BalanceTuple<Path, B>
  : never;

type BalanceTuple<Path extends readonly unknown[], B extends readonly unknown[]> =
  Path extends readonly [infer H, ...infer Rest]
    ? H extends '..'
      ? B extends readonly [unknown, ...infer BR]
        ? BalanceTuple<Rest, BR>
        : false
      : H extends '#'
        ? BalanceTuple<Rest, []>
        : BalanceTuple<Rest, GrowBudget<B>>
    : true;

/**
 * 路径每一位都必须是合法 token, 否则整条路径解不出来。
 * '..' 不在此列 —— 它语法上总是存在, 能不能走由 BalanceOk 的余额说了算。
 * '#' 只允许出现在第 0 位, 出现在后面一律非法。
 */
type AllTokensValid<
  Path extends readonly unknown[],
  Tok,
  NotFirst extends boolean = false,
> = Path extends readonly [infer H, ...infer Rest]
  ? [H] extends ['#']
    ? NotFirst extends true
      ? false
      : AllTokensValid<Rest, Tok, true>
    : H extends '..' | Tok
      ? AllTokensValid<Rest, Tok, true>
      : false
  : true;

/** get 路径的位置化约束 */
/**
 * get 路径的约束: 精确枚举合法路径。
 * 初始深度 = 当前字段距根的层数; 深度未知时取上限, 宁松勿紧。
 * Fallback = 层级 schema 拿不准时使用的合并 token 集(自身/根/父 逐层展开)。
 * '#' 段只在最外层出现一次, 其后按根 schema 逐层下钻。
 */
export type DotPathTokens<Schema, RootSchema, ParentSchema, AliasMap> = [
  TightSchemas<Schema, RootSchema, ParentSchema>,
] extends [never]
  ? readonly (string | number)[]
  :
    | readonly [
        '#',
        ...DyckPaths<
          RootSchema,
          RootSchema,
          RootSchema,
          DeepStructPathKey<RootSchema, PathSuggestDepth>,
          AliasMap,
          [],
          PathLenCap
        >,
      ]
    | DyckPaths<
        Schema,
        ParentSchema,
        RootSchema,
        DeepStructPathKey<
          TightSchemas<Schema, RootSchema, ParentSchema>,
          PathSuggestDepth
        >,
        AliasMap,
        InitDepth<UpBudget<Schema, RootSchema, ParentSchema>>,
        PathLenCap
      >;

/** 一元组深度; number(未知) 映射到上限 */
type InitDepth<B extends readonly unknown[] | number> =
  B extends number ? PathLenCap : B;

/** 当前节点可输入的路径片段 */
export type FieldPathToken<S, AliasMap = {}, AllowParent = true> =
  | '#'
  | (AllowParent extends true ? '..' : never)
  | AliasPathToken<AliasMap>
  | DeepStructPathKey<S, PathSuggestDepth>;

/**
 * 三个 schema 分别剔除 any/unknown 后再合并。
 * 必须先逐个剔除: `T | any` 会在创建结合时直接塌成 any。
 */
type TightSchemas<Schema, RootSchema, ParentSchema> =
  | ExcludeLooseSchema<Schema>
  | ExcludeLooseSchema<RootSchema>
  | ExcludeLooseSchema<ParentSchema>;

/**
 * get 路径 token 集合。
 * 除了自身, 还合并根级/父级 与别名, 因为 `#` / `..` 可以从当前节点跳到任意层。
 * 三者都是 any/unknown 时退回宽松, 保证未绑定泛型的场景不收紧。
 * 根级字段没有上层, 不给 `..`。
 */
type GetPathToken<Schema, RootSchema, ParentSchema, AliasMap> = [
  TightSchemas<Schema, RootSchema, ParentSchema>,
] extends [never]
  ? string | number
  : FieldPathToken<
      TightSchemas<Schema, RootSchema, ParentSchema>,
      AliasMap,
      IsRootLevel<Schema, RootSchema, ParentSchema> extends true ? false : true
    >;

/** get 的 aliasNotFoundFn 参数 */
type GetAliasNotFoundFn = (
  name: string,
  field: PiResolvedCommonViewFieldConfig<any, any>,
) => PiResolvedCommonViewFieldConfig<any, any>;

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
  get: <
    const K extends DotPathTokens<Schema, RootSchema, ParentSchema, AliasMap>,
    const G extends KeyPath = never,
  >(
    keyPath: GetArg<Schema, RootSchema, ParentSchema, AliasMap, K, G>,
    aliasNotFoundFn?: GetAliasNotFoundFn,
  ) => string extends K[number]
    ? PiResolvedCommonViewFieldConfig<any, any, any, any, any, any> | undefined
    : IsConstTuple<K> extends true
      ? GetFound<Schema, RootSchema, ParentSchema, AliasMap, K> | undefined
      : PiResolvedCommonViewFieldConfig<any, any, any, any, any, any> | undefined;
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

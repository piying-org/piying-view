import * as v from 'valibot';

/**
 * valibot 结构适配层
 *
 * 全项目唯一允许直接依赖 valibot schema 内部结构的地方。
 * 一律用 valibot 导出的具名接口 + 泛型位置提取:
 * - valibot 改「属性名」→ 泛型位置不变, 此处自动跟随
 * - valibot 改「导出名」→ 此处立刻编译报错, 不会静默退化成 any/never
 */

/* ---------- 判别用联合 ---------- */

/** object 族 */
export type VsEntriesHost =
  | v.ObjectSchema<any, any>
  | v.LooseObjectSchema<any, any>
  | v.StrictObjectSchema<any, any>
  | v.ObjectWithRestSchema<any, any, any>;

/** tuple 族(含 loose/strict/withRest) */
export type VsTupleHost =
  | v.TupleSchema<any, any>
  | v.LooseTupleSchema<any, any>
  | v.StrictTupleSchema<any, any>
  | v.TupleWithRestSchema<any, any, any>;

/** intersect / union / variant */
export type VsOptionsHost =
  | v.IntersectSchema<any, any>
  | v.UnionSchema<any, any>
  | v.VariantSchema<any, any, any>;

/** wrapped 家族: 只包一层 wrapped 子 schema 的包装器 */
export type VsWrappedHost =
  | v.OptionalSchema<any, any>
  | v.NullableSchema<any, any>
  | v.NullishSchema<any, any>
  | v.ExactOptionalSchema<any, any>
  | v.UndefinedableSchema<any, any>
  | v.NonNullableSchema<any, any>
  | v.NonNullishSchema<any, any>
  | v.NonOptionalSchema<any, any>;

/** record / map / set: 带单个「值节点」的容器 */
export type VsValueHost =
  | v.RecordSchema<any, any, any>
  | v.MapSchema<any, any, any>
  | v.SetSchema<any, any>;

/** pipe */
export type VsPipeHost = v.SchemaWithPipe<
  readonly [v.BaseSchema<any, any, any>, ...any[]]
>;

/** array + tuple 族, 用于「是否该渲染成 FieldArray」 */
export type VsArrayLikeHost = v.ArraySchema<any, any> | VsTupleHost;

/* ---------- 结构提取 ---------- */

/** object 族 的 entries */
export type EntriesOf<S> = S extends
  | v.ObjectSchema<infer E, any>
  | v.LooseObjectSchema<infer E, any>
  | v.StrictObjectSchema<infer E, any>
  | v.ObjectWithRestSchema<infer E, any, any>
  ? E
  : never;

/** array 的 item */
export type ItemOf<S> = S extends v.ArraySchema<infer T, any> ? T : never;

/** tuple 族 的 items */
export type ItemsOf<S> = S extends
  | v.TupleSchema<infer I, any>
  | v.LooseTupleSchema<infer I, any>
  | v.StrictTupleSchema<infer I, any>
  | v.TupleWithRestSchema<infer I, any, any>
  ? I
  : never;

/**
 * intersect / union / variant 的 options
 *
 * 必须用嵌套条件而不是 `A<infer O> | B<infer O> | C<infer O>`:
 * `VariantSchema<any, infer O, any>` 的 TKey 为 any 时约束退化,
 * 会让 union 形式多喂一个候选 O, 冲突后整个推断塌成 never。
 */
export type OptionsOf<S> =
  S extends v.IntersectSchema<infer O, any>
    ? O
    : S extends v.UnionSchema<infer O, any>
      ? O
      : S extends v.VariantSchema<any, infer O, any>
        ? O
        : never;

/** variant 的判别 key */
export type VariantKeyOf<S> =
  S extends v.VariantSchema<infer K, any, any> ? K : never;

/** record 的 value */
export type RecordValueOf<S> =
  S extends v.RecordSchema<any, infer V, any> ? V : never;

/** record / map / set 的 value 节点 */
export type ValueNodeOf<S> = S extends
  | v.RecordSchema<any, infer V, any>
  | v.MapSchema<any, infer V, any>
  | v.SetSchema<infer V, any>
  ? V
  : never;

/** record / map 的 key 节点(set 无 key 节点, 落到 never) */
export type KeyNodeOf<S> =
  S extends v.RecordSchema<infer K, any, any>
    ? K
    : S extends v.MapSchema<infer K, any, any>
      ? K
      : never;

/** object_with_rest / tuple_with_rest 的 rest */
export type RestOf<S> = S extends
  | v.ObjectWithRestSchema<any, infer R, any>
  | v.TupleWithRestSchema<any, infer R, any>
  ? R
  : never;

/** wrapped 家族的 wrapped */
export type WrappedOf<S> =
  S extends v.OptionalSchema<infer W, any>
    ? W
    : S extends v.NullableSchema<infer W, any>
      ? W
      : S extends v.NullishSchema<infer W, any>
        ? W
        : S extends v.ExactOptionalSchema<infer W, any>
          ? W
          : S extends v.UndefinedableSchema<infer W, any>
            ? W
            : S extends v.NonNullableSchema<infer W, any>
              ? W
              : S extends v.NonNullishSchema<infer W, any>
                ? W
                : S extends v.NonOptionalSchema<infer W, any>
                  ? W
                  : never;

/** pipe 的元组 */
export type PipeOf<S> =
  S extends v.SchemaWithPipe<
    infer P extends readonly [v.BaseSchema<any, any, any>, ...any[]]
  >
    ? P
    : never;

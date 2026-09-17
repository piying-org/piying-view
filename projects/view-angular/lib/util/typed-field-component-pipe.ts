import * as v from 'valibot';
import { Type, WritableSignal } from '@angular/core';
import {
  createDefineComponentEntry,
  typedFieldPipe,
  ɵtypedFieldActions,
} from '@piying/view-angular-core';
import type {
  AnyOutputsHandlerMap,
  CompActionFactoriesOf,
  CompEntryAction,
  CompTables,
  FieldEntry,
  FieldPathsOf,
  KeyPath,
  LazyImport,
  PiCommonConfig,
  PiTypeConfig,
  SchemaTypeAt,
  TightenEmpty,
  TypesOf,
  UnwrapConfig,
} from '@piying/view-angular-core';
import type {
  ActionComponent,
  GetComponentInputs,
  GetComponentInputsOrigin,
  GetComponentModelKeys,
  GetComponentModelsOrigin,
  GetComponentOutputs,
  GetComponentOutputsHandlerMap,
  GetComponentOutputsOrigin,
} from './typed-component';

/**
 * 组件类型 -> 表。
 *
 * 这是 Angular 侧唯一需要写的「读组件」逻辑:
 * 把 `input()` / `output()` / `model()` 的解析结果打包成 `CompTables` 的形状,
 * 之后骨架(工厂 / entry / outputChange)全在 core 里复用一份。
 *
 * 推不出组件时落到宽松表: 降级不等于封死,
 * 根路径、props、hooks 等基础功能全部保留, 只是不再校验 key 名。
 */
type TablesOfComponent<C> = [C] extends [never]
  ? {
      inputKeys: string;
      inputsOrigin: Record<string, any>;
      outputKeys: string;
      outputsOrigin: Record<string, (...args: any[]) => any>;
      outputsHandlerMap: AnyOutputsHandlerMap;
      modelKeys: string;
      modelsOrigin: Record<string, WritableSignal<any>>;
    }
  : {
      inputKeys: Extract<keyof GetComponentInputs<C>, string>;
      inputsOrigin: TightenEmpty<GetComponentInputsOrigin<C>>;
      outputKeys: Extract<keyof GetComponentOutputs<C>, string>;
      outputsOrigin: TightenEmpty<GetComponentOutputsOrigin<C>>;
      outputsHandlerMap: GetComponentOutputsHandlerMap<C>;
      modelKeys: GetComponentModelKeys<C>;
      modelsOrigin: TightenEmpty<GetComponentModelsOrigin<C>>;
    };

/**
 * 组件版 action 工厂集合。
 *
 * `Tables` 只当配对通道上的上界, 真正生效的表由 entry 的期望元素类型反推,
 * 所以这里直接复用 core 的骨架, 不再按组件重写一遍。
 */
export type TypedComponentActionFactories<Cfg = unknown> =
  CompActionFactoriesOf<CompTables, Cfg>;

/** 可用的组件标识: 配置里注册的类型 key, 直接传组件类, 或者直接传懒加载函数 */
export type ComponentKeyOf<Cfg> =
  | keyof TypesOf<Cfg>
  | Type<any>
  | LazyImport<any>;

/** 能不能从配置项里解析出组件: 直接给 type(含懒加载), 要么给了非空 actions */
type IsComponentLike<A> = A extends {
  type: Type<any> | LazyImport<any>;
}
  ? true
  : A extends { actions: readonly [any, ...any[]] }
    ? true
    : false;

/**
 * 由组件标识解析出真正的组件类型。
 *
 * 解析不出组件时落到 never 而不是 any:
 * `any` 会让 `GetComponentInputsOrigin<any>` 退化成宽松对象,
 * 配置项写错(比如把 type 拼成别的 key)时不报错, input/output 的 key 约束整体静默失效。
 */
export type ComponentOf<Cfg, K> = K extends keyof TypesOf<Cfg>
  ? IsComponentLike<TypesOf<Cfg>[K]> extends true
    ? ActionComponent<Extract<TypesOf<Cfg>[K], PiTypeConfig<any, any>>>
    : never
  : K;

/**
 * 省略 component 时的默认组件: 拿该路径 schema 的 `type` 去配置的 `types` 里查。
 *
 * 没注册时落到 never(= 宽松表), 而不是把 'string' 这种字串当成组件传下去 ——
 * 后者会让表退化成 `Record<string, never>` 把 input/output 封死。
 */
type DefaultComponentOf<Cfg, K extends string> = K extends keyof TypesOf<Cfg>
  ? ComponentOf<Cfg, K>
  : never;

type DefaultTables<
  Root extends v.BaseSchema<any, any, any>,
  Cfg,
  P extends KeyPath,
> = TablesOfComponent<DefaultComponentOf<Cfg, SchemaTypeAt<Root, P>>>;

/**
 * 定义单条 entry: 路径 + 组件 + 该路径下的 actions。
 *
 * - 路径 P 由第一个实参推断, 组件 K 由第二个实参推断;
 * - 组件先翻成表再进 `CompEntryAction`, 工厂侧靠 `CompAction` 的配对通道拿到同一张表,
 *   所以 `d.inputs.patchAsync({...})` 的 key/值类型依旧由这条 entry 的组件决定。
 *
 * component 可省(或直接传 undefined): 走「默认设计」—— 用该路径 schema 的 `type`(如 'string') 当组件标识。
 */
export interface DefineComponentEntry<
  Root extends v.BaseSchema<any, any, any>,
  Cfg,
> extends TypedComponentActionFactories<Cfg> {
  <P extends FieldPathsOf<Root>, K extends ComponentKeyOf<Cfg> | undefined>(
    path: [...P],
    component: K,
    actions: readonly CompEntryAction<
      Root,
      P,
      [K] extends [undefined]
        ? DefaultTables<Root, Cfg, P>
        : TablesOfComponent<ComponentOf<Cfg, K>>
    >[],
  ): FieldEntry;
  /** 直接传 actions: 组件走默认的 schema `type` */
  <P extends FieldPathsOf<Root>>(
    path: [...P],
    actions: readonly CompEntryAction<Root, P, DefaultTables<Root, Cfg, P>>[],
  ): FieldEntry;
}

/**
 * typedFieldPipe + typedComponent 的组合形态。
 *
 * 按「路径 + 组件」写配置:
 * - 回调里的 field 与 `builder.get(path)` 类型完全等价, 可以直接 get;
 * - `d.inputs` / `d.outputs` 的 key 与值类型由该条 entry 的组件推导。
 *
 * component 可省: 不传时不下发 `setComponent`, 运行时自然按 schema 的 `type` 查配置,
 * 类型层用同一个 `type` 反推表 —— 「校验用的类型」与「真正渲染的组件」依旧同源。
 * 不需要组件类型时, 直接用 `typedFieldPipe`。
 *
 * 注意: 必须使用返回值, 原 schema 不被修改。
 */
export function typedFieldComponentPipe<
  S extends v.BaseSchema<any, any, any>,
  C extends PiCommonConfig | { define: PiCommonConfig },
>(
  schema: S,
  config: C,
  cb: (
    define: DefineComponentEntry<S, UnwrapConfig<C>>,
  ) => readonly FieldEntry[],
): S {
  const define = createDefineComponentEntry(
    ɵtypedFieldActions,
  ) as unknown as DefineComponentEntry<S, UnwrapConfig<C>>;

  return typedFieldPipe(schema, () => cb(define));
}

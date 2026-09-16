import type {
  AllowedComponentProps,
  ComponentCustomProps,
  DefineComponent,
  HTMLAttributes,
  VNodeProps,
} from 'vue';
import type { AsyncProperty, LazyImport, LazyMarkType, PiTypeConfig } from '@piying/view-core';

/** 组件实例 $props 上的框架内置 key, 既不是业务 input 也不是业务 output */
type BuiltinPropKeys = keyof VNodeProps | keyof AllowedComponentProps | keyof ComponentCustomProps;

/** 懒加载约定恒为 `() => Promise<组件类型>`, lazyMark 的包装形态一并解开 */
export type ResolveLazyComponent<T> =
  T extends LazyImport<infer R> ? R : T extends LazyMarkType<infer R> ? R : never;

/** 组件类型 -> 实例类型, 懒加载(含 lazyMark) 先解开一层 */
type ComponentInstance<C> =
  C extends LazyImport<infer R>
    ? ComponentInstance<R>
    : C extends LazyMarkType<infer R>
      ? ComponentInstance<R>
      : C extends abstract new (...args: any) => infer I
        ? I
        : never;

/**
 * 组件实例的 $props。
 *
 * Vue 把 props 与 emits(编译成 `onXxx` 处理器) 混在同一份 $props 里,
 * 所以 input / output 的 key 都从这一份按形态拆分。
 */
type InstanceProps<C> = ComponentInstance<C> extends { $props: infer P } ? P : Record<string, any>;

type OnKey<T> = Extract<keyof T, `on${string}`>;

/**
 * `onXxx` 且值是函数 -> 视为 emit 处理器。
 * 只按名字会把 `onLabel?: string` 这类普通 prop 误判成事件, 所以再校验一次形态。
 */
type EmitPropKey<T> = Exclude<
  {
    [K in OnKey<T>]: [NonNullable<T[K]>] extends [(...args: any[]) => any] ? K : never;
  }[OnKey<T>],
  BuiltinPropKeys
>;

/** 普通 prop 的 key */
type InputPropKey<T> = Exclude<keyof T, EmitPropKey<T> | BuiltinPropKeys>;

/** `onXxx` -> `xxx`, 与 Vue 的 `Capitalize` 互逆 */
type EmitNameOf<K> = K extends `on${infer N}` ? Uncapitalize<N> : never;

/**
 * 保留真实参数元组的处理器形态。
 * 直接写 `NonNullable<T[K]>` 的上界会落到 `{}`, 过不了 `Record<string, Fn>` 约束。
 */
type HandlerOf<T> = T extends (...args: infer A) => any ? (...args: A) => any : never;

/** 组件 input(普通 prop) 名 -> 值类型 */
export type GetComponentInputs<C> = {
  [K in InputPropKey<InstanceProps<C>>]: InstanceProps<C>[K];
};

/** 组件 output(emit) 名 -> 处理器签名 */
export type GetComponentEmits<C> = {
  [K in EmitPropKey<InstanceProps<C>> as EmitNameOf<K>]: HandlerOf<InstanceProps<C>[K]>;
};

export type GetComponentInputsOrigin<C> = Partial<GetComponentInputs<C>>;

export type GetComponentInputsAsync<C> = Partial<{
  [K in keyof GetComponentInputs<C>]: AsyncProperty<GetComponentInputs<C>[K]>;
}>;

export type GetComponentInputsKeys<C> = keyof GetComponentInputs<C>;

export type GetComponentOutputsOrigin<C> = Partial<GetComponentEmits<C>>;

export type GetComponentOutputsAsync<C> = Partial<{
  [K in keyof GetComponentEmits<C>]: AsyncProperty<GetComponentEmits<C>[K]>;
}>;

export type GetComponentOutputsKeys<C> = keyof GetComponentEmits<C>;

/**
 * 非 Partial 形态的「emit 名 -> 处理器签名」映射。
 * 用于把 outputChange 的 list 逐位推成真实 emit 参数元组。
 */
export type GetComponentOutputsHandlerMap<C> = GetComponentEmits<C>;

/**
 * 可作为「组件标识」传入的形态。
 *
 * `DefineComponent` 必须按全量 13 个类型参数写 any:
 * 只给前几个时, 后面几位的默认值会把 Props 约成具体类型,
 * 带「必填 prop」的 `<script setup>` 组件反而匹配不上, 会被当成「非组件」而降级成宽松表。
 */
export type VueComponent =
  | DefineComponent<any, any, any>
  | (abstract new (...args: any) => { $props: any })
  | LazyImport<any>;

/** 组件标识的完整集合: 额外放行 lazyMark 包装形态 */
export type VueComponentKey = VueComponent | LazyMarkType<any>;

/**
 * 由类型配置项解析出真正的组件类型。
 *
 * 解析不出组件时落到 never 而不是 any:
 * `any` 会让后续 input/output 的 key 约束整体静默失效。
 */
export type ActionComponent<A extends PiTypeConfig> = A['type'] extends VueComponent
  ? A['type']
  : [ResolveLazyComponent<A['type']>] extends [never]
    ? NonNullable<A['actions']>[0]['__type']
    : ResolveLazyComponent<A['type']>;

/**
 * attributes 的标准名: 直接借 vue/runtime-dom 的 HTMLAttributes。
 *
 * attributes 走 fallthrough 落到组件根元素上, 拿不到「根元素是哪个标签」,
 * 所以只能按「通用 HTML + ARIA 属性名」给补全;
 * `onXxx` 必须摘掉 —— 那是 events 的地盘。
 */
export type VueStandardAttrName = Exclude<Extract<keyof HTMLAttributes, string>, `on${string}`>;

/** 标准名 ∪ 任意自定义名(data-* 与组件自有的 fallthrough 属性等) */
export type VueAttributeName = VueStandardAttrName | (string & {});

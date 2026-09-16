import type { ComponentCustomProps, DefineComponent, HTMLAttributes } from 'vue';
import type { AsyncProperty, LazyImport, LazyMarkType, PiTypeConfig } from '@piying/view-core';

/** 懒加载约定恒为 `() => Promise<组件类型>`, lazyMark 的包装形态一并解开 */
export type ResolveLazyComponent<T> =
  T extends LazyImport<infer R> ? R : T extends LazyMarkType<infer R> ? R : never;

/** 先把懒加载(含 lazyMark) 解开, 回到真正的组件类型 */
type UnwrapLazyComponent<C> =
  C extends LazyImport<infer R>
    ? UnwrapLazyComponent<R>
    : C extends LazyMarkType<infer R>
      ? UnwrapLazyComponent<R>
      : C;

/** 组件类型 -> 实例类型, 懒加载(含 lazyMark) 先解开一层 */
type ComponentInstance<C> =
  UnwrapLazyComponent<C> extends abstract new (...args: any) => infer I ? I : never;

/**
 * 组件实例的 $props。
 *
 * Vue 2 的 props 与 emits 是两条独立通道(v-bind 与 v-on),
 * 不像 Vue 3 把 emit 编译成 `onXxx` prop, 所以 inputs 只看 $props。
 */
type InstanceProps<C> = ComponentInstance<C> extends { $props: infer P } ? P : Record<string, any>;

/**
 * 组件的 emits 声明。
 *
 * 从 `DefineComponent` 的第 8 个类型参数上取:
 * 数组写法落成 `("a" | "b")[]`, 对象写法落成 `{ a: (...args) => void }`。
 * 只能按位置匹配 —— `ComponentOptionsBase` 带 `[key: string]: any` 索引签名,
 * 用 `{ emits?: infer E }` 结构匹配会被索引签名吃掉, 直接得到 any。
 */
type EmitsOf<C> =
  UnwrapLazyComponent<C> extends DefineComponent<
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    infer E,
    any,
    any,
    any
  >
    ? E
    : never;

/** emits 声明 -> emit 名 */
type EmitNameOf<E> = E extends readonly (infer N extends string)[]
  ? N
  : E extends Record<string, any>
    ? Extract<keyof E, string>
    : never;

/**
 * emit 名 -> 处理器签名。
 *
 * 数组写法没有类型化的参数, 统一落到 `any[]`;
 * 对象写法保留真实参数元组, 供 outputChange 逐位对齐。
 */
type EmitHandlerOf<E, K extends string> = E extends readonly any[]
  ? (...args: any[]) => void
  : K extends keyof E
    ? [E[K]] extends [(...args: infer A) => any]
      ? (...args: A) => any
      : (...args: any[]) => void
    : never;

/** 组件 input(prop) 名 -> 值类型 */
export type GetComponentInputs<C> = {
  [K in Exclude<
    Extract<keyof InstanceProps<C>, string>,
    keyof ComponentCustomProps
  >]: InstanceProps<C>[K];
};

/** 组件 output(emit) 名 -> 处理器签名 */
export type GetComponentEmits<C> = {
  [K in EmitNameOf<EmitsOf<C>>]: EmitHandlerOf<EmitsOf<C>, K>;
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
 * `DefineComponent` 必须按全量 11 个类型参数写 any:
 * 只给前 3 个时, 后面几位的默认值会把 Props/E 锁成具体类型,
 * `<script setup>` 编译出的组件反而匹配不上, 组件会被当成「非组件」而降级。
 */
export type Vue2Component =
  | DefineComponent<any, any, any, any, any, any, any, any, any, any, any>
  | (abstract new (...args: any) => { $props: any })
  | LazyImport<any>;

/** 组件标识的完整集合: 额外放行 lazyMark 包装形态 */
export type Vue2ComponentKey = Vue2Component | LazyMarkType<any>;

/**
 * 由类型配置项解析出真正的组件类型。
 *
 * 解析不出组件时落到 never 而不是 any:
 * `any` 会让后续 input/output 的 key 约束整体静默失效。
 */
export type ActionComponent<A extends PiTypeConfig> = A['type'] extends Vue2Component
  ? A['type']
  : [ResolveLazyComponent<A['type']>] extends [never]
    ? NonNullable<A['actions']>[0]['__type']
    : ResolveLazyComponent<A['type']>;

/**
 * attributes 的标准名: 直接借 vue 自带的 HTMLAttributes(JSX 那一份),
 * 摘掉 `onXxx`(那是 events 的地盘, 不属于 attributes)。
 */
export type Vue2StandardAttrName = Exclude<Extract<keyof HTMLAttributes, string>, `on${string}`>;

/** 标准名 ∪ 任意自定义名(data-* 与组件自有的透传属性等) */
export type Vue2AttributeName = Vue2StandardAttrName | (string & {});

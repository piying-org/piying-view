import type { HTMLAttributes } from 'react';
import type {
  AsyncProperty,
  LazyImport,
  LazyMarkType,
  PiTypeConfig,
} from '@piying/view-core';

/** 懒加载约定恒为 `() => Promise<组件类型>`, lazyMark 的包装形态一并解开 */
export type ResolveLazyComponent<T> =
  T extends LazyImport<infer R>
    ? R
    : T extends LazyMarkType<infer R>
      ? R
      : never;

/**
 * 组件 -> props。
 *
 * React 没有统一的「组件实例」概念, props 的落点有三种:
 * 函数组件取首参, class 组件取实例的 props 字段, 懒加载先解开一层。
 */
type ComponentPropsOf<C> =
  C extends LazyImport<infer R>
    ? ComponentPropsOf<R>
    : C extends LazyMarkType<infer R>
      ? ComponentPropsOf<R>
      : C extends (props: infer P, ...args: any[]) => any
        ? P
        : C extends abstract new (...args: any) => infer I
          ? ComponentPropsOf<I>
          : C extends { props: infer P }
            ? P
            : never;

type StringKey<T> = Extract<keyof T, string>;

/** React 内置在 props 上的 key, 既不是业务 input 也不是业务 output */
type BuiltinPropKey = 'ref' | 'key';

/** `any` 会让 `X extends Fn` 恒真, 先把 any 挑出来单独处理 */
type IsAny<T> = 0 extends 1 & T ? true : false;

/**
 * 值为函数的 prop。
 *
 * React 侧 outputs 是以「prop 名原样」下发的(field-template 把 inputs/outputs/attributes
 * 一起 spread 成 props), 所以函数 prop 就是 output, 不做 onXxx -> xxx 的重命名。
 * 只按名字判断会把 `onClick?: string` 这类普通 prop 误判成事件, 所以再校验一次形态;
 * `any` 形态必须排除, 否则 `value?: any` 会被当成 output。
 */
type FunctionPropKey<T> = {
  [K in StringKey<T>]: IsAny<T[K]> extends true
    ? never
    : [NonNullable<T[K]>] extends [(...args: any[]) => any]
      ? K
      : never;
}[Exclude<StringKey<T>, BuiltinPropKey>];

/** 非函数 prop 的 key */
type InputPropKey<T> = Exclude<
  StringKey<T>,
  BuiltinPropKey | FunctionPropKey<T>
>;

/**
 * 保留真实参数元组的处理器形态。
 * 直接写 `NonNullable<T[K]>` 的上界会落到 `{}`, 过不了 `Record<string, Fn>` 约束。
 */
type HandlerOf<T> = T extends (...args: infer A) => any
  ? (...args: A) => any
  : never;

/** 组件 input(非函数 prop) 名 -> 值类型 */
export type GetComponentInputs<C> = {
  [K in InputPropKey<ComponentPropsOf<C>>]: ComponentPropsOf<C>[K];
};

/** 组件 output(函数 prop) 名 -> 处理器签名 */
export type GetComponentEmits<C> = {
  [K in FunctionPropKey<ComponentPropsOf<C>>]: HandlerOf<
    ComponentPropsOf<C>[K]
  >;
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
 * 非 Partial 形态的「output 名 -> 处理器签名」映射。
 * 用于把 outputChange 的 list 逐位推成真实 emit 参数元组。
 */
export type GetComponentOutputsHandlerMap<C> = GetComponentEmits<C>;

/** 可作为「组件标识」传入的形态 */
export type ReactComponent =
  | ((props: any) => React.ReactNode)
  | (abstract new (props: any) => any)
  | LazyImport<any>;

/** 组件标识的完整集合: 额外放行 lazyMark 包装形态 */
export type ReactComponentKey = ReactComponent | LazyMarkType<any>;

/**
 * 由类型配置项解析出真正的组件类型。
 *
 * 解析不出组件时落到 never 而不是 any:
 * `any` 会让后续 input/output 的 key 约束整体静默失效。
 */
export type ActionComponent<A extends PiTypeConfig> =
  A['type'] extends ReactComponent
    ? A['type']
    : [ResolveLazyComponent<A['type']>] extends [never]
      ? NonNullable<A['actions']>[0]['__type']
      : ResolveLazyComponent<A['type']>;

/**
 * attributes 的标准名: 直接借 React 自带的 HTMLAttributes,
 * 摘掉 `onXxx`(那是 events 的地盘, 不属于 attributes)。
 */
export type ReactStandardAttrName = Exclude<
  Extract<keyof HTMLAttributes<unknown>, string>,
  `on${string}`
>;

/** 标准名 ∪ 任意自定义名(data-* 与组件自有的透传属性等) */
export type ReactAttributeName = ReactStandardAttrName | (string & {});

import {
  Injector,
  InputSignal,
  OutputEmitterRef,
  Signal,
  Type,
} from '@angular/core';
import { DirectiveConfig } from '../component/dynamic-define.component';
import { NgResolvedComponentDefine1 } from './group';
import {
  ViewAttributes,
  ViewInputs,
  ViewOutputs,
  LazyImport,
  LazyMarkType,
  AsyncProperty,
} from '@piying/view-angular-core';
/** todo 这个没有支持 */
export interface RawDirectiveOutputs {
  [name: string]: (event: any) => void;
}

export interface DynamicComponentConfig {
  type:
    | Type<any>
    | LazyImport<Type<any>>
    | NgComponentDefine
    | LazyImport<NgComponentDefine>
    | LazyMarkType<Type<any>>
    | LazyMarkType<NgComponentDefine>;
  attributes: Signal<ViewAttributes | undefined>;
  events: Signal<Record<string, (event: any) => any> | undefined>;
  inputs: Signal<ViewInputs | undefined>;
  directives?: DirectiveConfig[];
  outputs?: Signal<ViewOutputs>;
  injector?: Injector;
}

/** 解析后组件已经加载 ngcomponentoutlet */
export type NgResolvedComponentDefine2 = Omit<NgResolvedComponentDefine1, ''>;
/** component,wrapper通用定义 */
export type NgComponentDefine = {
  component: Type<any>;
  module?: Type<any>;
};

export type GetKeyWithType<T, ValueType> = {
  [K in keyof T as T[K] extends ValueType
    ? T[K] extends any
      ? any extends T[K]
        ? never
        : K
      : K
    : never]: T[K];
};

export type ComponentInputs<Component> = GetKeyWithType<
  Component,
  InputSignal<any>
>;

export type ComponentInputsOrigin<T> = {
  [K in keyof T]: T[K] extends InputSignal<infer V> ? V : never;
};
export type ComponentInputsAsync<T> = {
  [K in keyof T]: T[K] extends InputSignal<infer V> ? AsyncProperty<V> : never;
};

export type ComponentOutputs<Component> = GetKeyWithType<
  Component,
  OutputEmitterRef<any>
>;

export type ComponentOutputsOrigin<T> = {
  [K in keyof T]: T[K] extends OutputEmitterRef<infer V>
    ? (input: V) => void
    : never;
};
export type ComponentOutputsAsync<T> = {
  [K in keyof T]: T[K] extends OutputEmitterRef<infer V>
    ? AsyncProperty<(input: V) => void>
    : never;
};

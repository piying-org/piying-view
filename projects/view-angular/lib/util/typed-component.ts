import {
  actions as PresetActions,
  PiCommonConfig,
  actions,
  _PiResolvedCommonViewFieldConfig,
  setComponent,
  PiTypeConfig,
  AsyncProperty,
  NFCSchema,
} from '@piying/view-angular-core';

import {
  InputSignal,
  InputSignalWithTransform,
  ModelSignal,
  OutputEmitterRef,
  OutputRef,
  Type,
  WritableSignal,
} from '@angular/core';
import {
  metadataList,
  MetadataListAction,
  RawConfigAction,
} from '@piying/valibot-visit';
import { AnyCoreSchemaHandle } from '@piying/view-angular-core';
import * as v from 'valibot';
type GetKeyWithType<T, ValueType> = {
  [K in keyof T as T[K] extends ValueType
    ? T[K] extends any
      ? any extends T[K]
        ? never
        : K
      : K
    : never]: T[K];
};

type ComponentInputs<Component> = GetKeyWithType<Component, InputSignal<any>>;

type ComponentInputsOrigin<T> = {
  [K in keyof T]: T[K] extends InputSignal<infer V>
    ? V
    : T[K] extends InputSignalWithTransform<infer V, infer D>
      ? D
      : never;
};
type ComponentInputsAsync<T> = {
  [K in keyof T]: T[K] extends InputSignal<infer V>
    ? AsyncProperty<V>
    : T[K] extends InputSignalWithTransform<infer V, infer D>
      ? AsyncProperty<D>
      : never;
};

type ComponentOutputs<Component> = GetKeyWithType<
  Component,
  OutputEmitterRef<any>
>;

type ComponentOutputsOrigin<T> = {
  [K in keyof T]: T[K] extends OutputEmitterRef<infer V>
    ? (input: V) => void
    : never;
};
type ComponentOutputsAsync<T> = {
  [K in keyof T]: T[K] extends OutputEmitterRef<infer V>
    ? AsyncProperty<(input: V) => void>
    : never;
};

type ComponentInstance<TComponent> =
  TComponent extends Type<infer Instance> ? Instance : never;

// inputs
export type GetComponentInputs<TComponent> = ComponentInputs<
  ComponentInstance<TComponent>
>;

export type GetComponentInputsOrigin<TComponent> = Partial<
  ComponentInputsOrigin<GetComponentInputs<TComponent>>
>;

export type GetComponentInputsAsync<TComponent> = Partial<
  ComponentInputsAsync<GetComponentInputs<TComponent>>
>;
// outputs
export type GetComponentOutputs<TComponent> = ComponentOutputs<
  ComponentInstance<TComponent>
>;

export type GetComponentOutputsOrigin<TComponent> = Partial<
  ComponentOutputsOrigin<GetComponentOutputs<TComponent>>
>;

/**
 * 非 Partial 形态的「output 名 -> 处理器签名」映射。
 * 用于把 outputChange 的 list 逐位推成真实 emit 参数元组。
 */
export type GetComponentOutputsHandlerMap<TComponent> = ComponentOutputsOrigin<
  GetComponentOutputs<TComponent>
>;

export type GetComponentOutputsAsync<TComponent> = Partial<
  ComponentOutputsAsync<GetComponentOutputs<TComponent>>
>;

/**
 * 可两向绑定的 key。
 *
 * 两个来源:
 * 1. `model()` 声明的字段(ModelSignal);
 * 2. `xxx` 是 input 且 `xxxChange` 是 output —— Angular `[(xxx)]` 的命名约定,
 *    这里按 OutputRef 取 output, 所以 `output()` 与 `@Output() EventEmitter` 都算。
 *
 * 值统一是宿主侧的 WritableSignal: 运行时走 `twoWayBinding(key, signal)`。
 */
type ComponentOutputRefs<Component> = GetKeyWithType<Component, OutputRef<any>>;

type ChangeToBase<K> = K extends `${infer Base}Change` ? Base : never;

type PairedModelKeys<Instance> = Extract<
  ChangeToBase<keyof ComponentOutputRefs<Instance> & string>,
  keyof ComponentInputs<Instance>
>;

type ModelKeysOfInstance<Instance> =
  | keyof GetKeyWithType<Instance, ModelSignal<any>>
  | PairedModelKeys<Instance>;

type ModelValueOf<Instance, K> = K extends keyof Instance
  ? Instance[K] extends ModelSignal<infer T>
    ? T
    : Instance[K] extends InputSignalWithTransform<infer _T, infer D>
      ? D
      : never
  : never;

export type GetComponentModelKeys<TComponent> = ModelKeysOfInstance<
  ComponentInstance<TComponent>
>;

export type GetComponentModelsOrigin<TComponent> = Partial<{
  [K in GetComponentModelKeys<TComponent>]: WritableSignal<
    ModelValueOf<ComponentInstance<TComponent>, K>
  >;
}>;
type ReturnAction<Input> = RawConfigAction<
  'viewRawConfig',
  Input,
  AnyCoreSchemaHandle
>;
type ComponentActions<TComponent> = {
  inputs: {
    patch: <Input>(
      value: GetComponentInputsOrigin<TComponent>,
    ) => ReturnAction<Input>;
    set: <Input>(
      value: GetComponentInputsOrigin<TComponent>,
    ) => ReturnAction<Input>;
    patchAsync: <Input>(
      value: GetComponentInputsAsync<TComponent>,
    ) => ReturnAction<Input>;
    remove: <Input>(
      value: (keyof GetComponentInputs<TComponent>)[],
    ) => ReturnAction<Input>;
    mapAsync: <Input>(
      value: (
        field: _PiResolvedCommonViewFieldConfig,
      ) => (value: GetComponentInputsOrigin<TComponent>) => any,
    ) => ReturnAction<Input>;
  };
  outputs: {
    patch: <Input>(
      value: GetComponentOutputsOrigin<TComponent>,
    ) => ReturnAction<Input>;
    set: <Input>(
      value: GetComponentOutputsOrigin<TComponent>,
    ) => ReturnAction<Input>;
    patchAsync: <Input>(
      value: GetComponentOutputsAsync<TComponent>,
    ) => ReturnAction<Input>;
    remove: <Input>(
      value: (keyof GetComponentOutputs<TComponent>)[],
    ) => ReturnAction<Input>;
    mapAsync: <Input>(
      value: (
        field: _PiResolvedCommonViewFieldConfig,
      ) => (value: GetComponentOutputsOrigin<TComponent>) => any,
    ) => ReturnAction<Input>;
  };
};

export type ActionComponent<A extends PiTypeConfig> =
  A['type'] extends Type<any>
    ? A['type']
    : NonNullable<A['actions']>[0]['__type'];

export function typedComponent<T extends PiCommonConfig>(
  input: T,
): {
  define: T;
  setComponent: <TCName extends keyof T['types'] | Type<any>, K>(
    input: TCName,
    fn?: (
      actions: Omit<typeof PresetActions, 'inputs' | 'outputs'> &
        ComponentActions<
          TCName extends keyof T['types']
            ? ActionComponent<NonNullable<T['types']>[TCName]>
            : TCName
        >,
    ) => any[],
  ) => MetadataListAction<K>;
  nfcComponent: <TCName extends keyof T['types'] | Type<any>>(
    input: TCName,
    fn?: (
      actions: Omit<typeof PresetActions, 'inputs' | 'outputs'> &
        ComponentActions<
          TCName extends keyof T['types']
            ? ActionComponent<NonNullable<T['types']>[TCName]>
            : TCName
        >,
    ) => any[],
  ) => v.SchemaWithPipe<
    readonly [
      v.OptionalSchema<v.VoidSchema<undefined>, undefined>,
      MetadataListAction<void | undefined>,
    ]
  >;
} {
  return {
    define: input,
    setComponent(key, fn) {
      return metadataList(
        fn ? [setComponent(key), ...fn(actions as any)] : [setComponent(key)],
      );
    },
    nfcComponent(key, fn) {
      return v.pipe(
        NFCSchema,
        metadataList(
          fn ? [setComponent(key), ...fn(actions as any)] : [setComponent(key)],
        ),
      );
    },
  };
}

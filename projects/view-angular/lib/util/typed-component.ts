import {
  actions as PresetActions,
  PiCommonConfig,
  actions,
  _PiResolvedCommonViewFieldConfig,
  setComponent,
  PiTypeConfig,
  AsyncProperty,
} from '@piying/view-angular-core';

import {
  InputSignal,
  InputSignalWithTransform,
  OutputEmitterRef,
  Type,
} from '@angular/core';
import {
  metadataList,
  MetadataListAction,
  RawConfigAction,
} from '@piying/valibot-visit';
import { AnyCoreSchemaHandle } from '@piying/view-angular-core';
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
      ? V
      : never;
};
type ComponentInputsAsync<T> = {
  [K in keyof T]: T[K] extends InputSignal<infer V>
    ? AsyncProperty<V>
    : T[K] extends InputSignalWithTransform<infer V, infer D>
      ? AsyncProperty<V>
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
type GetComponentInputs<TComponent> = ComponentInputs<
  ComponentInstance<TComponent>
>;

type GetComponentInputsOrigin<TComponent> = Partial<
  ComponentInputsOrigin<GetComponentInputs<TComponent>>
>;

type GetComponentInputsAsync<TComponent> = Partial<
  ComponentInputsAsync<GetComponentInputs<TComponent>>
>;
// outputs
type GetComponentOutputs<TComponent> = ComponentOutputs<
  ComponentInstance<TComponent>
>;

type GetComponentOutputsOrigin<TComponent> = Partial<
  ComponentOutputsOrigin<GetComponentOutputs<TComponent>>
>;

type GetComponentOutputsAsync<TComponent> = Partial<
  ComponentOutputsAsync<GetComponentOutputs<TComponent>>
>;
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
      ) => (
        value: GetComponentInputs<TComponent>,
      ) => GetComponentInputs<TComponent>,
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
      ) => (
        value: GetComponentOutputs<TComponent>,
      ) => GetComponentOutputs<TComponent>,
    ) => ReturnAction<Input>;
  };
};

type ActionComponent<A extends PiTypeConfig> =
  A['type'] extends Type<any>
    ? A['type']
    : NonNullable<A['actions']>[0]['__type'];

export function typedComponent<T extends PiCommonConfig>(
  input: T,
): {
  define: T;
  setComponent: <TCName extends keyof T['types'], K>(
    input: TCName,
    fn: (
      actions: Omit<typeof PresetActions, 'inputs' | 'outputs'> &
        ComponentActions<ActionComponent<NonNullable<T['types']>[TCName]>>,
    ) => any[],
  ) => MetadataListAction<K>;
} {
  return {
    define: input,
    setComponent(key, fn) {
      const type = input.types![key as string].type;
      const list = fn?.(actions as any) ?? [];
      return metadataList([setComponent(type), ...list]);
    },
  };
}

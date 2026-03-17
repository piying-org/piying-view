import {
  actions as PresetActions,
  PiCommonConfig,
  actions,
  _PiResolvedCommonViewFieldConfig,
  setComponent,
  PiTypeConfig,
  AsyncProperty,
} from '@piying/view-angular-core';

import { InputSignal, OutputEmitterRef, Type } from '@angular/core';
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
  [K in keyof T]: T[K] extends InputSignal<infer V> ? V : never;
};
type ComponentInputsAsync<T> = {
  [K in keyof T]: T[K] extends InputSignal<infer V> ? AsyncProperty<V> : never;
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

type GetComponentInstance<TComponent> =
  TComponent extends Type<infer Instance> ? Instance : never;

type GetComponentInputs<TComponent> = ComponentInputs<
  GetComponentInstance<TComponent>
>;

type GetComponentInputsOrigin<TComponent> = Partial<
  ComponentInputsOrigin<GetComponentInputs<TComponent>>
>;

type GetComponentInputsAsync<TComponent> = Partial<
  ComponentInputsAsync<GetComponentInputs<TComponent>>
>;
type GetComponentOutputs<TComponent> = ComponentOutputs<
  GetComponentInstance<TComponent>
>;

type GetComponentOutputsOrigin<TComponent> = Partial<
  ComponentOutputsOrigin<GetComponentOutputs<TComponent>>
>;

type GetComponentOutputsAsync<TComponent> = Partial<
  ComponentOutputsAsync<GetComponentOutputs<TComponent>>
>;

type ComponentActions<TComponent> = {
  inputs: {
    patch: <Input>(
      value: GetComponentInputsOrigin<TComponent>,
    ) => RawConfigAction<'viewRawConfig', Input, AnyCoreSchemaHandle>;
    set: <Input>(
      value: GetComponentInputsOrigin<TComponent>,
    ) => RawConfigAction<'viewRawConfig', Input, AnyCoreSchemaHandle>;
    patchAsync: <Input>(
      value: GetComponentInputsAsync<TComponent>,
    ) => RawConfigAction<'viewRawConfig', Input, AnyCoreSchemaHandle>;
    remove: <Input>(
      value: (keyof GetComponentInputs<TComponent>)[],
    ) => RawConfigAction<'viewRawConfig', Input, AnyCoreSchemaHandle>;
    mapAsync: <Input>(
      value: (
        field: _PiResolvedCommonViewFieldConfig,
      ) => (
        value: GetComponentInputs<TComponent>,
      ) => GetComponentInputs<TComponent>,
    ) => RawConfigAction<'viewRawConfig', Input, AnyCoreSchemaHandle>;
  };
  outputs: {
    patch: <Input>(
      value: GetComponentOutputsOrigin<TComponent>,
    ) => RawConfigAction<'viewRawConfig', Input, AnyCoreSchemaHandle>;
    set: <Input>(
      value: GetComponentOutputsOrigin<TComponent>,
    ) => RawConfigAction<'viewRawConfig', Input, AnyCoreSchemaHandle>;
    patchAsync: <Input>(
      value: GetComponentOutputsAsync<TComponent>,
    ) => RawConfigAction<'viewRawConfig', Input, AnyCoreSchemaHandle>;
    remove: <Input>(
      value: (keyof GetComponentOutputs<TComponent>)[],
    ) => RawConfigAction<'viewRawConfig', Input, AnyCoreSchemaHandle>;
    mapAsync: <Input>(
      value: (
        field: _PiResolvedCommonViewFieldConfig,
      ) => (
        value: GetComponentOutputs<TComponent>,
      ) => GetComponentOutputs<TComponent>,
    ) => RawConfigAction<'viewRawConfig', Input, AnyCoreSchemaHandle>;
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

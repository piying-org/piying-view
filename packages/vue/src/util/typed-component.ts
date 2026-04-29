import {
  actions as PresetActions,
  actions,
  setComponent,
  type AnyCoreSchemaHandle,
  type AsyncProperty,
  type PiCommonConfig,
  type PiTypeConfig,
  type _PiResolvedCommonViewFieldConfig,
} from '@piying/view-core';

import { metadataList, type MetadataListAction, type RawConfigAction } from '@piying/valibot-visit';
import type { AllowedComponentProps, DefineComponent, VNodeProps } from 'vue';

type ComponentInputs<TComponent> = TComponent extends new (...args: any[]) => any
  ? InstanceType<TComponent> extends { $props: any }
    ? Omit<InstanceType<TComponent>['$props'], keyof VNodeProps | keyof AllowedComponentProps>
    : Record<string, any>
  : Record<string, any>;

type ComponentInputsAsync<T> = {
  [K in keyof T]: AsyncProperty<T[K]>;
};

// inputs
type GetComponentInputs<TComponent> = ComponentInputs<TComponent>;

type GetComponentInputsAsync<TComponent> = Partial<
  ComponentInputsAsync<GetComponentInputs<TComponent>>
>;

type ReturnAction<Input> = RawConfigAction<'viewRawConfig', Input, AnyCoreSchemaHandle>;
type ComponentActions<TComponent> = {
  inputs: {
    patch: <Input>(value: ComponentInputs<TComponent>) => ReturnAction<Input>;
    set: <Input>(value: ComponentInputs<TComponent>) => ReturnAction<Input>;
    patchAsync: <Input>(value: GetComponentInputsAsync<TComponent>) => ReturnAction<Input>;
    remove: <Input>(value: (keyof GetComponentInputs<TComponent>)[]) => ReturnAction<Input>;
    mapAsync: <Input>(
      value: (
        field: _PiResolvedCommonViewFieldConfig,
      ) => (value: GetComponentInputs<TComponent>) => GetComponentInputs<TComponent>,
    ) => ReturnAction<Input>;
  };
};

type ActionComponent<A extends PiTypeConfig> =
  A['type'] extends DefineComponent<any, any, any>
    ? A['type']
    : NonNullable<A['actions']>[0]['__type'];

export function typedComponent<T extends PiCommonConfig>(
  input: T,
): {
  define: T;
  setComponent: <TCName extends keyof T['types'] | DefineComponent<any, any, any>, K>(
    input: TCName,
    fn?: (
      actions: Omit<typeof PresetActions, 'inputs'> &
        ComponentActions<
          TCName extends keyof T['types']
            ? ActionComponent<NonNullable<T['types']>[TCName]>
            : TCName
        >,
    ) => any[],
  ) => MetadataListAction<K>;
} {
  return {
    define: input,
    setComponent(key, fn) {
      return metadataList(fn ? [setComponent(key), ...fn(actions as any)] : [setComponent(key)]);
    },
  };
}

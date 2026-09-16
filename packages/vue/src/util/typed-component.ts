import {
  NFCSchema,
  actions as PresetActions,
  actions,
  setComponent,
  type AnyCoreSchemaHandle,
  type PiCommonConfig,
  type PiTypeConfig,
  type _PiResolvedCommonViewFieldConfig,
} from '@piying/view-core';
import { metadataList, type MetadataListAction, type RawConfigAction } from '@piying/valibot-visit';
import type { VueComponentKey } from './component-types';
import * as v from 'valibot';
import type {
  ActionComponent,
  GetComponentInputsAsync,
  GetComponentInputsKeys,
  GetComponentInputsOrigin,
  GetComponentOutputsAsync,
  GetComponentOutputsKeys,
  GetComponentOutputsOrigin,
} from './component-types';

type ReturnAction<Input> = RawConfigAction<'viewRawConfig', Input, AnyCoreSchemaHandle>;

/** 组件相关的 action 分组: key 与值类型全部由组件的 props / emits 推导 */
type ComponentActions<TComponent> = {
  inputs: {
    patch: <Input>(value: GetComponentInputsOrigin<TComponent>) => ReturnAction<Input>;
    set: <Input>(value: GetComponentInputsOrigin<TComponent>) => ReturnAction<Input>;
    patchAsync: <Input>(value: GetComponentInputsAsync<TComponent>) => ReturnAction<Input>;
    remove: <Input>(value: GetComponentInputsKeys<TComponent>[]) => ReturnAction<Input>;
    mapAsync: <Input>(
      value: (
        field: _PiResolvedCommonViewFieldConfig,
      ) => (value: GetComponentInputsOrigin<TComponent>) => any,
    ) => ReturnAction<Input>;
  };
  outputs: {
    patch: <Input>(value: GetComponentOutputsOrigin<TComponent>) => ReturnAction<Input>;
    set: <Input>(value: GetComponentOutputsOrigin<TComponent>) => ReturnAction<Input>;
    patchAsync: <Input>(value: GetComponentOutputsAsync<TComponent>) => ReturnAction<Input>;
    remove: <Input>(value: GetComponentOutputsKeys<TComponent>[]) => ReturnAction<Input>;
    mapAsync: <Input>(
      value: (
        field: _PiResolvedCommonViewFieldConfig,
      ) => (value: GetComponentOutputsOrigin<TComponent>) => any,
    ) => ReturnAction<Input>;
  };
};

type TypesOfCfg<Cfg> = NonNullable<Cfg extends { types?: infer T } ? T : never>;

type ResolveTarget<T, Cfg> = T extends keyof TypesOfCfg<Cfg>
  ? ActionComponent<Extract<TypesOfCfg<Cfg>[T], PiTypeConfig<any, any>>>
  : T;

type ActionsOf<T, Cfg> = Omit<typeof PresetActions, 'inputs' | 'outputs' | 'models'> &
  ComponentActions<ResolveTarget<T, Cfg>>;

export function typedComponent<T extends PiCommonConfig>(
  input: T,
): {
  define: T;
  setComponent: <TCName extends keyof T['types'] | VueComponentKey, K>(
    input: TCName,
    fn?: (actions: ActionsOf<TCName, T>) => any[],
  ) => MetadataListAction<K>;
  nfcComponent: <TCName extends keyof T['types'] | VueComponentKey>(
    input: TCName,
    fn?: (actions: ActionsOf<TCName, T>) => any[],
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
      return metadataList(fn ? [setComponent(key), ...fn(actions as any)] : [setComponent(key)]);
    },
    nfcComponent(key, fn) {
      return v.pipe(
        NFCSchema,
        metadataList(fn ? [setComponent(key), ...fn(actions as any)] : [setComponent(key)]),
      );
    },
  };
}

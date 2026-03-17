import {
  actions as PresetActions,
  PiCommonConfig,
  actions,
  _PiResolvedCommonViewFieldConfig,
  setComponent,
} from '@piying/view-angular-core';
import {
  ComponentInputs,
  ComponentInputsAsync,
  ComponentInputsOrigin,
} from '../type/component';
import { Type } from '@angular/core';
import {
  metadataList,
  MetadataListAction,
  RawConfigAction,
} from '@piying/valibot-visit';
import { AnyCoreSchemaHandle } from '@piying/view-angular-core';

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
};

export function typedComponent<T extends PiCommonConfig>(
  input: T,
): {
  define: T;
  setComponent: <TCName extends keyof T['types'], K>(
    input: TCName,
    fn: (
      actions: Omit<typeof PresetActions, 'inputs'> &
        ComponentActions<NonNullable<T['types']>[TCName]['type']>,
    ) => any[],
  ) => MetadataListAction<K>;
} {
  return {
    define: input,
    setComponent(key, fn) {
      let type = input.types![key as string].type;
      let list = fn?.(actions as any) ?? [];
      return metadataList([setComponent(type), ...list]);
    },
  };
}

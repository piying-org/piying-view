import { BaseMetadata } from 'valibot';
import { RawConfigAction } from '@piying/valibot-visit';

export interface PiTypeConfig<
  TComponent = any,
  TActionList extends readonly BaseMetadata<any>[]=any[],
> {
  type?: TComponent;
  actions?: TActionList;
}

export interface PiWrapperConfig<TWrapperComponent = any> {
  type: TWrapperComponent;
  actions?: RawConfigAction<'viewRawConfig', any, any>[];
}

export interface PiCommonConfig<
  TComponent = any,
  TWrapperComponent = any,
  Types extends Record<string, PiTypeConfig<TComponent>> = Record<
    string,
    PiTypeConfig<TComponent>
  >,
  Wrappers extends Record<string, PiWrapperConfig<TWrapperComponent>> = Record<
    string,
    PiWrapperConfig<TWrapperComponent>
  >,
> {
  types?: Types;
  wrappers?: Wrappers;
}

export type GetTypeConfig<
  Types extends Record<string, PiTypeConfig<any>>,
  Key extends string,
> = Key extends keyof Types ? Types[Key] : undefined;

export type GetWrapperConfig<
  Wrappers extends Record<string, PiWrapperConfig<any>>,
  Key extends string,
> = Key extends keyof Wrappers ? Wrappers[Key] : undefined;

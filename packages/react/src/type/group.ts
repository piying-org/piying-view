import type { ReactSchemaHandle } from '../schema-handle';
import type {
  CoreResolvedComponentDefine,
  PiResolvedCommonViewFieldConfig,
} from '@piying/view-core';
import type { SetOptional } from '@piying/view-core';

export interface RawDirectiveOutputs {
  [name: string]: (event: any, field: PiResolvedViewFieldConfig) => void;
}
export type RawWrapperDefine = {
  inputs?: Record<string, any>;
  type: string;
};
export type ResolvedrapperDefine = {
  inputs?: Record<string, any>;
  type: any;
};
export interface RawComponentDefine {
  type: string;
}

export interface ComponentFieldConfig {
  type?: string;
}

export type ResolvedComponentFieldConfig = Omit<
  ComponentFieldConfig,
  'inputs' | 'outputs' | 'directives' | 'wrappers'
>;

export type PiDefaultRawViewFieldConfig = Pick<
  ReactSchemaHandle,
  | 'inputs'
  | 'outputs'
  | 'wrappers'
  | 'formConfig'
  // | 'hooks'
  | 'renderConfig'
  | 'props'
>;

export type PiResolvedViewFieldConfig = PiResolvedCommonViewFieldConfig<
  () => PiResolvedViewFieldConfig,
  CoreResolvedComponentDefine
> &
  ResolvedComponentFieldConfig;

export type PiComponentDefaultConfig = {
  type: any | (() => Promise<any>);
} & Omit<SetOptional<PiDefaultRawViewFieldConfig, 'formConfig'>, 'type'>;

export interface PiViewConfig {
  types?: Record<string, PiComponentDefaultConfig>;
  wrappers?: Record<
    string,
    {
      type: any | (() => Promise<any>);
      inputs?: Record<string, any>;
    }
  >;

}

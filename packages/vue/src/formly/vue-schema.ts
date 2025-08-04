import { CoreSchemaHandle, type ConfigMergeStrategy } from '@piying/view-core';
import type { PiResolvedViewFieldConfig } from './type/group';

export class VueSchemaHandle extends CoreSchemaHandle<
  VueSchemaHandle,
  () => PiResolvedViewFieldConfig
> {
  declare type?: any;

  contents?: any[];
}

export type PiDefaultRawFormlyFieldConfig = Pick<
  VueSchemaHandle,
  | 'inputs'
  | 'outputs'
  | 'wrappers'
  | 'formConfig'
  // | 'hooks'
  | 'renderConfig'
  | 'props'
>;
export type ConfigMergeStrategyObject = Record<
  keyof PiDefaultRawFormlyFieldConfig,
  ConfigMergeStrategy
>;

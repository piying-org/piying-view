import { CoreSchemaHandle, type ConfigMergeStrategy } from '@piying/view-core';
import type { PiResolvedViewFieldConfig } from './type/group';

export class VueSchemaHandle extends CoreSchemaHandle<
  VueSchemaHandle,
  () => PiResolvedViewFieldConfig
> {
  declare type?: any;

  contents?: any[];
}



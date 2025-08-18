import { CoreSchemaHandle } from '@piying/view-core';
import type { PiResolvedViewFieldConfig } from './type/group';

export class SolidSchemaHandle extends CoreSchemaHandle<
  SolidSchemaHandle,
  () => PiResolvedViewFieldConfig
> {
  declare type?: any;
}

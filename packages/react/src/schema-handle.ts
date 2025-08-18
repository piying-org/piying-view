import { CoreSchemaHandle } from '@piying/view-core';
import type { PiResolvedViewFieldConfig } from './type/group';

export class ReactSchemaHandle extends CoreSchemaHandle<
  ReactSchemaHandle,
  () => PiResolvedViewFieldConfig
> {
  declare type?: any;
}

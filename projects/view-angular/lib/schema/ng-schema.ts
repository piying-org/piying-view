import { CoreSchemaHandle } from '@piying/view-angular-core';
import { PiResolvedViewFieldConfig, NgDirectiveConfig } from '../type';
import { ComponentContent } from '../type/component';

export class NgSchemaHandle extends CoreSchemaHandle<
  NgSchemaHandle,
  () => PiResolvedViewFieldConfig
> {
  declare type?: any;
  contents?: ComponentContent;
  directives?: NgDirectiveConfig[];
}

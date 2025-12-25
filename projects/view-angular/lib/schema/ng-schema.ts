import { combineSignal, CoreSchemaHandle } from '@piying/view-angular-core';
import { PiResolvedViewFieldConfig, NgDirectiveConfig } from '../type';

export class NgSchemaHandle extends CoreSchemaHandle<
  NgSchemaHandle,
  () => PiResolvedViewFieldConfig
> {
  declare type: any;
  directives = combineSignal<NgDirectiveConfig>([]);
}

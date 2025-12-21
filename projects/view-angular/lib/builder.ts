import {
  PiComponentDefaultConfig,
  PiResolvedViewFieldConfig,
  PiViewConfig,
  NgResolvedComponentDefine1,
} from './type';
import { inject, Injectable, Type } from '@angular/core';

import {
  asyncObjectSignal,
  combineSignal,
  FormBuilder,
  PI_VIEW_CONFIG_TOKEN,
} from '@piying/view-angular-core';
import { NgSchemaHandle } from './schema/ng-schema';

@Injectable()
export class AngularFormBuilder extends FormBuilder<NgSchemaHandle> {
  override afterResolveConfig(
    rawConfig: NgSchemaHandle,
    config: PiResolvedViewFieldConfig,
  ): PiResolvedViewFieldConfig {
    const field = rawConfig;

    const directives = combineSignal(
      (field.directives ?? []).map((a) => asyncObjectSignal(a)),
    );
    config.directives = directives;
    return config;
  }
}

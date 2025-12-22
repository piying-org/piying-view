import { PiResolvedViewFieldConfig } from './type';
import { Injectable } from '@angular/core';

import { FormBuilder } from '@piying/view-angular-core';
import { NgSchemaHandle } from './schema/ng-schema';

@Injectable()
export class AngularFormBuilder extends FormBuilder<NgSchemaHandle> {
  override afterResolveConfig(
    rawConfig: NgSchemaHandle,
    config: PiResolvedViewFieldConfig,
  ): PiResolvedViewFieldConfig {
    const field = rawConfig;

    config.directives = field.directives;
    return config;
  }
}

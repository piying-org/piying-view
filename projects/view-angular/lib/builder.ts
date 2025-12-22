import { PiResolvedViewFieldConfig } from './type';
import { Injectable } from '@angular/core';

import {
  asyncObjectSignal,
  combineSignal,
  FormBuilder,
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

import {
  HooksConfig,
  setHooks as originHooksConfig,
} from '@piying/view-angular-core';
import { rawConfig } from '@piying/view-angular';
import { PiResolvedViewFieldConfig } from '@piying/view-angular';
import type { ComponentContent } from '../../lib/type/component';
import { NgSchemaHandle } from '@piying/view-angular';
import { GetFieldType } from '@piying/view-angular-core/test';
import { getField as cGetField } from '@piying/view-angular-core/test';
export const getField: GetFieldType<PiResolvedViewFieldConfig> =
  cGetField as any;
export const hooksConfig: HooksConfig<NgSchemaHandle['hooks']> =
  originHooksConfig as any;

export function contentsConfig<T>(contents: ComponentContent) {
  return rawConfig<T>((field) => {
    field.contents = contents;
  });
}

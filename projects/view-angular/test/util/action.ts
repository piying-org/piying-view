import {
  HooksConfig,
  setHooks as originHooksConfig,
  mergeHooks as originMergeHooks,
} from '@piying/view-angular-core';
import { PiResolvedViewFieldConfig } from '@piying/view-angular';
import { NgSchemaHandle } from '@piying/view-angular';
import { GetFieldType } from '@piying/view-angular-core/test';
import { getField as cGetField } from '@piying/view-angular-core/test';
export const getField: GetFieldType<PiResolvedViewFieldConfig> =
  cGetField as any;
export const hooksConfig: HooksConfig<NgSchemaHandle['hooks']> =
  originHooksConfig as any;
export const mergeHooks: HooksConfig<NgSchemaHandle['hooks']> =
  originMergeHooks as any;

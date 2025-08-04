import { RawConfigCommon } from '@piying/valibot-visit';
import { rawConfig as originRawConfig } from '@piying/view-angular-core';
import { NgSchemaHandle } from '../ng-schema';
export const rawConfig = originRawConfig as RawConfigCommon<NgSchemaHandle>;

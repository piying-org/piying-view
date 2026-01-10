import { rawConfig as originRawConfig } from '@piying/valibot-visit';
import type { RawConfigCommon } from '@piying/valibot-visit';
import type { VueSchemaHandle } from '../vue-schema';

export const rawConfig = originRawConfig as RawConfigCommon<VueSchemaHandle>;

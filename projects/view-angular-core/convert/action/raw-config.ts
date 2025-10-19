import { createRawConfig } from '@piying/valibot-visit';
import { AnyCoreSchemaHandle } from '../handle/core.schema-handle';
export const rawConfig = createRawConfig<'viewRawConfig', AnyCoreSchemaHandle>(
  'viewRawConfig',
);

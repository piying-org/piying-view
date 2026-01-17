import { FormBuilder } from '@piying/view-angular-core';
import type { CoreSchemaHandle, SetOptional } from '@piying/view-angular-core';
import { ConvertOptions } from '@piying/valibot-visit';
import { PiViewConfig } from './view-config';

export type NgConvertOptions = SetOptional<
  ConvertOptions<typeof CoreSchemaHandle<any, any>>,
  'handle'
> & {
  builder: typeof FormBuilder<CoreSchemaHandle<any, any>>;
  fieldGlobalConfig?: PiViewConfig;
};

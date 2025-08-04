import { FormBuilder } from '@piying/view-angular-core';
import type { SetOptional } from '@piying/view-angular-core';
import { ConvertOptions } from '@piying/valibot-visit';
import { PiViewConfig } from './view-config';

export type NgConvertOptions = SetOptional<ConvertOptions, 'handle'> & {
  builder: typeof FormBuilder;
  fieldGlobalConfig?: PiViewConfig;
};

import { CoreSchemaHandle } from './handle/core.schema-handle';

import { ConvertOptions } from '@piying/valibot-visit';
import { DestroyableInjector } from '@angular/core';
import { PiCommonConfig, FormBuilder } from '../builder-base';
import { SetOptional } from '../util';

/** 转换参数 */
export type CoreOptions = SetOptional<
  ConvertOptions<typeof CoreSchemaHandle<any, any>>,
  'handle'
> & {
  injector: DestroyableInjector;
  builder: typeof FormBuilder<CoreSchemaHandle<any, any>>;
  fieldGlobalConfig?: PiCommonConfig;
};

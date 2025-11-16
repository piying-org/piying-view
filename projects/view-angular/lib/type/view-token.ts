/** component */

import { InjectionToken, Signal, EventEmitter } from '@angular/core';
import { DynamicComponentConfig } from './component';
import { PiResolvedViewFieldConfig } from './group';
import { SetOptional } from '@piying/view-angular-core';
import { NgConvertOptions } from './builder-type';
import { PiViewConfig } from './view-config';
import * as v from 'valibot';
export const PI_INPUT_OPTIONS_TOKEN = new InjectionToken<
  Signal<
    Omit<
      SetOptional<NgConvertOptions, 'builder' | 'handle'>,
      'fieldGlobalConfig'
    > & { fieldGlobalConfig?: PiViewConfig }
  >
>('PI_INPUT_OPTIONS');
export const PI_INPUT_SCHEMA_TOKEN = new InjectionToken<
  Signal<v.BaseSchema<any, any, any> | v.SchemaWithPipe<any>>
>('PI_INPUT_SCHEMA');
export const PI_INPUT_MODEL_TOKEN = new InjectionToken<Signal<any>>(
  'PI_INPUT_MODEL',
);
/** wrapper中可以使用,已解析的配置 */
export const PI_VIEW_FIELD_TOKEN = new InjectionToken<
  Signal<PiResolvedViewFieldConfig>
>('PI_VIEW_FIELD_TOKEN');

/**
 * @internal
 * 内部传参用
 */
export const PI_COMPONENT_LIST = new InjectionToken<DynamicComponentConfig[]>(
  'PI_COMPONENT_LIST',
);
export const PI_COMPONENT_INDEX = new InjectionToken<number>(
  'PI_COMPONENT_INDEX',
);
export const PI_COMPONENT_LIST_LISTEN = new InjectionToken<
  EventEmitter<DynamicComponentConfig[]>
>('PI_COMPONENT_LIST_LISTEN');

/** component */

import {
  InjectionToken,
  Signal,
  EventEmitter,
  TemplateRef,
} from '@angular/core';
import { DynamicComponentConfig } from './component';

import { PI_VIEW_FIELD_TOKEN as PVFT } from '@piying/view-angular-core';
export {
  PI_INPUT_OPTIONS_TOKEN,
  PI_INPUT_SCHEMA_TOKEN,
} from '@piying/view-angular-core';

/** wrapper中可以使用,已解析的配置 */
export const PI_VIEW_FIELD_TOKEN = PVFT;

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

export const PI_VIEW_FIELD_TEMPLATE_REF_TOKEN = new InjectionToken<
  TemplateRef<any>
>('PI_VIEW_TEMPLATE_REF');

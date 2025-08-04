/** component */

import { InjectionToken, Signal, EventEmitter } from '@angular/core';
import { DynamicComponentConfig } from './component';
import { PiResolvedViewFieldConfig } from './group';

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

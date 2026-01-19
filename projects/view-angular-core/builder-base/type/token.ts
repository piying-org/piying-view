import { InjectionToken, Signal } from '@angular/core';
import type {
  PiResolvedCommonViewFieldConfig,
  FormBuilderOptions,
  _PiResolvedCommonViewFieldConfig,
} from './common-field-config';
import type { PiCommonConfig } from './default-config';
/** 一些默认配置 */
export const PI_VIEW_CONFIG_TOKEN = new InjectionToken<PiCommonConfig>(
  'PI_VIEW_CONFIG',
);
/**
 * @internal
 * 内部传参用
 */
export const PI_FORM_BUILDER_OPTIONS_TOKEN = new InjectionToken<
  FormBuilderOptions<any>
>('PI_FORM_BUILDER_OPTIONS');
/**
 * @internal
 * 内部传参用
 */
export const PI_FORM_BUILDER_ALIAS_MAP = new InjectionToken<
  Map<string, PiResolvedCommonViewFieldConfig<any, any>>
>('PI_FORM_BUILDER_ALIAS_MAP');
/** 上下文注入 */
export const PI_CONTEXT_TOKEN = new InjectionToken<any>('PI_CONTEXT');


export const PI_VIEW_FIELD_TOKEN = new InjectionToken<
  Signal<_PiResolvedCommonViewFieldConfig>
>('PI_VIEW_FIELD_TOKEN');
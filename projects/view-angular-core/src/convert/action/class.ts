import clsx from 'clsx';
import { ClassValue } from 'clsx';
import { rawConfig } from './raw-config';
import { mergeHooksFn } from './hook';
import { patchAsyncAttributes } from './attribute';
import { _PiResolvedCommonViewFieldConfig } from '../../builder-base/type/common-field-config';
import { Observable } from 'rxjs';
import { Signal } from '@angular/core';
import { AsyncResult } from './input';
/** 必须防止到所有wrappers操作后面,防止设置错误
 * 设置到顶层,可能是wrapper,也可能是component
 *
 */
export function topClass<T>(className: ClassValue, merge?: boolean) {
  return rawConfig<T>((rawField) => {
    mergeHooksFn(
      {
        fieldResolved: (field) => {
          const wrappers = field.wrappers();
          if (wrappers?.length) {
            wrappers[0].attributes.update((attributes) => ({
              ...attributes,
              class: merge
                ? clsx(attributes?.['class'], className)
                : clsx(className),
            }));
          } else {
            field.attributes.update((attributes) => ({
              ...attributes,
              class: merge
                ? clsx(attributes?.['class'], className)
                : clsx(className),
            }));
          }
        },
      },
      { position: 'bottom' },
      rawField,
    );
  });
}
/** 仅设置在组件上 */
export function componentClass<T>(className: ClassValue, merge?: boolean) {
  return rawConfig<T>((field) => {
    field.attributes = {
      ...field.attributes,
      class: merge
        ? clsx(field.attributes?.['class'], className)
        : clsx(className),
    };
  });
}
export function patchAsyncClass<T>(
  fn: (
    field: _PiResolvedCommonViewFieldConfig,
  ) => AsyncResult,
) {
  return patchAsyncAttributes<T>({ class: fn });
}

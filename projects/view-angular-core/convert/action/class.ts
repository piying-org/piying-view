import clsx from 'clsx';
import { ClassValue } from 'clsx';
import { rawConfig } from './raw-config';
import { mergeHooksFn } from './hook';

import { AsyncCallback } from './type/async-callback';
import { CustomDataSymbol, __actions as actions } from './input-common';
import { WritableSignal } from '@angular/core';
import { ViewAttributes } from '../../builder-base';
/** 必须防止到所有wrappers操作后面,防止设置错误
 * 设置到顶层,可能是wrapper,也可能是component
 *
 */
function topClass<T>(className: ClassValue, merge?: boolean) {
  return rawConfig<T>((rawField) => {
    mergeHooksFn(
      {
        allFieldsResolved: (field) => {
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
const componentClass = <T>(className: ClassValue, merge?: boolean) =>
  rawConfig<T>((rawField, _, ...args) => {
    let data$;
    if (
      args.length > 0 &&
      typeof args[args.length - 1] === 'object' &&
      CustomDataSymbol in args[args.length - 1]
    ) {
      data$ = (args[args.length - 1][CustomDataSymbol] as any)(rawField);
    } else {
      data$ = rawField;
    }
    const content$: ViewAttributes = data$['attributes'];
    content$['class'] = merge
      ? clsx(content$['class'], className)
      : clsx(className);
  });

const bottomClass = componentClass;
function patchAsyncClass<T>(fn: AsyncCallback<string>) {
  return actions.attributes.patchAsync<T>({ class: fn });
}

function asyncTopClass<T>(classNameFn: AsyncCallback<ClassValue>) {
  return rawConfig<T>((rawField) => {
    mergeHooksFn(
      {
        allFieldsResolved: (field) => {
          const wrappers = field.wrappers();
          if (wrappers?.length) {
            wrappers[0].attributes.connect('class', classNameFn(field));
          } else {
            field.attributes.connect('class', classNameFn(field));
          }
        },
      },
      { position: 'bottom' },
      rawField,
    );
  });
}
export const classAction = {
  top: topClass,
  bottom: bottomClass,
  component: componentClass,
  asyncTop: asyncTopClass,
  asyncBottom: patchAsyncClass,
  asyncComponent: patchAsyncClass,
};

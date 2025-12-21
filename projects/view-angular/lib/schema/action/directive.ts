import {
  asyncObjectSignal,
  combineSignal,
  mergeHooksFn,
  WrapperSymbol,
} from '@piying/view-angular-core';
import { NgDirectiveConfig } from '../../type';
import { rawConfig } from './raw-config';
import { signal, Type } from '@angular/core';
import { RawConfigAction } from '@piying/valibot-visit';

export function setDirectives<T>(items: NgDirectiveConfig[]) {
  return rawConfig<T>((field) => {
    field.directives = items;
  });
}
export function patchDirectives<T>(items: NgDirectiveConfig[]) {
  return rawConfig<T>((field) => {
    field.directives ??= [];
    field.directives.push(...items);
  });
}
export function patchAsyncDirective<T>(
  type: Type<any>,
  actions?: RawConfigAction<'rawConfig', any, any>[],
) {
  return rawConfig<T>((rawFiled) => {
    mergeHooksFn(
      {
        allFieldsResolved: (field) => {
          field.directives ??= combineSignal([]);
          const initData = signal({
            type,
            attributes: asyncObjectSignal(undefined),
            events: asyncObjectSignal(undefined),
            inputs: asyncObjectSignal({}),
            outputs: asyncObjectSignal({}),
          } as NgDirectiveConfig);
          field.directives.add(initData);
          for (const item of actions ?? []) {
            const tempField = {};
            (item.value as any)(tempField, undefined, {
              [WrapperSymbol]: initData,
            });
            (tempField as any).hooks.allFieldsResolved(field);
          }
        },
      },
      { position: 'bottom' },
      rawFiled,
    );
  });
}

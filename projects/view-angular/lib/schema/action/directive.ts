import {
  asyncObjectSignal,
  mergeHooksFn,
  SetOptional,
  SetUnWrapper$,
  CustomDataSymbol,
} from '@piying/view-angular-core';
import { NgDirectiveConfig } from '../../type';
import { rawConfig } from './raw-config';
import { Signal, signal, Type } from '@angular/core';
import { RawConfigAction } from '@piying/valibot-visit';
function createSetOrPatchDirectivePropertyFn(isPatch?: boolean) {
  return <T>(
    items: SetOptional<
      SetUnWrapper$<
        NgDirectiveConfig,
        'inputs' | 'outputs' | 'attributes' | 'events' | 'model'
      >,
      'inputs' | 'outputs' | 'attributes' | 'events' | 'model'
    >[],
  ) =>
    rawConfig<T>((field) => {
      if (!isPatch) {
        field.directives.clean();
      }
      items.forEach((item) => {
        field.directives.add(
          signal<NgDirectiveConfig>({
            type: item.type,
            inputs: asyncObjectSignal(item.inputs ?? {}),
            outputs: asyncObjectSignal(item.outputs ?? {}),
            attributes: asyncObjectSignal(item.attributes ?? {}),
            events: asyncObjectSignal(item.events ?? {}),
            model: asyncObjectSignal(item.model ?? {}),
          }),
        );
      });
    });
}

function patchAsyncDirective<T>(
  type: Type<any>,
  actions?: RawConfigAction<'viewRawConfig', any, any>[],
  options?: { insertIndex?: number },
) {
  return rawConfig<T>((rawFiled) => {
    mergeHooksFn(
      {
        allFieldsResolved: (field) => {
          const initData = signal({
            type,
            attributes: asyncObjectSignal({}),
            events: asyncObjectSignal({}),
            inputs: asyncObjectSignal({}),
            outputs: asyncObjectSignal({}),
            model: asyncObjectSignal({}),
          } as NgDirectiveConfig);
          field.directives!.add(initData, options?.insertIndex);
          for (const item of actions ?? []) {
            const tempField = {};
            (item.value as any)(tempField, undefined, {
              [CustomDataSymbol]: initData,
            });
            (tempField as any).hooks?.allFieldsResolved?.(field);
          }
        },
      },
      { position: 'bottom' },
      rawFiled,
    );
  });
}
function removeDirectives<T>(
  removeList: (
    list: Signal<NgDirectiveConfig>[],
  ) => Signal<NgDirectiveConfig>[],
) {
  return rawConfig<T>((field) => {
    mergeHooksFn(
      {
        allFieldsResolved: (field) => {
          field.directives!.update(removeList);
        },
      },
      { position: 'bottom' },
      field,
    );
  });
}
export const directives = {
  set: createSetOrPatchDirectivePropertyFn(),
  patch: createSetOrPatchDirectivePropertyFn(true),
  patchAsync: patchAsyncDirective,
  remove: removeDirectives,
};

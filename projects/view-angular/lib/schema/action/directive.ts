import {
  asyncObjectSignal,
  mergeHooksFn,
  SetOptional,
  SetUnWrapper$,
  CustomDataSymbol,
  AnyCoreSchemaHandle,
  _PiResolvedCommonViewFieldConfig,
  AsyncObjectSignal,
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
function setSubInitValue<Key extends string>(
  key: Key,
  fn: () => Record<Key, AsyncObjectSignal<any>>,
  initObj: any,
) {
  if (!Object.keys(initObj[key]).length) {
    return;
  }
  fn()[key].set(initObj[key]);
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
          const initData = signal<NgDirectiveConfig>({
            type,
            attributes: asyncObjectSignal({}),
            events: asyncObjectSignal({}),
            inputs: asyncObjectSignal({}),
            outputs: asyncObjectSignal({}),
            model: asyncObjectSignal({}),
          });
          field.directives!.add(initData, options?.insertIndex);
          for (const item of actions ?? []) {
            const tempField: Partial<AnyCoreSchemaHandle> & { model: any } = {
              inputs: {},
              outputs: {},
              attributes: {},
              events: {},
              model: {},
            };
            (item.value as any)(tempField, undefined, {
              [CustomDataSymbol]: (
                rawField: AnyCoreSchemaHandle,
                field: _PiResolvedCommonViewFieldConfig,
              ) => {
                if (rawField) {
                  return tempField;
                }
                return initData;
              },
            });
            setSubInitValue('inputs', initData as any, tempField);
            setSubInitValue('outputs', initData as any, tempField);
            setSubInitValue('attributes', initData as any, tempField);
            setSubInitValue('events', initData as any, tempField);
            setSubInitValue('model', initData as any, tempField);

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

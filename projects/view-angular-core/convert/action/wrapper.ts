import { rawConfig } from './raw-config';
import {
  _PiResolvedCommonViewFieldConfig,
  CoreWrapperConfig,
  PI_VIEW_CONFIG_TOKEN,
} from '../../builder-base';
import {
  ObservableSignal,
  observableSignal,
  SetOptional,
  SetUnWrapper$,
} from '../../util';
import { mergeHooksFn } from './hook';
import { Signal, WritableSignal } from '@angular/core';
import { FindConfigToken } from '../../builder-base/find-config';
import { map, pipe } from 'rxjs';
import { ConfigAction, CustomDataSymbol } from './input-common';
import {
  AsyncObjectSignal,
  asyncObjectSignal,
} from '../../util/create-async-object-signal';
import { AnyCoreSchemaHandle } from '../handle/core.schema-handle';
function createSetOrPatchWrappersFn(isPatch?: boolean) {
  return <T>(
    wrappers: (
      | SetOptional<
          SetUnWrapper$<
            CoreWrapperConfig,
            'inputs' | 'outputs' | 'attributes' | 'events'
          >,
          'inputs' | 'outputs' | 'attributes' | 'events'
        >
      | string
    )[],
  ) =>
    rawConfig<T>((rawField, _) => {
      const wrapperConfig =
        rawField.globalConfig.additionalData!['defaultWrapperMetadataGroup'];
      if (!isPatch) {
        rawField.wrappers = [];
      }
      wrappers.forEach((wrapperItem) => {
        if (typeof wrapperItem === 'string') {
          const defaultActions: any[] =
            wrapperConfig[wrapperItem]?.actions ?? [];
          const define = {
            type: wrapperItem,
            inputs: {},
            outputs: {},
            attributes: {},
            events: {},
          };
          rawField.wrappers.push(define);
          defaultActions.forEach((item) => {
            item.value(rawField, _, {
              [CustomDataSymbol]: (
                rawField: AnyCoreSchemaHandle,
                field: _PiResolvedCommonViewFieldConfig,
              ) => {
                if (rawField) {
                  return define;
                } else {
                  return field.wrappers.items().find((item) => {
                    return (
                      (
                        item as ObservableSignal<
                          CoreWrapperConfig,
                          CoreWrapperConfig
                        >
                      ).input().type === wrapperItem
                    );
                  });
                }
              },
            });
          });
        } else {
          rawField.wrappers.push({
            type: wrapperItem.type,
            inputs: wrapperItem.inputs ?? {},
            outputs: wrapperItem.outputs ?? {},
            attributes: wrapperItem.attributes ?? {},
            events: wrapperItem.events ?? {},
          });
        }
      });
    });
}

function removeWrappers<T>(
  removeList:
    | string[]
    | ((list: Signal<CoreWrapperConfig>[]) => Signal<CoreWrapperConfig>[]),
) {
  return rawConfig<T>((field) => {
    mergeHooksFn(
      {
        allFieldsResolved: (field) => {
          let list;
          if (typeof removeList === 'function') {
            list = removeList(field.wrappers.items());
          } else {
            list = field.wrappers.items().filter((item) => {
              const type = (item as ObservableSignal<any, any>).input().type;
              return removeList.every((name) => name !== type);
            });
          }
          field.wrappers.update(() => list);
        },
      },
      { position: 'bottom' },
      field,
    );
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
function patchAsyncWrapper<T>(
  type: any,
  actions?: ConfigAction<any>[],
  options?: { insertIndex?: number },
) {
  return rawConfig<T>((rawFiled) => {
    // 在这里增加要处理的wrapper类型
    mergeHooksFn(
      {
        allFieldsResolved: (field) => {
          const findConfig = field.injector.get(FindConfigToken);
          const initData = observableSignal<
            CoreWrapperConfig,
            CoreWrapperConfig
          >(
            {
              type,
              attributes: asyncObjectSignal({}),
              events: asyncObjectSignal({}),
              inputs: asyncObjectSignal({}),
              outputs: asyncObjectSignal({}),
            } as CoreWrapperConfig,
            {
              pipe: pipe(
                map((item) => {
                  const defaultWrapperConfig = findConfig.findWrapperComponent(
                    item.type,
                  );
                  return { ...item, type: defaultWrapperConfig };
                }),
              ),
              injector: field.injector,
            },
          );
          field.wrappers.add(initData, options?.insertIndex);

          const defaultConfig = field.injector.get(PI_VIEW_CONFIG_TOKEN);
          let defaultActions: ConfigAction<any>[] = [];
          if (typeof type === 'string') {
            defaultActions = defaultConfig.wrappers?.[type]?.actions ?? [];
          }
          const allActions = [...defaultActions, ...(actions ?? [])];

          for (const item of allActions) {
            const tempField: Partial<AnyCoreSchemaHandle> = {
              inputs: {},
              outputs: {},
              attributes: {},
              events: {},
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
            setSubInitValue('inputs', initData, tempField);
            setSubInitValue('outputs', initData, tempField);
            setSubInitValue('attributes', initData, tempField);
            setSubInitValue('events', initData, tempField);

            (tempField as any).hooks?.allFieldsResolved?.(field);
          }
        },
      },
      { position: 'bottom' },
      rawFiled,
    );
  });
}

function changeAsyncWrapper<T>(
  indexFn: (list: Signal<CoreWrapperConfig>[]) => any,
  actions: ConfigAction<any>[],
) {
  return rawConfig<T>((rawFiled) => {
    mergeHooksFn(
      {
        allFieldsResolved: (field) => {
          const initData: () => CoreWrapperConfig = indexFn(
            field.wrappers
              .items()
              .map((item) => (item as ObservableSignal<any, any>).input),
          );

          if (!initData) {
            throw new Error(`change wrapper not found`);
          }
          for (const item of actions) {
            const tempField: Partial<AnyCoreSchemaHandle> = {
              inputs: {},
              outputs: {},
              attributes: {},
              events: {},
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
            setSubInitValue('inputs', initData, tempField);
            setSubInitValue('outputs', initData, tempField);
            setSubInitValue('attributes', initData, tempField);
            setSubInitValue('events', initData, tempField);
            (tempField as any).hooks?.allFieldsResolved?.(field);
          }
        },
      },
      { position: 'bottom' },
      rawFiled,
    );
  });
}
export const wrappers = {
  set: createSetOrPatchWrappersFn(),
  patch: createSetOrPatchWrappersFn(true),
  patchAsync: patchAsyncWrapper,
  remove: removeWrappers,
  changeAsync: changeAsyncWrapper,
};

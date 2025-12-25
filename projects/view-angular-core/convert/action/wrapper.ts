import { rawConfig } from './raw-config';
import { CoreWrapperConfig, PI_VIEW_CONFIG_TOKEN } from '../../builder-base';
import {
  ObservableSignal,
  observableSignal,
  SetOptional,
  SetUnWrapper$,
} from '../../util';
import { mergeHooksFn } from './hook';
import { Signal } from '@angular/core';
import { FindConfigToken } from '../../builder-base/find-config';
import { map, pipe } from 'rxjs';
import { ConfigAction, CustomDataSymbol } from './input-common';
import { asyncObjectSignal } from '../../util/create-async-object-signal';

function setWrappers<T>(
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
) {
  return rawConfig<T>((rawField, _) => {
    const wrapperConfig =
      rawField.globalConfig.additionalData!['defaultWrapperMetadataGroup'];
    const injector = rawField.globalConfig.additionalData!['injector'];
    const OptionDefine = {
      pipe: pipe(
        map((item: any) => {
          if (typeof item.type === 'string') {
            const type = wrapperConfig[item.type].type;
            if (!type) {
              throw new Error(`🈳wrapper:[${type}]❗`);
            }
            return { ...item, type: type };
          }

          return item;
        }),
      ),
      injector: injector,
    };
    rawField.wrappers.clean()
    wrappers.forEach((item) => {
      if (typeof item === 'string') {
        const defaultActions: any[] = wrapperConfig[item]?.actions ?? [];
        const define = observableSignal(
          {
            type: item,
            inputs: asyncObjectSignal({}),
            outputs: asyncObjectSignal({}),
            attributes: asyncObjectSignal({}),
            events: asyncObjectSignal({}),
          },
          OptionDefine,
        );
        rawField.wrappers.add(define);
        defaultActions.forEach((item) => {
          item.value(rawField, _, {
            [CustomDataSymbol]: define,
          });
        });
      } else {
        rawField.wrappers.add(
          observableSignal(
            {
              type: item.type,
              inputs: asyncObjectSignal(item.inputs ?? {}),
              outputs: asyncObjectSignal(item.outputs ?? {}),
              attributes: asyncObjectSignal(item.attributes ?? {}),
              events: asyncObjectSignal(item.events ?? {}),
            },
            OptionDefine,
          ),
        );
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

function changeAsyncWrapper<T>(
  indexFn: (list: Signal<CoreWrapperConfig>[]) => any,
  actions: ConfigAction<any>[],
) {
  return rawConfig<T>((rawFiled) => {
    mergeHooksFn(
      {
        allFieldsResolved: (field) => {
          const initData = indexFn(
            field.wrappers
              .items()
              .map((item) => (item as ObservableSignal<any, any>).input),
          );

          if (!initData) {
            throw new Error(`change wrapper not found`);
          }
          for (const item of actions) {
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
export const wrappers = {
  set: setWrappers,
  patchAsync: patchAsyncWrapper,
  remove: removeWrappers,
  changeAsync: changeAsyncWrapper,
};

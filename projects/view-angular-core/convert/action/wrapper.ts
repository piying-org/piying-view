import { rawConfig } from './raw-config';
import {
  _PiResolvedCommonViewFieldConfig,
  CoreRawWrapperConfig,
  CoreResolvedWrapperConfig,
  PI_VIEW_CONFIG_TOKEN,
} from '../../builder-base';
import {
  ObservableSignal,
  observableSignal,
  SetUnWrapper$,
  toArray,
  UnWrapper$,
} from '../../util';
import { mergeHooksFn } from './hook';
import { Signal, signal } from '@angular/core';
import { AsyncProperty, patchAsyncInputs } from './input';
import { FindConfigToken } from '../../builder-base/find-config';
import { map, pipe } from 'rxjs';
import { asyncInputMerge, ConfigAction, WrapperSymbol } from './input-common';
import { metadataList, RawConfigAction } from '@piying/valibot-visit';
import { asyncObjectSignal } from '../../util/create-async-object-signal';
import { patchAsyncOutputs } from './output';
import { patchAsyncAttributes, patchAsyncEvents } from './attribute';

export function setWrappers<T>(
  wrappers: (
    | SetUnWrapper$<
        CoreRawWrapperConfig,
        'inputs' | 'outputs' | 'attributes' | 'events'
      >
    | string
  )[],
) {
  return rawConfig<T>((rawField, _) => {
    let wrapperConfig =
      rawField.globalConfig.additionalData!['defaultWrapperMetadataGroup'];
    let injector = rawField.globalConfig.additionalData!['injector'];
    const OptionDefine = {
      pipe: pipe(
        map((item: any) => {
          if (typeof item.type === 'string') {
            let type = wrapperConfig[item.type].type;
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
    wrappers.forEach((item) => {
      if (typeof item === 'string') {
        let defaultActions: any[] = wrapperConfig[item]?.actions ?? [];
        let define = observableSignal(
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
            [WrapperSymbol]: define,
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

export type AsyncCoreRawWrapperConfig = Omit<
  Exclude<CoreRawWrapperConfig, string>,
  'inputs' | 'attributes' | 'outputs'
> & {
  inputs?: Record<string, AsyncProperty>;
  attributes?: Record<string, AsyncProperty>;
  outputs?: Record<
    string,
    (field: _PiResolvedCommonViewFieldConfig) => (...args: any[]) => void
  >;
};

export function removeWrappers<T>(removeList: string[]) {
  return rawConfig<T>((field) => {
    mergeHooksFn(
      {
        allFieldsResolved: (field) => {
          const list = field.wrappers.items().filter((item) => {
            const type = (item as ObservableSignal<any, any>).input().type;
            return removeList.every((name) => name !== type);
          });
          field.wrappers.update(() => list);
        },
      },
      { position: 'bottom' },
      field,
    );
  });
}

export function setWrapperEmpty<T>() {
  return rawConfig<T>((rawFiled) => {
    mergeHooksFn(
      {
        allFieldsResolved: (field) => {
          field.wrappers.clean();
        },
      },
      { position: 'bottom' },
      rawFiled,
    );
  });
}
export function patchAsyncWrapper2<T>(
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
            CoreResolvedWrapperConfig,
            CoreResolvedWrapperConfig
          >(
            {
              type,
              attributes: asyncObjectSignal(undefined),
              events: asyncObjectSignal(undefined),
              inputs: asyncObjectSignal({}),
              outputs: asyncObjectSignal({}),
            } as CoreResolvedWrapperConfig,
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

          let defaultConfig = field.injector.get(PI_VIEW_CONFIG_TOKEN);
          let defaultActions: ConfigAction<any>[] = [];
          if (typeof type === 'string') {
            defaultActions = defaultConfig.wrappers?.[type]?.actions ?? [];
          }
          let allActions = [...defaultActions, ...(actions ?? [])];

          for (const item of allActions) {
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
export function changeAsyncWrapper2<T>(
  indexFn: (list: Signal<CoreResolvedWrapperConfig>[]) => any,
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

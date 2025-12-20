import { rawConfig } from './raw-config';
import {
  _PiResolvedCommonViewFieldConfig,
  CoreRawWrapperConfig,
  CoreResolvedWrapperConfig,
} from '../../builder-base';
import { ObservableSignal, observableSignal, toArray } from '../../util';
import { mergeHooksFn } from './hook';
import { Signal, signal, WritableSignal } from '@angular/core';
import { AsyncProperty } from './input';
import { FindConfigToken } from '../../builder-base/find-config';
import { map, pipe } from 'rxjs';
import { asyncInputMerge, WrapperSymbol } from './input-common';
import { RawConfigAction } from '@piying/valibot-visit';
import { asyncObjectSignal } from '../../util/create-async-object-signal';

export function setWrappers<T>(wrappers: CoreRawWrapperConfig[]) {
  return rawConfig<T>((field) => {
    field.wrappers = wrappers;
  });
}
type PatchWrappersOptions = {
  position: 'head' | 'tail';
};
const defaultValue: PatchWrappersOptions = {
  position: 'tail',
};
export function patchWrappers<T>(
  wrappers: CoreRawWrapperConfig | CoreRawWrapperConfig[],
  options: PatchWrappersOptions = defaultValue,
) {
  return rawConfig<T>((field) => {
    const list = toArray(wrappers)!;
    field.wrappers ??= [];
    if (options.position === 'tail') {
      field.wrappers.push(...list);
    } else {
      field.wrappers.unshift(...list);
    }
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
export function patchAsyncWrapper<T>(
  inputWrapper: AsyncCoreRawWrapperConfig,
  options: PatchWrappersOptions = defaultValue,
) {
  return rawConfig<T>((field) => {
    mergeHooksFn(
      {
        allFieldsResolved: (field) => {
          const findConfig = field.injector.get(FindConfigToken);
          let inputs$ = asyncObjectSignal({});
          if (inputWrapper.inputs && Object.keys(inputWrapper.inputs).length) {
            inputs$ = asyncInputMerge(
              Object.entries(inputWrapper.inputs).reduce(
                (obj, [key, value]) => {
                  obj[key] = value(field);
                  return obj;
                },
                {} as Record<string, any>,
              ),
              inputs$,
            );
          }
          let attributes$ = asyncObjectSignal({});
          if (
            inputWrapper.attributes &&
            Object.keys(inputWrapper.attributes).length
          ) {
            attributes$ = asyncInputMerge(
              Object.entries(inputWrapper.attributes).reduce(
                (obj, [key, value]) => {
                  obj[key] = value(field);
                  return obj;
                },
                {} as Record<string, any>,
              ),
              attributes$,
            );
          }
          let events$ = asyncObjectSignal({});

          if (inputWrapper.events && Object.keys(inputWrapper.events).length) {
            events$ = asyncInputMerge(
              Object.entries(inputWrapper.events).reduce(
                (obj, [key, value]) => {
                  obj[key] = value(field);
                  return obj;
                },
                {} as Record<string, any>,
              ),
              events$,
            );
          }
          let outputs$ = asyncObjectSignal<
            Record<
              string,
              (field: _PiResolvedCommonViewFieldConfig) => (...args: any) => any
            >
          >({});
          if (
            inputWrapper.outputs &&
            Object.keys(inputWrapper.outputs).length
          ) {
            outputs$ = asyncInputMerge(
              Object.entries(inputWrapper.outputs).reduce(
                (obj, [key, value]) => {
                  obj[key] = value(field);
                  return obj;
                },
                {} as Record<string, any>,
              ),
              outputs$,
            );
          }
          const defaultWrapperConfig = findConfig.findWrapper(inputWrapper);
          const newWrapper = signal({
            ...defaultWrapperConfig,
            inputs: inputs$,
            outputs: outputs$,
            attributes: attributes$,
            events: events$,
          });
          field.wrappers.update((wrappers) =>
            options.position === 'tail'
              ? [...wrappers, newWrapper]
              : [newWrapper, ...wrappers],
          );
        },
      },
      { position: 'bottom' },
      field,
    );
  });
}
export function removeWrappers<T>(removeList: string[]) {
  return rawConfig<T>((field) => {
    mergeHooksFn(
      {
        allFieldsResolved: (field) => {
          let list = field.wrappers.items().filter((item) => {
            let type = (item as ObservableSignal<any, any>).input().type;
            return removeList.every((name) => name !== type);
          });
          field.wrappers.update(() => {
            return list;
          });
        },
      },
      { position: 'bottom' },
      field,
    );
  });
}

export function patchAsyncWrapper2<T>(
  type: any,
  actions: RawConfigAction<'rawConfig', any, any>[],
) {
  return rawConfig<T>((rawFiled) => {
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
          field.wrappers.add(initData);
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
export function changeAsyncWrapper2<T>(
  indexFn: (list: Signal<CoreResolvedWrapperConfig>[]) => any,
  actions: RawConfigAction<'rawConfig', any, any>[],
) {
  return rawConfig<T>((rawFiled) => {
    mergeHooksFn(
      {
        allFieldsResolved: (field) => {
          let initData = indexFn(
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

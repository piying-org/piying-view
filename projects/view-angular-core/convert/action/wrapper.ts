import { rawConfig } from './raw-config';
import {
  _PiResolvedCommonViewFieldConfig,
  CoreRawWrapperConfig,
  CoreResolvedWrapperConfig,
} from '../../builder-base';
import { observableSignal, toArray } from '../../util';
import { mergeHooksFn } from './hook';
import { signal, WritableSignal } from '@angular/core';
import { asyncInputMerge, AsyncProperty } from './input';
import { FindConfigToken } from '../../builder-base/find-config';
import { map, pipe } from 'rxjs';

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
  'inputs' | 'attributes'
> & {
  inputs?: Record<string, AsyncProperty>;
  attributes?: Record<string, AsyncProperty>;
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
          let inputs$ = signal({});
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
          let attributes$ = signal({});
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
          let events$ = signal({});

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
          const oldOutputs = inputWrapper.outputs;
          const outputs: Record<string, (...args: any) => any> = {};
          if (oldOutputs && Object.keys(oldOutputs).length) {
            for (const key in oldOutputs) {
              const oldFn = oldOutputs[key];
              outputs[key] = (...args: any[]) => (oldFn as any)(...args, field);
            }
          }
          const defaultWrapperConfig = findConfig.findWrapper(inputWrapper);
          const newWrapper = signal({
            ...defaultWrapperConfig,
            inputs: inputs$,
            outputs,
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
export function removeWrappers<T>(list: string[]) {
  return rawConfig<T>((field) => {
    if (!field.wrappers) {
      return;
    }
    const wrappers = field.wrappers;
    for (let i = 0; i < list.length; i++) {
      const name = list[i];
      for (let j = 0; j < wrappers.length; j++) {
        const config = wrappers[j];
        const name2 = typeof config === 'string' ? config : config.type;
        if (name2 === name) {
          wrappers.splice(j, 1);
          break;
        }
      }
    }
    field.wrappers = wrappers;
  });
}
export type CommonComponentAction = (
  data: WritableSignal<Record<string, WritableSignal<any>>>,
  resolvedField$: _PiResolvedCommonViewFieldConfig,
) => void;
export function patchAsyncWrapper2<T>(
  type: any,
  actions: CommonComponentAction[],
) {
  return rawConfig<T>((field) => {
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
              attributes: signal(undefined),
              events: signal(undefined),
              inputs: signal({}),
              outputs: {},
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
            item(initData as any, field);
          }
        },
      },
      { position: 'bottom' },
      field,
    );
  });
}

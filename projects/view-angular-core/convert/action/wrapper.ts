import { rawConfig } from './raw-config';
import {
  _PiResolvedCommonViewFieldConfig,
  CoreRawWrapperConfig,
  CoreResolvedWrapperConfig,
} from '../../builder-base';
import { toArray } from '../../util';
import { mergeHooksFn } from './hook';
import { signal } from '@angular/core';
import { asyncInputMerge, AsyncProperty } from './input';
import { FindConfigToken } from '../../builder-base/find-config';

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
          const newWrapper = {
            ...defaultWrapperConfig,
            inputs: inputs$,
            outputs,
            attributes: attributes$,
            events: events$,
          };
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
  data: any,
  resolvedField$: _PiResolvedCommonViewFieldConfig,
  updateFn: (value: (value: any) => any) => void,
) => void;
export function patchAsyncWrapper2<T>(
  type: any,
  actions: CommonComponentAction[],
) {
  return rawConfig<T>((field) => {
    mergeHooksFn(
      {
        allFieldsResolved: (field) => {
          // ! wrappers的内容必须是信号,又或者是一种连接的信号(combineSignal?)
          let list = field.wrappers();
          /** 顶级的 */
          let initData = signal<CoreResolvedWrapperConfig>({} as any);
          // todo 改为全信号?
          field.wrappers.update((list) => {
            list = list.slice();
            list.push(initData());
            return list;
          });
          let updateFn = (fn: (value: any) => any) => {
            let result = fn(initData);
            // todo 
            // field.wrappers.update((list) => {
            //   list = list.indexOf(initData())
            //   list.push(initData());
            //   return list;
            // });
          };
          for (const item of actions) {
            item(initData, field, updateFn);
          }
        },
      },
      { position: 'bottom' },
      field,
    );
  });
}

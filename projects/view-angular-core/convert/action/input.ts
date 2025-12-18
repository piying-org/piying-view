import {
  computed,
  isSignal,
  linkedSignal,
  Signal,
  WritableSignal,
} from '@angular/core';
import { rawConfig } from './raw-config';
import {
  _PiResolvedCommonViewFieldConfig,
  CoreRawViewInputs,
} from '../../builder-base';
import { mergeHooksFn } from './hook';
import { Observable } from 'rxjs';
import { isPromise, isSubscribable } from '../util/is-promise';
import { unWrapSignal, Writeable } from '../../util';
import { patchAsyncInputsCommon } from './input-common';
export function setInputs<T>(inputs: CoreRawViewInputs) {
  return rawConfig<T>((field) => {
    field.inputs = inputs;
  });
}
export function patchInputs<T>(inputs: CoreRawViewInputs) {
  return rawConfig<T>((field) => {
    field.inputs = {
      ...field.inputs,
      ...inputs,
    };
  });
}
export function removeInputs<T>(list: string[]) {
  return rawConfig<T>((field) => {
    const oldValue = unWrapSignal(field.inputs);
    if (!oldValue) {
      return;
    }
    list.forEach((item) => {
      delete oldValue[item];
    });
    field.inputs = oldValue;
  });
}
export function asyncInputMerge(
  dataObj: Record<string, any>,
  data$: WritableSignal<any>,
) {
  const signalObj = {} as Record<string, Signal<any>>;
  const inputList = Object.keys(dataObj);

  inputList.forEach((key) => {
    const result = dataObj[key];
    if (isPromise(result)) {
      // promise
      result.then((value: any) => {
        data$.update((lastData) => {
          lastData = { ...lastData };
          lastData[key] = value;
          return lastData;
        });
      });
    } else if (isSubscribable(result)) {
      // rxjs
      result.subscribe({
        next: (value) => {
          data$.update((lastData) => {
            lastData = { ...lastData };
            lastData[key] = value;
            return lastData;
          });
        },
      });
    } else if (isSignal(result)) {
      signalObj[key] = result;
    } else {
      // 普通类型
      data$.update((lastData) => {
        lastData = { ...lastData };
        lastData[key] = result;
        return lastData;
      });
    }
  });
  const signalKeyList = Object.keys(signalObj);

  if (signalKeyList.length) {
    const newData = linkedSignal(
      computed(() => ({
        ...data$(),
        ...signalKeyList.reduce(
          (obj, key) => ({ ...obj, [key]: signalObj[key]() }),
          {} as Record<string, any>,
        ),
      })),
    );
    newData.set = (value) => {
      data$.set(value);
    };
    newData.update = (fn: any) => {
      const result = fn(newData());
      data$.set(result);
    };
    return newData;
  }
  return data$;
}
export type AsyncResult =
  | Promise<any>
  | Observable<any>
  | Signal<any>
  | (any & {});
export type AsyncProperty = (
  field: _PiResolvedCommonViewFieldConfig,
) => AsyncResult;


export const patchAsyncInputs = patchAsyncInputsCommon;

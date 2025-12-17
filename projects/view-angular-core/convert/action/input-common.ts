import {
  computed,
  isSignal,
  linkedSignal,
  signal,
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
import { CommonComponentAction } from './wrapper';

function asyncInputMerge(
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
type AsyncResult = Promise<any> | Observable<any> | Signal<any> | (any & {});
type AsyncProperty = (field: _PiResolvedCommonViewFieldConfig) => AsyncResult;

export const patchAsyncInputsCommon = (
  dataObj: Record<string, AsyncProperty>,
): CommonComponentAction => {
  let key = 'inputs';
  return (data, resolvedField$) => {
    let needInit = !!data[key];
    data[key] ??= signal({});
    let content$: WritableSignal<any> = data[key];
    const inputList = Object.keys(dataObj);
    // 设置初始值
    content$.update((data) => {
      return {
        ...content$,
        ...inputList.reduce((obj, item) => {
          obj[item] = data[item] ?? undefined;
          return obj;
        }, {} as any),
      };
    });

    const result = asyncInputMerge(
      Object.entries(dataObj).reduce(
        (obj, [key, value]) => {
          obj[key] = value(resolvedField$);
          return obj;
        },
        {} as Record<string, any>,
      ),
      content$,
    );
    if (result !== content$ || needInit) {
      content$.update((obj) => {
        return { ...obj, [key]: result };
      });
    }
  };
};

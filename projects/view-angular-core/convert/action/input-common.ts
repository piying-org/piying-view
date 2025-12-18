import {
  computed,
  isSignal,
  linkedSignal,
  signal,
  Signal,
  WritableSignal,
} from '@angular/core';
import { _PiResolvedCommonViewFieldConfig } from '../../builder-base';
import { Observable } from 'rxjs';
import { isPromise, isSubscribable } from '../util/is-promise';
import { CommonComponentAction } from './wrapper';
import { rawConfig } from '@piying/valibot-visit';
import { mergeHooksFn } from './hook';

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
        data$.update((lastData) => ({ ...lastData, [key]: value }));
      });
    } else if (isSubscribable(result)) {
      // rxjs
      result.subscribe({
        next: (value) => {
          data$.update((lastData) => ({ ...lastData, [key]: value }));
        },
      });
    } else if (isSignal(result)) {
      signalObj[key] = result;
    } else {
      // 普通类型
      data$.update((lastData) => ({ ...lastData, [key]: result }));
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
export const WrapperSymbol = Symbol();
export const patchAsyncInputsCommonFn =
  (key: 'inputs' | 'attributes' | 'events' | 'props') =>
  <T>(dataObj: Record<string, AsyncProperty>) => {
    return rawConfig<T>((rawField, _, ...args) => {
      return mergeHooksFn(
        {
          allFieldsResolved: (field: _PiResolvedCommonViewFieldConfig) => {
            let data$: WritableSignal<any>;
            if (
              args.length > 0 &&
              typeof args[args.length - 1] === 'object' &&
              WrapperSymbol in args[args.length - 1]
            ) {
              data$ = args[args.length - 1][WrapperSymbol];
            } else if (key === 'props') {
              data$ = (() => field) as any;
            } else {
              data$ = field.define!;
            }
            let needInited = !data$()[key];
            const content$: WritableSignal<any> = data$()[key] ?? signal({});
            const inputList = Object.keys(dataObj);
            // 设置初始值
            content$.update((content) => ({
              ...content,
              ...inputList.reduce((obj, item) => {
                obj[item] = content?.[item] ?? undefined;
                return obj;
              }, {} as any),
            }));

            const result$ = asyncInputMerge(
              Object.entries(dataObj).reduce(
                (obj, [key, value]) => {
                  obj[key] = value(field);
                  return obj;
                },
                {} as Record<string, any>,
              ),
              content$,
            );

            if (needInited || result$ !== content$) {
              if (key === 'props') {
                (field as any).props = result$;
              } else {
                data$.update((data) => ({ ...data, [key]: result$ }));
              }
            }
          },
        },
        { position: 'bottom' },
        rawField,
      );
    });
  };

export const patchAsyncInputsCommon = patchAsyncInputsCommonFn('inputs');
export const patchAsyncAttributesCommon =
  patchAsyncInputsCommonFn('attributes');
export const patchAsyncEventsCommon = patchAsyncInputsCommonFn('events');
export const patchAsyncClassCommon = (
  fn: (field: _PiResolvedCommonViewFieldConfig) => any,
) =>
  patchAsyncInputsCommonFn('attributes')({
    class: fn,
  });

import { Signal, WritableSignal } from '@angular/core';
import { _PiResolvedCommonViewFieldConfig } from '../../builder-base';
import { Observable } from 'rxjs';
import { rawConfig, RawConfigAction } from '@piying/valibot-visit';
import { mergeHooksFn } from './hook';
import {
  asyncObjectSignal,
  AsyncObjectSignal,
} from '../../util/create-async-object-signal';

export function asyncInputMerge(
  dataObj: Record<string, any>,
  data$: AsyncObjectSignal<any>,
) {
  Object.keys(dataObj).forEach((key) => {
    data$.connect(key, dataObj[key]);
  });
  return data$;
}
type AsyncResult = Promise<any> | Observable<any> | Signal<any> | (any & {});
type AsyncProperty = (field: _PiResolvedCommonViewFieldConfig) => AsyncResult;
type ChangeKey = 'inputs' | 'outputs' | 'attributes' | 'events' | 'props';
export const WrapperSymbol = Symbol();

export const removeInputsCommonFn =
  (key: ChangeKey) =>
  <T>(list: string[]) =>
    rawConfig<T>((rawField, _, ...args) =>
      mergeHooksFn(
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
            const obj$ = data$()[key] as AsyncObjectSignal<any>;

            list.forEach((key) => {
              obj$.disconnect(key);
              obj$.update((object) => {
                object = { ...object };
                delete object[key];
                return object;
              });
            });
          },
        },
        { position: 'bottom' },
        rawField,
      ),
    );
export const patchAsyncInputsCommonFn =
  (key: 'inputs' | 'attributes' | 'events' | 'props' | 'outputs') =>
  <T>(dataObj: Record<string, AsyncProperty>) =>
    rawConfig<T>((rawField, _, ...args) =>
      mergeHooksFn(
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
            const needInited = !data$()[key];
            const content$: AsyncObjectSignal<any> =
              data$()[key] ?? asyncObjectSignal({});
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
      ),
    );

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

function createSetOrPatch(key: ChangeKey, isPatch?: boolean) {
  return <T>(value: Record<string, any>) => {
    return rawConfig<T>((rawField, _, ...args) =>
      mergeHooksFn(
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
            const content$ = data$()[key] as WritableSignal<any>;
            if (isPatch) {
              content$.update((data) => {
                return {
                  ...data,
                  ...value,
                };
              });
            } else {
              content$.set(value);
            }
          },
        },
        { position: 'bottom' },
        rawField,
      ),
    );
  };
}
const List: ChangeKey[] = [
  'inputs',
  'outputs',
  'attributes',
  'events',
  'props',
];
export const actions = {
  patch: List.reduce(
    (obj, key) => {
      obj[key] = createSetOrPatch(key, true);
      return obj;
    },
    {} as Record<
      ChangeKey,
      <T>(value: Record<string, any>) => RawConfigAction<'rawConfig', T, any>
    >,
  ),
  set: List.reduce(
    (obj, key) => {
      obj[key] = createSetOrPatch(key);
      return obj;
    },
    {} as Record<
      ChangeKey,
      <T>(value: Record<string, any>) => RawConfigAction<'rawConfig', T, any>
    >,
  ),
  asyncPatch: List.reduce(
    (obj, key) => {
      obj[key] = patchAsyncInputsCommonFn(key);
      return obj;
    },
    {} as Record<
      ChangeKey,
      <T>(value: any) => RawConfigAction<'rawConfig', T, any>
    >,
  ),
  remove: List.reduce(
    (obj, key) => {
      obj[key] = removeInputsCommonFn(key);
      return obj;
    },
    {} as Record<
      ChangeKey,
      <T>(value: string[]) => RawConfigAction<'rawConfig', T, any>
    >,
  ),
};

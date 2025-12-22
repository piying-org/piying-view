import { Signal, WritableSignal } from '@angular/core';
import { _PiResolvedCommonViewFieldConfig } from '../../builder-base';
import { Observable } from 'rxjs';
import { RawConfigAction } from '@piying/valibot-visit';
import { mergeHooksFn } from './hook';
import { AsyncObjectSignal } from '../../util/create-async-object-signal';
import { rawConfig } from './raw-config';
import {
  changeAsyncWrapper2,
  patchAsyncWrapper2,
  removeWrappers,
  setWrappers,
} from './wrapper';

type AsyncResult = Promise<any> | Observable<any> | Signal<any> | (any & {});
type AsyncProperty = (field: _PiResolvedCommonViewFieldConfig) => AsyncResult;
type ChangeKey = 'inputs' | 'outputs' | 'attributes' | 'events' | 'props';
export const CustomDataSymbol = Symbol();

export const createRemovePropertyFn =
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
              CustomDataSymbol in args[args.length - 1]
            ) {
              data$ = args[args.length - 1][CustomDataSymbol];
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
export function createPatchAsyncPropertyFn<
  InputData extends Record<string, AsyncProperty> = Record<
    string,
    AsyncProperty
  >,
>(key: 'inputs' | 'attributes' | 'events' | 'props' | 'outputs') {
  return <T>(dataObj: InputData) =>
    rawConfig<T>((rawField, _, ...args) => {
      let data$: WritableSignal<any>;
      if (
        args.length > 0 &&
        typeof args[args.length - 1] === 'object' &&
        CustomDataSymbol in args[args.length - 1]
      ) {
        data$ = args[args.length - 1][CustomDataSymbol];
      } else {
        data$ = (() => rawField) as any;
      }
      const content$: AsyncObjectSignal<any> = data$()[key];
      const inputList = Object.keys(dataObj);
      // 设置初始值
      content$.update((content) => ({
        ...content,
        ...inputList.reduce((obj, item) => {
          obj[item] = content?.[item] ?? undefined;
          return obj;
        }, {} as any),
      }));
      return mergeHooksFn(
        {
          allFieldsResolved: (field: _PiResolvedCommonViewFieldConfig) => {
            Object.entries(dataObj).forEach(([key, value]) => {
              const result = value(field);
              content$.connect(key, result);
            });
          },
        },
        { position: 'bottom' },
        rawField,
      );
    });
}

export const patchAsyncClassCommon = (
  fn: (field: _PiResolvedCommonViewFieldConfig) => any,
) =>
  createPatchAsyncPropertyFn('attributes')({
    class: fn,
  });

export function createSetOrPatchPropertyFn<
  InputData extends Record<string, any> = Record<string, any>,
>(key: ChangeKey, isPatch?: boolean) {
  return <T>(value: InputData) =>
    rawConfig<T>((rawField, _, ...args) => {
      let data$: WritableSignal<any>;
      if (
        args.length > 0 &&
        typeof args[args.length - 1] === 'object' &&
        CustomDataSymbol in args[args.length - 1]
      ) {
        data$ = args[args.length - 1][CustomDataSymbol];
      } else {
        data$ = (() => rawField) as any;
      }
      const content$ = data$()[key] as WritableSignal<any>;
      if (isPatch) {
        content$.update((data) => ({
          ...data,
          ...value,
        }));
      } else {
        content$.set(value);
      }
    });
}

export type ConfigAction<T> = RawConfigAction<'viewRawConfig', T, any>;

export const actions = {
  inputs: {
    patch: createSetOrPatchPropertyFn('inputs', true),
    set: createSetOrPatchPropertyFn('inputs'),
    patchAsync: createPatchAsyncPropertyFn('inputs'),
    remove: createRemovePropertyFn('inputs'),
  },
  outputs: {
    patch: createSetOrPatchPropertyFn<Record<string, (...args: any[]) => any>>(
      'outputs',
      true,
    ),
    set: createSetOrPatchPropertyFn<Record<string, (...args: any[]) => any>>(
      'outputs',
    ),
    patchAsync:
      createPatchAsyncPropertyFn<
        Record<
          string,
          (field: _PiResolvedCommonViewFieldConfig) => (...args: any[]) => any
        >
      >('outputs'),
    remove: createRemovePropertyFn('outputs'),
  },
  attributes: {
    patch: createSetOrPatchPropertyFn('attributes', true),
    set: createSetOrPatchPropertyFn('attributes'),
    patchAsync: createPatchAsyncPropertyFn('attributes'),
    remove: createRemovePropertyFn('attributes'),
  },
  events: {
    patch: createSetOrPatchPropertyFn<Record<string, (event: Event) => any>>(
      'events',
      true,
    ),
    set: createSetOrPatchPropertyFn<Record<string, (event: Event) => any>>(
      'events',
    ),
    patchAsync:
      createPatchAsyncPropertyFn<
        Record<
          string,
          (field: _PiResolvedCommonViewFieldConfig) => (event: Event) => any
        >
      >('events'),
    remove: createRemovePropertyFn('events'),
  },
  props: {
    patch: createSetOrPatchPropertyFn('props', true),
    set: createSetOrPatchPropertyFn('props'),
    patchAsync: createPatchAsyncPropertyFn('props'),
    remove: createRemovePropertyFn('props'),
  },
  wrappers: {
    set: setWrappers,
    patchAsync: patchAsyncWrapper2,
    remove: removeWrappers,
    changeAsync: changeAsyncWrapper2,
  },
};

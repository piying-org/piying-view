import { InjectionToken, Injector, Provider, Signal } from '@angular/core';
import { convert, CoreOptions } from './form-convert';
import * as v from 'valibot';
import { SetOptional, SetRequired } from '../util';
import type { _PiResolvedCommonViewFieldConfig } from '../builder-base';

export const PI_INPUT_OPTIONS_TOKEN = new InjectionToken<
  Signal<SetOptional<CoreOptionsWithoutInjector, 'builder'>>
>('PI_INPUT_OPTIONS');
export const PI_INPUT_SCHEMA_TOKEN = new InjectionToken<
  Signal<v.BaseSchema<any, any, any>>
>('PI_INPUT_SCHEMA');
export const PI_INPUT_MODEL_TOKEN = new InjectionToken<Signal<any>>(
  'PI_INPUT_MODEL',
);
type CoreOptionsWithoutInjector = Omit<CoreOptions, 'injector'>;

/** 创建 convertToField 函数的工厂 */
export function createConvertToField(
  defaultOptions: SetRequired<Partial<CoreOptions>, 'builder'>,
) {
  return <T extends v.BaseSchema<any, any, any>>(
    schema: T,
    parent: Injector,
    model?: Signal<v.InferInput<T>>,
    options?: Signal<SetOptional<CoreOptionsWithoutInjector, 'builder'>>,
  ) => {
    const fieldRoot = Injector.create({
      providers: [
        { provide: PI_INPUT_OPTIONS_TOKEN, useValue: options },
        { provide: PI_INPUT_SCHEMA_TOKEN, useValue: () => schema },
        { provide: PI_INPUT_MODEL_TOKEN, useValue: model },
      ],
      parent,
    });

    return convert<_PiResolvedCommonViewFieldConfig>(schema, {
      ...defaultOptions,
      ...options?.(),
      injector: fieldRoot,
    });
  };
}

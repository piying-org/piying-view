import { DestroyRef, InjectionToken, Injector, Provider } from '@angular/core';
import { convert, CoreOptions } from './form-convert';
import * as v from 'valibot';
import { SetOptional, SetRequired } from '../util';
import type { _PiResolvedCommonViewFieldConfig } from '../builder-base';

export const PI_INPUT_OPTIONS_TOKEN = new InjectionToken<
  () => SetOptional<CoreOptionsWithoutInjector, 'builder'>
>('PI_INPUT_OPTIONS');
export const PI_INPUT_SCHEMA_TOKEN = new InjectionToken<
  () => v.BaseSchema<any, any, any>
>('PI_INPUT_SCHEMA');
export type CoreOptionsWithoutInjector = SetOptional<CoreOptions, 'injector'>;
export type ConvertFactoryOptions = SetOptional<
  CoreOptionsWithoutInjector,
  'builder'
>;
export type ConvertOptions = SetOptional<ConvertFactoryOptions, 'handle'>;
/** 创建 convertToField 函数的工厂 */
export function createConvertToField(
  defaultOptions: SetRequired<Partial<CoreOptions>, 'builder'>,
  defaultInjector?: Injector,
) {
  return <T extends v.BaseSchema<any, any, any>>(
    schema: () => T,
    parent?: Injector,
    options?: () => ConvertFactoryOptions | undefined,
    providers?: Provider[],
  ) => {
    const parent2 = (parent ?? defaultInjector)!;
    const injector = Injector.create({
      providers: [
        { provide: PI_INPUT_OPTIONS_TOKEN, useValue: options },
        { provide: PI_INPUT_SCHEMA_TOKEN, useValue: schema },
        ...(providers ?? []),
      ],
      parent: parent2,
    });
    parent2.get(DestroyRef).onDestroy(() => {
      injector.destroy();
    });
    return convert<_PiResolvedCommonViewFieldConfig>(schema(), {
      ...defaultOptions,
      ...options?.(),
      injector: injector,
    });
  };
}

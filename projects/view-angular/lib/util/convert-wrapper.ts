import { Injector, Signal } from '@angular/core';
import { convert } from '@piying/view-angular-core';
import { AngularFormBuilder } from '../builder';
import { NgSchemaHandle } from '../schema/ng-schema';
import {
  PI_INPUT_OPTIONS_TOKEN,
  PI_INPUT_SCHEMA_TOKEN,
  PI_INPUT_MODEL_TOKEN,
  PiResolvedViewFieldConfig,
} from '../type';
import { NgConvertOptions } from '../type/builder-type';
import type { SetOptional } from '@piying/view-angular-core';
import * as v from 'valibot';

const DefaultConvertOptions = {
  builder: AngularFormBuilder,
  handle: NgSchemaHandle,
};

/**
 * 转换 Valibot 定义为 Piying 字段
 */
export function convertToField<T extends v.BaseSchema<any, any, any>>(
  schema: T,
  parent: Injector,
  model?: Signal<v.InferInput<T>>,
  options?: Signal<SetOptional<NgConvertOptions, 'builder' | 'handle'>>,
): PiResolvedViewFieldConfig {
  const fieldRoot = Injector.create({
    providers: [
      { provide: PI_INPUT_OPTIONS_TOKEN, useValue: options },
      { provide: PI_INPUT_SCHEMA_TOKEN, useValue: () => schema },
      { provide: PI_INPUT_MODEL_TOKEN, useValue: model },
    ],
    parent,
  });

  return convert<PiResolvedViewFieldConfig>(schema, {
    ...DefaultConvertOptions,
    ...options,
    injector: fieldRoot,
  });
}

import type { Injector } from 'static-injector';
import type { ComputedRef, InjectionKey } from 'vue';
import type { PiResolvedViewFieldConfig, PiViewConfig } from './type/group';
import { SetOptional, CoreSchemaHandle, FormBuilder } from '@piying/view-core';
import { ConvertOptions } from '@piying/valibot-visit';
import * as v from 'valibot';

export const InjectorToken: InjectionKey<ComputedRef<Injector>> = Symbol();
export const PI_VIEW_FIELD_TOKEN: InjectionKey<ComputedRef<PiResolvedViewFieldConfig>> = Symbol();

export const PI_INPUT_OPTIONS_TOKEN: InjectionKey<
  ComputedRef<
    SetOptional<ConvertOptions<typeof CoreSchemaHandle<any, any>>, 'handle'> & {
      builder: typeof FormBuilder<CoreSchemaHandle<any, any>>;
      fieldGlobalConfig?: PiViewConfig;
    }
  >
> = Symbol();
export const PI_INPUT_SCHEMA_TOKEN: InjectionKey<
  ComputedRef<v.BaseSchema<any, any, any> | v.SchemaWithPipe<any>>
> = Symbol();
export const PI_INPUT_MODEL_TOKEN: InjectionKey<ComputedRef<any>> = Symbol();

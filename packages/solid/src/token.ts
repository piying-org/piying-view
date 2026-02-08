import type { Injector } from 'static-injector';
import type { PiResolvedViewFieldConfig, PiViewConfig } from './type/group';
import { createContext } from 'solid-js';
import * as v from 'valibot';
import type { ConvertOptions } from '@piying/valibot-visit';
import type { SetOptional, CoreSchemaHandle, FormBuilder } from '@piying/view-core';

export const PI_VIEW_FIELD_TOKEN = createContext<
  PiResolvedViewFieldConfig | undefined
>(undefined);
export const InjectorToken = createContext<Injector | undefined>(undefined);
export const PI_INPUT_OPTIONS_TOKEN = createContext<
  SetOptional<ConvertOptions<typeof CoreSchemaHandle<any, any>>, 'handle'> & {
    builder: typeof FormBuilder<CoreSchemaHandle<any, any>>;
    fieldGlobalConfig?: PiViewConfig;
  }
>(undefined as any);
export const PI_INPUT_SCHEMA_TOKEN = createContext<
  v.BaseSchema<any, any, any> | v.SchemaWithPipe<any>
>(undefined as any);
export const PI_INPUT_MODEL_TOKEN = createContext<any>(undefined as any);

export const CVA = Symbol.for('ControlValueAccessor');

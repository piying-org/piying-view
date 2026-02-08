import type { ConvertOptions } from '@piying/valibot-visit';
import type { SetOptional, CoreSchemaHandle, FormBuilder } from '@piying/view-core';
import type { PiResolvedViewFieldConfig, PiViewConfig } from './type/group';
import * as v from 'valibot';

export const InjectorToken = Symbol();
export const PI_VIEW_FIELD_TOKEN = Symbol();
export const PI_INPUT_OPTIONS_TOKEN = Symbol();
export type PI_INPUT_OPTIONS_TOKEN = () => SetOptional<
	ConvertOptions<typeof CoreSchemaHandle<any, any>>,
	'handle'
> & {
	builder: typeof FormBuilder<CoreSchemaHandle<any, any>>;
	fieldGlobalConfig?: PiViewConfig;
};
export const PI_INPUT_SCHEMA_TOKEN = Symbol();
export type PI_INPUT_SCHEMA_TOKEN = () => v.BaseSchema<any, any, any> | v.SchemaWithPipe<any>;
export const PI_INPUT_MODEL_TOKEN = Symbol();
export type PI_INPUT_MODEL_TOKEN = () => any;
export type PI_VIEW_FIELD_TOKEN = () => PiResolvedViewFieldConfig;

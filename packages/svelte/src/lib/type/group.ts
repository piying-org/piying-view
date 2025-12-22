import type { SvelteSchemaHandle } from '../svelte-schema';
import type {
	CoreResolvedComponentDefine,
	LazyMarkType,
	PiCommonConfig,
	PiResolvedCommonViewFieldConfig
} from '@piying/view-core';

export interface ComponentFieldConfig {
	type?: string;
}

export type ResolvedComponentFieldConfig = Omit<
	ComponentFieldConfig,
	'inputs' | 'outputs' | 'directives' | 'wrappers'
>;

export type PiResolvedViewFieldConfig = PiResolvedCommonViewFieldConfig<
	() => PiResolvedViewFieldConfig,
	CoreResolvedComponentDefine
> &
	ResolvedComponentFieldConfig;

export type PiViewConfig = PiCommonConfig<
	any | (() => Promise<any>) | LazyMarkType<any>,
	any | (() => Promise<any>) | LazyMarkType<any>
>;

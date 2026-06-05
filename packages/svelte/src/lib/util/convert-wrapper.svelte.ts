import { type _PiResolvedCommonViewFieldConfig, createConvertToField } from '@piying/view-core';
import { SvelteFormBuilder } from '../builder';
import { SvelteSchemaHandle } from '../svelte-schema';
import { ChangeDetectionScheduler, ChangeDetectionSchedulerImpl, createRootInjector } from 'static-injector';

const DefaultConvertOptions = {
	builder: SvelteFormBuilder,
	handle: SvelteSchemaHandle,
};

/**
 * 转换 Valibot 定义为 Piying 字段
 */
export const convertToField = createConvertToField(
	DefaultConvertOptions,
	createRootInjector({
		providers: [
			{
				provide: ChangeDetectionScheduler,
				useClass: ChangeDetectionSchedulerImpl,
			},
		],
	}),
);

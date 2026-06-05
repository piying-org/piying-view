import { createConvertToField } from '@piying/view-core';
import { SvelteFormBuilder } from '../builder';
import { SvelteSchemaHandle } from '../svelte-schema';

const DefaultConvertOptions = {
	builder: SvelteFormBuilder,
	handle: SvelteSchemaHandle,
};

/**
 * 转换 Valibot 定义为 Piying 字段
 */
export const convertToField = createConvertToField(DefaultConvertOptions);

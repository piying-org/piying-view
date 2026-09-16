import type { KeyPath, PiFieldGet, PiFieldValueOf } from '@piying/view-core';
import type { ControlValueAccessorAdapter } from './use-control-value-accessor.svelte';

/** 渲染作用域: cvaa / field 都按 path 指向的字段推导 */
export type FieldControlBindScope<S, P extends KeyPath> = {
	cvaa: ControlValueAccessorAdapter<PiFieldValueOf<PiFieldGet<S, P>>>;
	field: PiFieldGet<S, P>;
};

import { effect } from 'static-injector';
import type { Injector } from 'static-injector';
import { AbstractControl } from '@piying/view-core';
import { deepEqual } from 'fast-equals';

export function initListen(
	input: any,
	control: AbstractControl,
	injector: Injector,
	fn: (input: any) => void
) {
	let init = true;
	return effect(
		() => {
			const modelValue = control.value$$();
			if (init) {
				if (!deepEqual(modelValue, input)) {
					fn(modelValue);
				}
				init = false;
			} else {
				fn(modelValue);
			}
		},
		{ injector }
	);
}

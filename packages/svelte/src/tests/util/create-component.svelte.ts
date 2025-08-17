import { render } from '@testing-library/svelte';
import { PiyingView, PiyingViewGroup, type PiViewConfig } from '@piying/view-svelte';
import type { BaseSchema, SchemaWithPipe } from 'valibot';
import { delay } from './delay';
import PiInput from '../component/input.svelte';
import PiInputNumber from '../component/input-number.svelte';
import PiInputCheckbox from '../component/input-checkbox.svelte';
import PiSelect from '../component/input-select.svelte';
import PiInputRadio from '../component/input-radio.svelte';

export async function createComponent(
	schema: BaseSchema<any, any, any> | SchemaWithPipe<any>,
	model: any,
	cmpOptions?: {
		defaultConfig?: PiViewConfig;
		context?: any;
	}
) {
	const options = {
		context: cmpOptions?.context,
		fieldGlobalConfig: {
			...cmpOptions?.defaultConfig,
			types: {
				string: { type: PiInput },
				number: { type: PiInputNumber },
				// range: { type: PiInputRange },
				boolean: { type: PiInputCheckbox },
				picklist: { type: PiSelect },
				radio: { type: PiInputRadio },
				// dynamic: { type: PiInputDynamic },
				object: { type: PiyingViewGroup },
				array: { type: PiyingViewGroup },
				...Object.entries(cmpOptions?.defaultConfig?.types ?? {}).reduce((obj, item) => {
					obj[item[0]] = {
						...item[1],
						type: item[1].type
					};
					return obj;
				}, {} as any)
			},
			wrappers: {
				// block: {
				//   type: BlockWrapper,
				// },
				...Object.entries(cmpOptions?.defaultConfig?.wrappers ?? {}).reduce((obj, item) => {
					obj[item[0]] = {
						...item[1],
						type: item[1].type
					};
					return obj;
				}, {} as any)
			}
		}
	};
	let modelValue = $state(model);
	let instance = render(PiyingView, {
		schema,
		model,
		options,
		modelChange: (value) => {
			modelValue = value;
		}
	});
	await delay();

	return {
		instance,
		modelChange$: () => {
			return modelValue;
		},
		destroy: () => {
			instance.unmount();
		}
	};
}

import type { ControlValueAccessor } from '@piying/view-core';

export function useControlValueAccessor(optionalBind?: boolean) {
	let value = $state();
	let disabled = $state(false);
	let onChange: (input: any) => void;
	let touched: () => void;
	const instance: ControlValueAccessor = {
		writeValue(obj) {
			value = obj;
		},
		registerOnChange(fn) {
			onChange = fn;
		},
		registerOnTouched(fn) {
			touched = fn;
		},
		setDisabledState(value) {
			disabled = value;
		}
	};
	return {
		cva: instance,
		cvaa: {
			get value() {
				return value;
			},
			get disabled() {
				return disabled;
			},
			valueChange: (input: any) => {
				if (optionalBind) {
					onChange?.(input);
				} else {
					onChange(input);
				}
				value = input;
			},
			touchedChange: () => {
				if (optionalBind) {
					touched?.();
				} else {
					touched();
				}
			}
		}
	};
}

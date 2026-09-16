import type { ControlValueAccessor } from '@piying/view-core';

export type ControlValueAccessorAdapter<V = any> = {
  readonly value: V;
  readonly disabled: boolean;
  touchedChange: () => void;
  valueChange: (value: V) => void;
};

export function useControlValueAccessor<V = any>(
  optionalBind?: boolean,
): {
  cva: ControlValueAccessor;
  cvaa: ControlValueAccessorAdapter<V>;
} {
	let value = $state<V | undefined>();
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
				return value as V;
			},
			get disabled() {
				return disabled;
			},
			valueChange: (input: V) => {
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

import type { ControlValueAccessor } from '@piying/view-core';
import { ref, shallowRef, type Ref, type ShallowRef } from 'vue';

export type ControlValueAccessorAdapter<V = any> = {
  value: ShallowRef<V>;
  disabled: Ref<boolean>;
  touchedChange: () => void;
  valueChange: (value: V) => void;
};

export function useControlValueAccessor<V = any>(optionalBind?: boolean): {
  cva: ControlValueAccessor;
  cvaa: ControlValueAccessorAdapter<V>;
} {
  const value = shallowRef() as ShallowRef<V>;
  const disabled = ref(false);
  let onChange: (input: any) => void;
  let touched: () => void;
  const instance: ControlValueAccessor = {
    writeValue(obj) {
      value.value = obj;
    },
    registerOnChange(fn) {
      onChange = fn;
    },
    registerOnTouched(fn) {
      touched = fn;
    },
    setDisabledState(value) {
      disabled.value = value;
    },
  };
  return {
    cva: instance,
    cvaa: {
      value: value,
      disabled: disabled,
      valueChange: (input: V) => {
        if (optionalBind) {
          onChange?.(input);
        } else {
          onChange(input);
        }
        value.value = input;
      },
      touchedChange: () => {
        if (optionalBind) {
          touched?.();
        } else {
          touched();
        }
      },
    },
  };
}

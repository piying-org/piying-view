import type { ControlValueAccessor } from '@piying/view-core';
import { ref, watch } from 'vue';

export function useControlValueAccessor(autoChange = true) {
  const value = ref();
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
  if (autoChange) {
    watch(value, (value) => {
      onChange(value);
    });
  }

  return {
    cva: instance,
    cvaa: {
      value: value,
      disabled: disabled,
      valueChange: (input: any) => {
        onChange(input);
        value.value = input;
      },
      touchedChange: () => {
        touched();
      },
    },
  };
}

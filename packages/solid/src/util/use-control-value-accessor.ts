import type { ControlValueAccessor } from '@piying/view-core';
import { createSignal, createMemo, type Accessor } from 'solid-js';

export function useControlValueAccessor() {
  const [value, setValue] = createSignal<any>(undefined);
  const [disabled, setDisabled] = createSignal(false);
  const [onChange, setOnChange] = createSignal<
    ((input: any) => void) | undefined
  >(undefined);
  const [touched, setTouched] = createSignal<(() => void) | undefined>(
    undefined,
  );
  const cva: ControlValueAccessor = {
    writeValue(obj) {
      setValue(obj);
    },
    registerOnChange(fn) {
      setOnChange(() => fn);
    },
    registerOnTouched(fn) {
      setTouched(() => fn);
    },
    setDisabledState(value) {
      setDisabled(value);
    },
  };

  return {
    cva: cva,
    cvaa: {
      value: value,
      disabled: disabled,
      valueChange: (value: any) => {
        onChange()?.(value);
        setValue(value);
      },
      touchedChange: () => {
        touched()?.();
      },
    } as ControlValueAccessorAdapter,
  };
}

export type ControlValueAccessorAdapter = {
  value: Accessor<any>;
  disabled: Accessor<boolean>;
  touchedChange: () => void;
  valueChange: (value: any) => void;
};

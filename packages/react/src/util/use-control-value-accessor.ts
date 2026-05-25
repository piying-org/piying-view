import type { ControlValueAccessor } from '@piying/view-core';
import { useMemo, useRef, useState } from 'react';

export function useControlValueAccessor(optionalBind?: boolean) {
  const [value, setValue] = useState(undefined);
  const [disabled, setDisabled] = useState(false);
  const onChange = useRef<((input: any) => void) | undefined>(undefined);
  const touched = useRef<(() => void) | undefined>(undefined);
  const cva: ControlValueAccessor = useMemo(() => {
    return {
      writeValue(obj) {
        setValue(obj);
      },
      registerOnChange(fn) {
        onChange.current = fn;
      },
      registerOnTouched(fn) {
        touched.current = fn;
      },
      setDisabledState(value) {
        setDisabled(value);
      },
    };
  }, []);
  const cvaa = useMemo(() => {
    return {
      value: value,
      disabled: disabled,
      valueChange: (value: any) => {
        if (optionalBind) {
          onChange.current?.(value);
        } else {
          onChange.current!(value);
        }
        setValue(value);
      },
      touchedChange: () => {
        if (optionalBind) {
          touched.current?.();
        } else {
          touched.current!();
        }
      },
    } as ControlValueAccessorAdapter;
  }, [value, disabled]);
  return useMemo(() => {
    return {
      cva,
      cvaa,
    };
  }, [cvaa]);
}

export type ControlValueAccessorAdapter = {
  value: any;
  disabled: boolean;
  touchedChange: () => void;
  valueChange: (value: any) => void;
};

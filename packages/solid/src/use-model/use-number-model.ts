import { createMemo } from 'solid-js';
import type { ControlValueAccessorAdapter } from '../util/use-control-value-accessor';

export function useInputNumberModel(cvaa: ControlValueAccessorAdapter) {
  return createMemo(() => {
    return {
      value: cvaa.value() == null ? '' : cvaa.value(),
      disabled: cvaa.disabled(),
      onBlur: cvaa.touchedChange,
      onInput: (event: any) => {
        const value = (event.target as any).value;
        cvaa.valueChange(value == '' ? undefined : parseFloat(value));
      },
    };
  });
}

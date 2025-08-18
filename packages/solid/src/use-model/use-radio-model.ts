import { createMemo } from 'solid-js';
import type { ControlValueAccessorAdapter } from '../util/use-control-value-accessor';

export function useInputRadioModel(
  cvaa: ControlValueAccessorAdapter,
  value: any,
) {
  return createMemo(() => {
    return {
      value,
      checked: Object.is(cvaa.value(), value),
      disabled: cvaa.disabled(),
      onBlur: cvaa.touchedChange,
      onChange: () => cvaa.valueChange(value),
    };
  });
}

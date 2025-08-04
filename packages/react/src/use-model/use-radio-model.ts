import { useMemo } from 'react';
import type { ControlValueAccessorAdapter } from '../util/use-control-value-accessor';

export function useInputRadioModel(
  cvaa: ControlValueAccessorAdapter,
  value: any,
) {
  return useMemo(() => {
    return {
      value,
      checked: Object.is(cvaa.value, value),
      disabled: cvaa.disabled,
      onBlur: cvaa.touchedChange,
      onChange: () => cvaa.valueChange(value),
    };
  }, [cvaa]);
}

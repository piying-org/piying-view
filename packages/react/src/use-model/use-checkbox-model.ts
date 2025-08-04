import { useMemo } from 'react';
import type { ControlValueAccessorAdapter } from '../util/use-control-value-accessor';

export function useInputCheckboxModel(cvaa: ControlValueAccessorAdapter) {
  return useMemo(() => {
    return {
      checked: cvaa.value ?? false,
      disabled: cvaa.disabled,
      onBlur: cvaa.touchedChange,
      onChange: (event: React.ChangeEvent<HTMLInputElement>) =>
        cvaa.valueChange(event.target.checked),
    };
  }, [cvaa]);
}

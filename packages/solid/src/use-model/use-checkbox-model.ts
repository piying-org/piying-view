import { createMemo, type Accessor } from 'solid-js';
import type { ControlValueAccessorAdapter } from '../util/use-control-value-accessor';

export function useInputCheckboxModel(cvaa: ControlValueAccessorAdapter) {
  return createMemo(() => ({
    checked: cvaa.value() ?? false,
    disabled: cvaa.disabled(),
    onBlur: cvaa.touchedChange,
    onChange: (
      event: Event & {
        target: HTMLInputElement;
      },
    ) => cvaa.valueChange(event.target.checked),
  }));
}

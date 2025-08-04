import { useMemo } from 'react';
import type { ControlValueAccessorAdapter } from '../util/use-control-value-accessor';

export function useSelectModel(
  cvaa: ControlValueAccessorAdapter,
  multiple: boolean = false,
) {
  return useMemo(() => {
    return {
      value: cvaa.value,
      disabled: cvaa.disabled,
      onBlur: cvaa.touchedChange,
      onChange: (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selected = [];
        const el = event.target;
        if (el.selectedOptions !== undefined) {
          for (let index = 0; index < el.selectedOptions.length; index++) {
            const item = el.selectedOptions[index];
            selected.push(item.value);
            if (!multiple) {
              break;
            }
          }
        } else {
          for (let index = 0; index < el.options.length; index++) {
            const option = el.options[index];
            if (option.selected) {
              selected.push(option.value);
              if (!multiple) {
                break;
              }
            }
          }
        }
        cvaa.valueChange(multiple ? selected : selected[0]);
      },
    };
  }, [cvaa]);
}

import { useMemo, useRef } from 'react';
import type { ControlValueAccessorAdapter } from '../util/use-control-value-accessor';

export function useInputTextModel(
  cvaa: ControlValueAccessorAdapter,
  compositionMode: boolean,
) {
  const composing = useRef(false);
  return useMemo(() => {
    const obj = {
      value: cvaa.value == null ? '' : cvaa.value,
      disabled: cvaa.disabled,
      onBlur: cvaa.touchedChange,
    };
    if (compositionMode) {
      return {
        ...obj,
        onCompositionStart: () => {
          composing.current = true;
        },
        onCompositionEnd: (event: any) => {
          composing.current = false;
          cvaa.valueChange((event.target as any).value);
        },
      };
    }
    return {
      ...obj,
      onInput: (event: any) => cvaa.valueChange((event.target as any).value),
    };
  }, [cvaa, compositionMode]);
}

import { createMemo, createSignal } from 'solid-js';
import type { ControlValueAccessorAdapter } from '../util/use-control-value-accessor';

export function useInputTextModel(
  cvaa: ControlValueAccessorAdapter,
  compositionMode: boolean,
) {
  const [composing, setComposing] = createSignal(false);
  return createMemo(() => {
    const obj = {
      value: cvaa.value() == null ? '' : cvaa.value(),
      disabled: cvaa.disabled(),
      onBlur: cvaa.touchedChange,
    };
    if (compositionMode) {
      return {
        ...obj,
        onCompositionStart: () => {},
        onCompositionEnd: (event: any) => {
          setComposing(false);
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

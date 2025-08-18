import { createMemo, createSignal } from 'solid-js';
import type { ControlValueAccessorAdapter } from '../util/use-control-value-accessor';

export function useInputTextModel(
  cvaa: ControlValueAccessorAdapter,
  compositionMode: () => boolean,
) {
  const [composing, setComposing] = createSignal(false);
  return createMemo(() => {
    const obj = {
      value: cvaa.value() == null ? '' : cvaa.value(),
      disabled: cvaa.disabled(),
      onBlur: cvaa.touchedChange,
      onInput: (event: any) => {
        if (!compositionMode() || (compositionMode() && !composing())) {
          cvaa.valueChange((event.target as any).value);
        }
      },
    };
    if (compositionMode()) {
      return {
        ...obj,
        onCompositionStart: () => {
          setComposing(true);
        },
        onCompositionEnd: (event: any) => {
          setComposing(false);
          cvaa.valueChange((event.target as any).value);
        },
      };
    }
    return obj;
  });
}

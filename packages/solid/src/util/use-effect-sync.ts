import { createEffect, createMemo, onCleanup } from 'solid-js';

export function useEffectSync(fn: () => (() => void) | void) {
  let dispose: any = undefined;

  createMemo(() => {
    dispose = fn();
  });
  createEffect(() => {
    onCleanup(() => {
      dispose?.();
      dispose = undefined;
    });
  });
}

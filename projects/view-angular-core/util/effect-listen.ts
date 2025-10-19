import { CreateEffectOptions, effect, EffectRef } from '@angular/core';
import { deepEqual } from 'fast-equals';
/** 跳过第一个值,假如发射时和初始值不同 */
export function effectListen(
  listen: () => any,
  fn: () => void,
  options?: CreateEffectOptions,
): EffectRef {
  let first = true;
  const oldValue = listen();
  return effect(() => {
    const currentValue = listen();
    if (first) {
      first = false;
      if (!deepEqual(oldValue, currentValue)) {
        fn();
      }
      return;
    }
    return fn();
  }, options);
}

import { effect } from 'static-injector';

import { InjectorToken } from '../token';
import { useContext, createEffect, createSignal, onCleanup } from 'solid-js';

// signal=>ref
// todo 重命名
export function useSignalToRef<T>(value: () => T) {
  const injector = useContext(InjectorToken)!;
  const [result, setResult] = createSignal(value());
  createEffect(() => {
    setResult(() => value());
    const ref = effect(
      () => {
        const currentValue = value();
        if (!Object.is(result(), currentValue)) {
          setResult(() => currentValue!);
        }
      },
      { injector: injector },
    );
    onCleanup(() => {
      ref.destroy();
    });
  });
  return result;
}

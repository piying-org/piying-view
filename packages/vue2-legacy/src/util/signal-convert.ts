import { effect } from 'static-injector';
import { shallowRef, watchEffect, inject as vInject } from 'vue';
import { InjectorToken } from '../token';

// signal=>ref
export function signalToRef<T>(value: () => T | undefined) {
  const injector = vInject(InjectorToken)!;

  const dataRef = shallowRef<T>(undefined as any);
  watchEffect((onWatcherCleanup) => {
    dataRef.value = value()!;
    const ref = effect(
      () => {
        const currentValue = value();
        if (!Object.is(dataRef.value, currentValue)) {
          dataRef.value = currentValue!;
        }
      },
      { injector: injector },
    );
    onWatcherCleanup(() => {
      ref.destroy();
    });
  });
  return dataRef;
}

import { effect } from 'static-injector';
import { shallowRef, watchEffect, inject as vInject, type ShallowRef } from 'vue';
import { InjectorToken } from '../token';

// signal=>ref
export function signalToRef<T>(value: () => T | undefined): ShallowRef<T> {
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
      { injector: injector.value },
    );
    onWatcherCleanup(() => {
      ref.destroy();
    });
  });
  return dataRef;
}

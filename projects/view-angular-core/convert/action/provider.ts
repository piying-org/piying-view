import { InjectorProvider } from '../handle/core.schema-handle';
import { rawConfig } from './raw-config';

export function setProviders<T>(providers: InjectorProvider[]) {
  return rawConfig<T>((field) => {
    field.providers = providers;
  });
}
export function patchProviders<T>(providers: InjectorProvider[]) {
  return rawConfig<T>((field) => {
    field.providers ??= [];
    field.providers.push(providers);
  });
}
export function changeProviders<T>(
  providersFn: (input: InjectorProvider[]) => InjectorProvider[],
) {
  return rawConfig<T>((field) => {
    const result = providersFn(field.providers ?? []);
    field.providers = result;
  });
}

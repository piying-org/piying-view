import { rawConfig } from './raw-config';

export function setAlias<T>(alias: string) {
  return rawConfig<T>((field) => {
    field.alias = alias;
  });
}

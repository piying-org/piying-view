import { rawConfig } from './raw-config';

export function setComponent<T>(type: any) {
  return rawConfig<T>((field) => {
    field.type = type;
  });
}

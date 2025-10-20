import { _PiResolvedCommonViewFieldConfig } from '../../builder-base';
import { FindConfigToken } from '../../builder-base/find-config';
import { rawConfig } from './raw-config';

export function setComponent<T>(type: any) {
  return rawConfig<T>((field) => {
    field.type = type;
  });
}
export function findComponent<T>(
  field: _PiResolvedCommonViewFieldConfig,
  type: any,
) {
  return field.injector.get(FindConfigToken).findComponentConfig(type).define!
    .type;
}

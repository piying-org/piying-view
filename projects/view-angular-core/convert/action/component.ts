import { defineType } from '@piying/valibot-visit';
import { _PiResolvedCommonViewFieldConfig } from '../../builder-base';
import { FindConfigToken } from '../../builder-base/find-config';
import { rawConfig } from './raw-config';

export function setComponent<T>(type: any) {
  return typeof type === 'string'
    ? defineType<T>(type)
    : rawConfig<T>((field) => {
        field.type = type;
      });
}
export function findComponent<T>(
  field: _PiResolvedCommonViewFieldConfig,
  type: any,
) {
  return field.injector.get(FindConfigToken).findComponentConfig(type);
}

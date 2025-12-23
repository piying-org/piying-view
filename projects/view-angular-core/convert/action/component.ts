import { defineName, metadataList } from '@piying/valibot-visit';
import { _PiResolvedCommonViewFieldConfig } from '../../builder-base';
import { FindConfigToken } from '../../builder-base/find-config';
import { rawConfig } from './raw-config';

export function setComponent<T>(type: any) {
  return typeof type === 'string'
    ? metadataList<T>([
        defineName<T>(type),
        rawConfig<T>((field) => {
          // 需要保留,因为type还未完全废弃
          if (typeof field.type === 'string') {
            field.type = type;
          }
        }),
      ])
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

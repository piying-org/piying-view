import {
  defineType,
  DefineTypeAction,
  RawConfigAction,
} from '@piying/valibot-visit';
import { _PiResolvedCommonViewFieldConfig } from '../../builder-base';
import { FindConfigToken } from '../../builder-base/find-config';
import { rawConfig } from './raw-config';
import { AnyCoreSchemaHandle } from '../handle/core.schema-handle';

export function setComponent<T, D>(
  type: D,
): D extends string
  ? DefineTypeAction<T>
  : RawConfigAction<'viewRawConfig', T, AnyCoreSchemaHandle> & {
      __type: D;
    } {
  return typeof type === 'string'
    ? (defineType<T>(type) as any)
    : (rawConfig<T>((field) => {
        field.type = type as any;
      }) as any);
}
export function findComponent<T>(
  field: _PiResolvedCommonViewFieldConfig,
  type: any,
) {
  return field.injector.get(FindConfigToken).findComponentConfig(type);
}

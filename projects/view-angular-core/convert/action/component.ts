import {
  defineType,
  DefineTypeAction,
  RawConfigAction,
} from '@piying/valibot-visit';
import { _PiResolvedCommonViewFieldConfig } from '../../builder-base';
import { FindConfigToken } from '../../builder-base/find-config';
import { rawConfig } from './raw-config';
import { AnyCoreSchemaHandle } from '../handle/core.schema-handle';

/**
 * `D extends string` 时把字面量钉在 `value` 上。
 *
 * `DefineTypeAction.value` 是宽 `string`, 类型层读不出 'radio' 这种组件名,
 * 于是 `SchemaTypeAt` 只能退回 schema 自身的 type(picklist), 与运行时不一致。
 * 交叉一层 `{ value: D }` 后 `string & 'radio'` 收敛成 'radio', 运行时不变。
 */
export function setComponent<T, const D>(
  type: D,
): D extends string
  ? DefineTypeAction<T> & { readonly value: D }
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

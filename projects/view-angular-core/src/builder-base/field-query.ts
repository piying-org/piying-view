import { QueryPath, ArraryIterable, arrayStartsWith } from '../util';
import {
  _PiResolvedCommonViewFieldConfig,
  PiResolvedCommonViewFieldConfig,
} from './type/common-field-config';
import { groupGenerator } from './util/group-flat';

export function fieldQuery(
  key: QueryPath,
  field: PiResolvedCommonViewFieldConfig<any, any>,
  aliasMap: Map<string, PiResolvedCommonViewFieldConfig<any, any>>,
  root: PiResolvedCommonViewFieldConfig<any, any>,
  aliasNotFoundFn?: (
    name: string,
    field: PiResolvedCommonViewFieldConfig<any, any>,
  ) => PiResolvedCommonViewFieldConfig<any, any>,
) {
  const keyPath = Array.isArray(key)
    ? key
    : typeof key === 'number'
      ? [key]
      : key.split('.');
  const firstPath = keyPath[0];
  let list:
    | ArraryIterable<{
        field: _PiResolvedCommonViewFieldConfig;
        level: number;
      }>
    | undefined;
  if (firstPath === '#') {
    field = root;
    list = [{ field: root, level: 1 }];
  } else if (firstPath === '..') {
    list = [{ field: field.parent!, level: 1 }];
  } else if (typeof firstPath === 'string' && firstPath.startsWith('@')) {
    let queryField = aliasMap.get(firstPath.slice(1));
    if (!queryField && aliasNotFoundFn) {
      queryField = aliasNotFoundFn(firstPath.slice(1), field);
    }
    list = [{ field: queryField!, level: 1 }];
  } else if (field.fieldGroup) {
    list = groupGenerator(field.fieldGroup())
      .filter(
        (field) => field.keyPath && arrayStartsWith(keyPath, field.keyPath),
      )
      .map((field) => ({ field: field, level: field.keyPath?.length! }));
  } else if (field.fieldArray) {
    list = field
      .fieldArray()
      .filter(
        (field) => field.keyPath && arrayStartsWith(keyPath, field.keyPath),
      )
      .map((field) => ({ field: field, level: field.keyPath?.length! }));
  }
  if (!list) {
    return;
  }
  for (const item of list) {
    if (keyPath.length === item.level) {
      return item.field;
    }
    const res = item.field.get(keyPath.slice(item.level), aliasNotFoundFn);
    if (res) {
      return res;
    }
  }
  return undefined;
}

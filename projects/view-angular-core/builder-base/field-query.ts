import { ArraryIterable, arrayStartsWith, KeyPath } from '../util';
import {
  _PiResolvedCommonViewFieldConfig,
  PiResolvedCommonViewFieldConfig,
} from './type/common-field-config';
import { groupGenerator } from './util/group-flat';

export function fieldQuery(
  keyPath: KeyPath,
  field: PiResolvedCommonViewFieldConfig<any, any>,
  aliasMap: Map<string, PiResolvedCommonViewFieldConfig<any, any>>,
  root: PiResolvedCommonViewFieldConfig<any, any>,
) {
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
    const parent = field.parent;
    // 根字段的 parent 是个只带 fullPath 的占位对象, 没有 get。
    // 编译期已经拦住了越界上溯, 能走到这里就是调用方绕过类型硬写的,
    // 属于写错, 直接抛错而不是静默返回 undefined。
    if (!parent || typeof parent.get !== 'function') {
      throw new Error(
        `[piying-view] '..' 已到达根字段, 无法继续上溯; 请求路径: ${keyPath.join('.')}`,
      );
    }
    list = [{ field: parent, level: 1 }];
  } else if (typeof firstPath === 'string' && firstPath.startsWith('@')) {
    const queryField = aliasMap.get(firstPath.slice(1));
    list = [{ field: queryField!, level: 1 }];
  } else if (field.fixedChildren || field.restChildren) {
    const children = [
      ...(field.fixedChildren?.() ?? []),
      ...(field.restChildren?.() ?? []),
    ];
    list = groupGenerator(children)
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
    const res = item.field.get(keyPath.slice(item.level));
    if (res) {
      return res;
    }
  }
  return undefined;
}

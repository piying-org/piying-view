import type { _PiResolvedCommonViewFieldConfig } from '../builder-base';

/**
 * 解析监听路径: `undefined` 与空路径 `[]` 都表示「自身」。
 *
 * 注意 `!keyPath` 对空数组是 false, 会误走 `field.get([])` 拿到 undefined,
 * 而类型层 `ListenPathOf` 是允许 `[]` 的, 所以这里必须显式判长度。
 * @internal
 */
export function resolveListenField(
  field: _PiResolvedCommonViewFieldConfig,
  keyPath?: readonly (string | number)[],
): _PiResolvedCommonViewFieldConfig {
  return !keyPath || keyPath.length === 0
    ? field
    : (field.get([...keyPath]) as _PiResolvedCommonViewFieldConfig);
}

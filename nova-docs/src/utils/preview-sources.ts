import { globSync } from 'tinyglobby';

// 构建/开发时进程的工作目录即 nova-docs 项目根
export const ROOT = process.cwd();

export type AttrValue = string | string[];
export type Attrs = Map<string, AttrValue>;

export function toList(value?: AttrValue): string[] {
  return value == null ? [] : Array.isArray(value) ? value : [value];
}

/** 把组件 props 收成属性表，丢掉未提供的项 */
export function attrsOf(values: Record<string, AttrValue | undefined>): Attrs {
  const attrs = new Map<string, AttrValue>();
  for (const [key, value] of Object.entries(values)) {
    if (value != null) attrs.set(key, value);
  }
  return attrs;
}

/**
 * LivePreview 的源码文件解析规则。
 * 组件与「复制 markdown」共用同一份，保证两边读到完全相同的文件集合：
 * include 优先于 path，支持 exclude，忽略 node_modules。
 */
export function resolveLivePreviewFiles(attrs: Attrs) {
  const include = toList(attrs.get('include'));
  const patterns = include.length ? include : toList(attrs.get('path'));
  if (!patterns.length) return [];

  const ignore = toList(attrs.get('exclude'));
  return globSync(patterns, {
    cwd: ROOT,
    ignore: ignore.length ? ignore : undefined,
  })
    .filter((f) => !f.startsWith('node_modules/'))
    .sort();
}

/** SchemaPreview 的 definition 是具体文件，不走 glob */
export function resolveSchemaPreviewFiles(attrs: Attrs) {
  const file = toList(attrs.get('definition'))[0];
  return file ? [file] : [];
}

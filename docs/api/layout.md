# Layout metadata — 布局控制

`layout` Action 控制字段在表单中的排列顺序和位置，支持调整优先级、移动字段到指定位置。

## 字段顺序原则

现代浏览器（除 IE11）字段顺序一般为定义顺序;如果你想修改,可以使用priority

## 类型签名

```typescript
function layout<TInput>(value: {
  keyPath?: KeyPath; // 目标路径或特殊查询表达式
  priority?: number; // 排序权重（数值越小越靠前）
}): LayoutAction<TInput>;
```

## priority — 排序权重

在 `intersect` 或其他多字段场景中，使用 `priority` 控制字段顺序：

### 基本用法

```typescript
import * as v from 'valibot';
import { layout } from '@piying/view-angular-core';

const obj = v.object({
  k1: v.pipe(v.string(), layout({ priority: 1 })), // 靠前（权重小）
  k2: v.pipe(v.string(), layout({ priority: 2 })), // 靠后（权重大）
});
```

## keyPath — 字段位置移动

`keyPath` 允许将字段移动到不同的位置，支持多种查询表达式。

### '#' — 移动到当前层级开头

将字段提到父级的最前面：

```typescript
const obj = v.object({
  input0: v.string(),
  input1: v.pipe(
    v.string(),
    layout({ keyPath: ['#'] }), // 移动到根级内显示
  ),
});
```

### '..' — 跨层级移动

将字段移动到祖先层级的指定位置：

```typescript
const obj = v.object({
  k1: v.string(),
  o1: v.object({
    k2: v.pipe(
      v.string(),
      layout({ keyPath: ['..', '..'] }), // 移动到根层级
    ),
  }),
  k3: v.string(),
});
```

### '@alias' — 通过别名定位

结合 `setAlias` 使用，将字段移动到别名的位置：

```typescript
import { layout, setAlias } from '@piying/view-angular-core';

const obj = v.intersect([
  v.pipe(v.object({}), setAlias('ly1')),
  v.object({
    input0: v.string(),
    input1: v.pipe(
      v.string(),
      layout({ keyPath: ['@ly1'] }), // 移动到 alias 'ly1'内
    ),
  }),
]);
```

### Intersect + Layout 配合使用

在 `intersect` 中，Layout 可以完全改变字段的排列：

```typescript
const obj = v.intersect([
  v.pipe(v.object({}), setAlias('scope1')),
  v.object({
    key1: v.pipe(
      v.object({
        test1: v.pipe(v.optional(v.string(), 'value1'), layout({ keyPath: ['@scope1'] })),
      }),
    ),
  }),
]);
```

### Intersect 移动后 Group 变空

当 `intersect` 中的子字段通过 layout 被移出 group 后，group 可能变为空：

```typescript
const obj = v.intersect([
  v.object({
    data: v.pipe(v.intersect([v.pipe(v.object({}), layout({ priority: 2, keyPath: ['#'] })), v.pipe(v.object({}), layout({ priority: 3, keyPath: ['#'] }))]), asVirtualGroup()),
  }),
]);
```

## KeyPath 查询表达式汇总

| 表达式                      | 说明             | 示例                                     |
| --------------------------- | ---------------- | ---------------------------------------- |
| `undefined` / `[undefined]` | 当前字段自身     | `layout({ keyPath: undefined })`         |
| `'#'`                       | 当前父级容器开头 | `layout({ keyPath: ['#'] })`             |
| `'..'`                      | 上一级祖先       | `layout({ keyPath: ['..'] })`            |
| `['..', '..']`              | 上两级祖先       | `layout({ keyPath: ['..', '..'] })`      |
| `'@alias'`                  | 指定别名的位置   | `layout({ keyPath: ['#', '@myAlias'] })` |

## priority + keyPath 组合使用

```typescript
const obj = v.object({
  key1: v.pipe(
    v.object({
      test1: v.pipe(
        v.optional(v.string(), 'value1'),
        layout({ keyPath: ['#'], priority: 2 }), // 同时设置位置和优先级
      ),
    }),
  ),
});
```

## 示例

```typescript
import * as v from 'valibot';
import { layout, asVirtualGroup, setAlias } from '@piying/view-angular-core';

// priority 正常顺序（数值越小越靠前）
const obj = v.object({
  k1: v.pipe(v.string(), layout({ priority: 1 })),
  k2: v.pipe(v.string(), layout({ priority: 2 })),
});

// priority 互换
const obj2 = v.object({
  k1: v.pipe(v.string(), layout({ priority: 2 })),
  k2: v.pipe(v.string(), layout({ priority: 1 })),
});

// keyPath 移动
const obj3 = v.object({
  input0: v.pipe(v.string()),
  input1: v.pipe(v.string(), layout({ keyPath: ['#'] })),
});
```

## 注意事项

- `priority` 数值**越小越靠前**（升序排序）
- `keyPath` 移动字段可能使某些 group/array 变为空，此时该容器仍保留但无子级
- `@alias` 需要先通过 `setAlias` 定义别名
- Layout 在 `intersect` / `union` 中最为常用

## 路径查询基础

KeyPath 类型定义、`field.get()` 用法 计算规则等基础知识详见 [路径查询 API](path-querying.md)。

## 下一步

- [API: hideWhen/disableWhen](hide-disable.md) — 动态控制可见性/可用性
- [API: fieldGlobalConfig](global-config.md) — 全局配置优先级

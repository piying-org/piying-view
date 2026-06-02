# 路径查询 — KeyPath 基础

本文介绍 Piying-View 中字段路径查询的基础知识。`field.get()` 接受一个 `KeyPath`，用于定位某个子字段。所有依赖路径查询的 Action（`hideWhen`、`disableWhen`、`layout` 等）都基于此文档所述规则。

> **关键注意**：`field.get()` 可用于查询非表单控件（普通组件），只是返回的配置中没有控件引用。

## 基本用法 — 通过路径获取字段

`field.get(path)` 接受一个 `KeyPath`，返回目标字段：

```typescript
// 父级字段
const parentField = field.get(['..']);
// 子级字段
const nameField = field.get(['name']);

// 嵌套对象字段
const cityField = field.get(['address', 'city']);

// 数组中的元素
const firstTag = field.get(['tags', 0]);
const thirdItem = field.get(['items', 2]);
```

> **使用场景**：在 `hideWhen`、`disableWhen`、`valueChange` 的 `listen` 回调中监听其他字段；在 field 中访问其它字段

## KeyPath 查询表达式速查

当路径数组（KeyPath）的第一个元素为特殊表达式时，用于实现相对定位：

| 表达式     | 含义                             | 示例                                         |
| ---------- | -------------------------------- | -------------------------------------------- |
| `'..'`     | 从父字段开始解析剩余路径         | `['..']` — 当前字段的父字段                  |
|            |                                  | `['..', 'name']` — 父字段下的 `name` 子字段  |
|            |                                  | `['..', '..', 'rootField']` — 从祖父级解析   |
| `'#'`      | 从根字段（root）开始解析剩余路径 | `['#', 'name']` — 根字段下的 `name` 子字段   |
| `'@alias'` | 从别名字段开始解析剩余路径       | `['@mySection']` — 查找 `mySection` 别名字段 |
|            |                                  | `['@mySection', 'child']` — 别名下的子字段   |

### `['aa']` vs `['..', 'aa']` — 同级查询说明

**重要区分**：

| 表达式         | 含义                                                            |
| -------------- | --------------------------------------------------------------- |
| `['aa']`       | **始终**查询当前级别的名为 `aa` 的子级控件                      |
| `['..', 'aa']` | 先跳到父级，再查询父级下的 `aa`（即当前字段所在层级的兄弟字段） |

> `['aa']` 在任何情况下都表示查询当前级别的子级。如果要查询同级（兄弟）字段，必须使用 `['..', 'aa']`。

### 查询表达式的工作原理

每个特殊表达式会将查询起点切换到目标字段，然后递归解析路径的剩余部分：

```typescript
// '...' 示例：从父字段开始解析
field.get(['..']); // → 返回父字段（keyPath.length === level，直接返回）
field.get(['..', 'name']); // → parent.get(['name'])，获取父字段下的 name 子字段
field.get(['..', '..', 'rootField']); // → parent.get(['..', 'rootField']) → grandparent.get(['rootField'])

// '#' 示例：从根字段开始解析
field.get(['#']); // → 返回根字段
field.get(['#', 'name']); // → root.get(['name'])，获取根字段下的 name 子字段

// '@alias' 示例：从别名字段开始解析
field.get(['@mySection']); // → aliasMap.get('mySection')，返回该别名字段
field.get(['@mySection', 'nested']); // → aliasField.get(['nested'])，获取别名下的子字段
```

> **注意**：`'#'` 和 `'@alias'` 都会将查询起点切换到目标字段（root 或别名字段），然后递归解析剩余路径。

### 示例：监听上级字段

```typescript
// 监听父级下的某个字段
field.get(['..', 'parentField']);

// 监听祖父级下的某个字段
field.get(['..', '..', 'rootField']);
```

### 示例：使用别名定位

`@alias` 配合 `setAlias` 使用，将查询指向设置了别名的字段位置：

```typescript
import { setAlias } from '@piying/view-angular-core';

// 设置别名
const schema = v.pipe(v.object({}), setAlias('mySection'));

// 通过 @alias 查询该字段
field.get(['@mySection']);

// 获取该别名下的某个子字段
field.get(['@mySection', 'childField']);
```

### 示例：从根字段定位

`'#'` 将查询起点切换到根字段（root），常用于跨层级访问顶级字段：

```typescript
// 从根字段获取顶层的 'name' 字段
field.get(['#', 'name']);
```

## '@alias' 别名查询机制

### 查询优先级

`field.get(['@aliasName'])` 按以下顺序查找别名字段：

1. **先在当前作用域内查找** — 在同级及子级字段中设置的别名优先匹配
2. **未找到则逐级向上查找** — 如果当前层级没找到，继续向父级作用域查询，直到根级别(一般在创建数组时会生成单独的Map保存)

### 实际示例

```typescript
import { v, setAlias } from '@piying/view-angular-core';

const schema = v.object({
  // 根级别别名 — 在所有子字段中都可查到
  header: v.pipe(v.object({ title: v.string() }), setAlias('header')),

  user: v.object({ name: v.string(), email: v.string() }),

  items: v.array(v.pipe(v.object({ label: v.string() }), setAlias('item'))),
});

// 任意字段中都可以查找到根级别别名
field.get(['@header']); // → 返回 header 字段的配置

// 别名带子路径 — 先查找到别名字段，再以它为起点解析剩余路径
field.get(['@header', 'title']); // → header.get(['title'])
```

### 命名冲突处理

同名别名遵循**就近优先**原则：如果当前作用域及下层已存在同名别名，则不会向上匹配到外层同名的字段。

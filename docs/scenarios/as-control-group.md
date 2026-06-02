# asControl / asVirtualGroup

本文介绍 `asControl()` 和 `asVirtualGroup()` 如何改变 Group/Intersect 类型的默认行为。

## asControl — 将 Group 视为独立控件

### 问题背景

默认情况下，Piying-View 会将 `v.object()`、`v.array()` 等容器类型**展开**为子字段的集合：

```typescript
const schema = v.object({
  address: v.object({
    city: v.string(),
    street: v.string(),
  }),
});
// → address 下的 city 和 street 作为独立字段渲染
```

### 使用 asControl

`asControl()` 让 Group/Array 类型的 Schema **不展开**，而是作为一个独立的控件节点：

```typescript
import * as v from 'valibot';
import { asControl } from '@piying/view-angular-core';

const schema = v.object({
  address: v.pipe(
    v.object({
      city: v.string(),
      street: v.string(),
    }),
    asControl(), // address 作为一个独立控件，不展开子字段
  ),
});
```

此时 `address` 对应一个 `FieldControl` 而非 `FieldGroup`，整个对象作为单个值处理。

### 使用场景

**场景一：将整个嵌套对象传递给自定义组件**

当你的自定义组件需要接收整个嵌套对象（而不是逐个字段）时，使用 `asControl()`：

```typescript
const schema = v.object({
  profile: v.pipe(
    v.object({
      name: v.string(),
      age: v.number(),
    }),
    asControl(), // 作为独立控件
    setComponent('profile-editor'), // 自定义编辑器组件
  ),
});

// ProfileEditorComponent 接收整个 profile 对象
```

**场景二：Union 类型作为单个控件**

```typescript
const schema = v.object({
  value: v.pipe(
    v.union([v.string(), v.number()]),
    asControl(), // 不展开为 logic group
    setComponent('value-input'), // 单一输入组件
  ),
});
```

**场景三：Array 作为单个控件**

```typescript
const schema = v.object({
  items: v.pipe(
    v.array(v.string()),
    asControl(), // 整个数组作为一个值
    setComponent('array-editor'), // 自定义数组编辑器
  ),
});
```

## asVirtualGroup — Intersect 子级作为虚拟 Group

### 问题背景

默认情况下，`v.intersect()` 会被转换为 `FieldLogicGroup`。当需要在 intersect 内部保持 group 语义（而不是逻辑分组）时，使用 `asVirtualGroup()`。

### 使用 asVirtualGroup

```typescript
import * as v from 'valibot';
import { asVirtualGroup } from '@piying/view-angular-core';

const schema = v.intersect([v.object({ name: v.string() }), v.object({ age: v.number() })]);

// 使用 asVirtualGroup：子级作为独立的虚拟 group 处理
const schema2 = v.pipe(v.intersect([v.object({ name: v.string() }), v.object({ age: v.number() })]), asVirtualGroup());
```

## asControl vs asVirtualGroup 对比

| 特性       | `asControl()`                | `asVirtualGroup()` |
| ---------- | ---------------------------- | ------------------ |
| 作用对象   | Group / Array / Union        | Intersect          |
| 默认行为   | 展开为子字段集合             | FieldLogicGroup    |
| 使用后行为 | 作为单个 FieldControl        | 普通的 FieldGroup  |
| 返回类型   | `FieldControl`               | `FieldGroup`       |
| 典型用途   | 将嵌套对象整体传给一个自定义组件 | 修改表单类型       |

## 常见组合

```typescript
import * as v from 'valibot';
import { asControl, asVirtualGroup, layout } from '@piying/view-angular-core';

const schema = v.object({
  // Group 作为独立控件
  profile: v.pipe(v.object({ name: v.string(), age: v.number() }), asControl(), setComponent('profile-card')),

  // Intersect 子级作为虚拟 group
  settings: v.pipe(v.intersect([v.object({ theme: v.picklist(['light', 'dark']) }), v.object({ lang: v.picklist(['zh', 'en']) })]), asVirtualGroup()),

  // 嵌套使用：Intersect + Layout + asVirtualGroup
  content: v.pipe(v.intersect([v.pipe(v.object({}), layout({ priority: 1 })), v.pipe(v.object({}), layout({ priority: 2 }))]), asVirtualGroup()),
});
```

## 下一步

- [动态字段控制](dynamic-fields.md) — hideWhen / disableWhen / valueChange 实战场景
- [API: Layout metadata](../api/layout.md) — keyPath / priority 调整 intersect 布局

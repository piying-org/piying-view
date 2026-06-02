# 复杂 Schema 结构

本文介绍 Piying-View 支持的 Valibot 复杂 Schema 类型及其对应的视图表现。

## Nesting（嵌套对象）

使用 `v.object()` 嵌套定义对象结构：

```typescript
import * as v from 'valibot';

const schema = v.object({
  user: v.object({
    name: v.string(),
    address: v.object({
      city: v.string(),
      street: v.string(),
    }),
  }),
});
```

Piying-View 会自动将 `object` 类型映射到 Group 组件，递归渲染子字段。在 `fieldGlobalConfig.types` 中确保 object 有对应的容器组件：

```typescript
options = {
  fieldGlobalConfig: {
    types: {
      object: { type: PiyingViewGroup }, // Group 容器处理嵌套
    },
  },
};
```

## Array（数组字段）

使用 `v.array()` 定义列表型字段：

```typescript
const schema = v.object({
  tags: v.array(v.string()), // string[]
  scores: v.array(v.number()), // number[]
});
```

Piying-View 将 `array` 映射为 `FieldArray`，使用数组容器组件渲染。确保注册了 array 类型：

```typescript
options = {
  fieldGlobalConfig: {
    types: {
      array: { type: PiyingViewGroup }, // Array 容器处理列表
    },
  },
};
```

## Tuple（元组字段）

使用 `v.tuple()` 定义固定长度和类型的数组：

```typescript
const schema = v.object({
  position: v.tuple([v.number(), v.number()]), // [x: number, y: number]
});
```

Piying-View 将 `tuple` 映射为 `FieldArray`，每个位置对应一个子字段。

## Record（动态对象键）

使用 `v.record()` 定义动态键值对：

```typescript
const schema = v.object({
  metadata: v.record(v.string(), v.string()), // Record<string, string>
  scores: v.record(v.string(), v.number()), // Record<string, number>
});
```

Piying-View 将 `record` 映射为特殊的 Group，键由用户动态添加。详见 [Record Schema 动态对象组](record-dynamic-group.md)。

## Intersect（交叉类型）

使用 `v.intersect()` 合并多个 object：

```typescript
const schema = v.intersect([v.object({ name: v.string() }), v.object({ age: v.number() })]);
// → { name: string, age: number }
```

Piying-View 将 `intersect` 转换为 `FieldLogicGroup`，所有子字段平铺到同一层级。

通过 `layout` 可以调整 `intersect` 中字段的顺序和位置：

```typescript
import { layout } from '@piying/view-angular-core';

const schema = v.intersect([v.pipe(v.object({ name: v.string() }), layout({ priority: 1 })), v.pipe(v.object({ age: v.number() }), layout({ priority: 2 }))]);
```

## Union（联合类型）

使用 `v.union()` 定义多个可选类型：

```typescript
const schema = v.object({
  value: v.union([v.string(), v.number()]), // string | number
});
```

Piying-View 将 union 也转换为 `FieldLogicGroup`，用户可以在不同分支间切换。

## 复杂组合示例

```typescript
import * as v from 'valibot';
import { formConfig, layout } from '@piying/view-angular-core';

const schema = v.object({
  // 基础字段
  name: v.string(),

  // 嵌套对象
  address: v.object({
    city: v.string(),
    details: v.object({
      street: v.string(),
      zipCode: v.string(),
    }),
  }),

  // 数组 + tuple
  positions: v.array(v.tuple([v.number(), v.number()])),

  // Record 动态键值对
  metadata: v.record(v.string(), v.string()),

  // Intersect 交叉类型
  profile: v.intersect([
    v.pipe(
      v.object({ bio: v.string() }),
      layout({ priority: 1 }), // 优先展示
    ),
    v.pipe(v.object({ website: v.string() }), layout({ priority: 2 })),
  ]),

  // Union 联合类型
  identifier: v.union([v.string(), v.number()]),
});
```

## Schema 类型 → FieldControl 映射表

| Valibot Schema                              | FieldControl 类   | 视图表现                   |
| ------------------------------------------- | ----------------- | -------------------------- |
| `v.string()` / `v.number()` / `v.boolean()` | `FieldControl`    | 单个输入控件               |
| `v.object()`                                | `FieldGroup`      | 对象容器（渲染子字段列表） |
| `v.array()`                                 | `FieldArray`      | 数组容器（可增删项）       |
| `v.tuple()`                                 | `FieldArray`      | 固定长度数组               |
| `v.record()`                                | `FieldGroup`      | 动态键值对容器             |
| `v.intersect()`                             | `FieldLogicGroup` | 逻辑分组（字段合并）       |
| `v.union()`                                 | `FieldLogicGroup` | 逻辑分组（分支切换）       |

## 下一步

- [asControl / asVirtualGroup](as-control-group.md) — Group 视为独立控件、Intersect 子级作为虚拟 group
- [动态字段控制](dynamic-fields.md) — hideWhen / disableWhen / valueChange 实战场景
- [API: Layout metadata](../api/layout.md) — keyPath / priority 调整布局

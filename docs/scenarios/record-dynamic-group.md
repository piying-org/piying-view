# Record Schema 动态对象组

本文介绍 Piying-View 如何处理 `v.record()` 类型的动态键值对表单。

## Record 基本用法

`v.record(KeySchema, ValueSchema)` 定义一个键为字符串、值为指定类型的对象：

```typescript
import * as v from 'valibot';

const schema = v.object({
  metadata: v.record(v.string(), v.string()), // Record<string, string>
  scores: v.record(v.string(), v.number()), // Record<string, number>
});
```

Piying-View 将 `record` 映射为特殊的 Group，键由用户动态添加。在 `fieldGlobalConfig.types` 中确保 record 有对应的容器组件：

```typescript
options = {
  fieldGlobalConfig: {
    types: {
      record: { type: PiyingViewGroup }, // 使用 Group 容器处理动态键
    },
  },
};
```

## Record 作为动态表单组

在表单场景中，Record 常用于：

### 场景一：标签/元数据编辑

```typescript
const schema = v.object({
  labels: v.record(v.string(), v.string()), // key: label名称, value: label值
});
```

用户可以动态添加键值对，如：`{ "department": "研发部", "level": "P7" }`。

### 场景二：配置映射

```typescript
const schema = v.object({
  config: v.record(v.string(), v.union([v.string(), v.number(), v.boolean()])), // 灵活的配置键值对
});
```

### 场景三：多语言翻译

```typescript
const schema = v.object({
  translations: v.record(v.picklist(['zh', 'en', 'ja', 'ko']), v.string()), // 语言代码 → 翻译文本
});
```

## GroupKeySchema / GroupValueSchema

`FieldFormConfig` 提供 `groupKeySchema` 和 `groupValueSchema`，用于约束 Record 的键和值类型：

```typescript
import * as v from 'valibot';
import { formConfig } from '@piying/view-angular-core';

const schema = v.pipe(
  v.record(v.string(), v.string()),
  formConfig({
    groupKeySchema: v.picklist(['name', 'email', 'phone']), // 键只能从预设选项选
    groupValueSchema: v.pipe(v.string(), v.minLength(1)), // 值必须非空
  }),
);
```

> **注意**：`groupKeySchema` 和 `groupValueSchema` 用于约束动态添加的键值对，而非替换原有的 record schema。

## Record 验证行为

Record 字段的验证遵循标准 Group 规则：

```typescript
const schema = v.object({
  metadata: v.record(v.string(), v.pipe(v.number(), v.minValue(0))),
});
```

当 Record 中某个值不满足验证条件时，该键对应的子字段标记为错误，但不影响其他键的值。

## 完整示例

```typescript
import * as v from 'valibot';
import { formConfig } from '@piying/view-angular-core';

const schema = v.object({
  // 基础 Record：动态字符串键值对
  metadata: v.record(v.string(), v.string()),

  // 带约束的 Record：键只能从预设选项选择
  settings: v.pipe(
    v.record(v.string(), v.boolean()),
    formConfig({
      groupKeySchema: v.picklist(['darkMode', 'notifications', 'autoSave']),
    }),
  ),

  // Record + Array 嵌套
  teamMembers: v.record(
    v.string(),
    v.object({
      name: v.string(),
      role: v.string(),
    }),
  ),
});
```

## 下一步

- [综合示例：完整业务表单](complete-example.md) — 结合所有知识点的实战示例
- [API: Layout metadata](../api/layout.md) — keyPath / priority 调整布局
- [API: Wrappers](../api/wrappers.md) — Wrapper 包装器设置

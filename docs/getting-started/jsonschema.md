# JSON Schema 支持

> 🧪 实验性功能

> JSON Schema 支持本质上是将其转换为 Valibot Schema，然后由 Piying-View 正常解析。

## 概述

Piying-View 提供 `jsonSchemaToValibot` 函数，将 [JSON Schema](https://json-schema.org/)（支持 Draft-04、Draft-07、Draft 2020-12）转换为 Valibot Schema：

```typescript
import { jsonSchemaToValibot } from '@piying/view-angular-core/adapter';

const valibotSchema = jsonSchemaToValibot(jsonSchema);
// 转换后即可与传统的 Piying-View 使用方式一致
```

## 支持的类型映射

### 基础类型

| JSON Schema 类型 | Valibot 对应  |
| ---------------- | ------------- |
| `string`         | `v.string()`  |
| `number`         | `v.number()`  |
| `integer`        | `v.integer()` |
| `boolean`        | `v.boolean()` |
| `null`           | `v.null()`    |
| `any` / 无 type  | `v.any()`     |

### 约束条件

| JSON Schema                   | Valibot 转换                         |
| ----------------------------- | ------------------------------------ |
| `type: "string"`, `minLength` | `v.pipe(v.string(), v.minLength(N))` |
| `type: "number"`, `minimum`   | `v.pipe(v.number(), v.minValue(N))`  |
| `type: "integer"`, `minimum`  | `v.pipe(v.integer(), v.minValue(N))` |
| `enum: ["a", "b"]`            | `v.picklist(["a", "b"])`             |
| `const: 1`                    | `v.literal(1)`                       |

### 对象类型

| JSON Schema 结构                     | Valibot 对应                                          |
| ------------------------------------ | ----------------------------------------------------- |
| `properties` + `required`            | `v.object()`（必填字段自动标记）                      |
| `properties`（无 required）          | `v.loose_object()`                                    |
| `prefixItems`                        | `v.tuple()` / `v.loose_tuple()` / `v.tupleWithRest()` |
| 无 properties + additionalProperties | `v.record()`                                          |

### 数组类型

| JSON Schema 结构                | Valibot 对应                      |
| ------------------------------- | --------------------------------- |
| `items`（非数组）               | `v.array(itemsSchema)`            |
| `items`（数组，含 uniqueItems） | `v.array(itemsSchema)` + 去重约束 |

### 逻辑组合

| JSON Schema    | Valibot 对应              |
| -------------- | ------------------------- |
| `oneOf`        | `v.oneOf()` / `v.union()` |
| `anyOf`        | `v.anyOf()`               |
| `allOf`        | `v.intersect()`           |
| `if/then/else` | `v.pipe()` + 条件逻辑     |

## 限制说明

### 死结检测

传入的数据不可存在死结（某些字段在验证过程中始终失败则为死结）：

```json
{
  "propertyNames": false,
  "properties": { "a": { "type": "string" } },
  "required": ["a"]
}
```

### 优先级规则

`const` / `enum` 出现时优先转换，忽略其他验证：

```json
{
  // ✅ enum 优先
  "enum": [1, 2, 3],
  // 🚫 type 被忽略
  "type": "string"
}
```

### 互斥模式

一个 schema 中只允许出现 `allOf` / `oneOf` / `anyOf` / `if/then/else` **其中之一**（`not` 不在此限制中）：

```json
// ❌ 不允许同时使用多个组合关键字
{ "allOf": [], "oneOf": [] }

// ✅ 只使用一个
{ "allOf": [] }
```

### 嵌套限制

`allOf` / `oneOf` / `anyOf` / `if/then/else` 子模式内**不支持**嵌套子模式：

```json
{
  "allOf": [
    {
      // ❌ anyOf 不允许嵌套在 allOf 内
      "anyOf": []
    }
  ]
}
```

### 引用限制

`$ref` **仅支持单文件**，不支持远程引用。

## 分组类型组件映射

Piying-View 根据 JSON Schema 结构自动选择合适的组件渲染策略：

### oneOf-condition / anyOf-condition

**适用场景**：子模式下存在相同字段时。

```json
{
  "oneOf": [
    {
      "properties": {
        "cond1": { "const": 1 },
        "value1": { "type": "string" }
      },
      "required": ["cond1"]
    },
    {
      "properties": {
        "cond1": { "const": 2 },
        "value2": { "type": "string" }
      },
      "required": ["cond1"]
    }
  ]
}
```

### oneOf-select / anyOf-select

**适用场景**：需要组件中实现手动选择一个或多个子条件。

```json
{
  "oneOf": [
    {
      "title": "item1",
      "properties": {
        "value1": { "type": "string" }
      }
    },
    {
      "title": "item2",
      "properties": {
        "value2": { "type": "string" }
      }
    }
  ]
}
```

### object 变体

| JSON Schema                 | 映射                                           |
| --------------------------- | ---------------------------------------------- |
| `properties` + `required`   | `v.object()`（严格模式）                       |
| `properties`（无 required） | `v.loose_object()`（宽松模式，保留未定义键值） |
| 带 rest 的 object           | `objectWithRest` / `intersect`                 |

### tuple 变体

| JSON Schema                             | 映射                                  |
| --------------------------------------- | ------------------------------------- |
| `prefixItems` + 无 additionalItems      | `v.tuple()`（固定长度，超出自动过滤） |
| `prefixItems` + `additionalItems: true` | `v.loose_tuple()`（保留超出部分）     |
| 部分固定 + rest                         | `v.tupleWithRest()`                   |

### intersect / union

可视为普通的 object 类型，主要用于验证场景。

## 选择类型组件

以下类型会自动传入 `options` 输入属性到对应组件，组件需要实现选项渲染：

| JSON Schema                                       | 说明                |
| ------------------------------------------------- | ------------------- |
| `"enum": ["1", "2"]`                              | 单选（picklist）    |
| `"items": { "enum": [...] }`                      | 多选（multiselect） |
| `"items": { "enum": [...] }, "uniqueItems": true` | 可重复选择的多选    |
| `"type": "number", "minimum": N`                  | 数值输入            |

## 自定义 Actions

### 内置 Actions

在 JSON Schema 中定义 `actions` 字段即可使用内置的 Piying-View Actions：

```json
{
  "type": "string",
  "title": "Select 4: Radio button",
  "enum": ["Option 1", "Option 2", "Option 3"],
  "actions": [
    {
      "name": "setComponent",
      "params": ["radio"]
    }
  ]
}
```

### 自定义 Actions

如果 JSON Schema 中包含其他自定义的 actions，则需要注册：

```json
{
  "type": "string",
  "actions": [
    {
      "name": "testTitle",
      "params": []
    }
  ]
}
```

## 完整示例

```typescript
import * as v from 'valibot';
import { jsonSchemaToValibot } from '@piying/view-angular-core/adapter';
import { PiyingView, BaseControl, PiyingViewGroup } from '@piying/view-angular';

// JSON Schema 定义
const jsonSchema = {
  type: 'object',
  properties: {
    username: { type: 'string', minLength: 3, title: '用户名' },
    age: { type: 'integer', minimum: 0, maximum: 150, title: '年龄' },
    role: { type: 'string', enum: ['admin', 'user'], title: '角色' },
    address: {
      type: 'object',
      properties: {
        city: { type: 'string' },
        street: { type: 'string' },
      },
      required: ['city'],
    },
  },
  required: ['username', 'age'],
};

// 转换为 Valibot Schema
const schema = jsonSchemaToValibot(jsonSchema);

// 后续使用方式与传统 Piying-View 完全一致
```

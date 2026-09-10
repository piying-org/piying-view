---
title: "setComponent — 组件设置"
---



`setComponent` 指定字段渲染时使用的组件。

## 类型签名

```typescript
function setComponent<T, D>(type: D): D extends string ? DefineTypeAction<T> : RawConfigAction<'viewRawConfig', T, AnyCoreSchemaHandle>;
```

## 用法一：字符串引用（推荐）

通过 `fieldGlobalConfig.types` 中的 key 引用已注册的组件类型：

```typescript
import * as v from 'valibot';
import { setComponent } from '@piying/view-angular-core';

const schema = v.object({
  name: v.pipe(
    v.string(),
    setComponent('my-input'), // 引用 fieldGlobalConfig.types['my-input']
  ),
});
```

对应的 options 配置：

```typescript
options = {
  fieldGlobalConfig: {
    types: {
      'my-input': { type: MyInputComponent },
    },
  },
};
```

### 与 fieldGlobalConfig.types 配合

`setComponent('key')` 指定的 key 必须存在于 `fieldGlobalConfig.types` 中：

```typescript
const schema = v.object({
  field1: v.pipe(v.string(), setComponent('custom-type')),
});

options = {
  fieldGlobalConfig: {
    types: {
      'custom-type': {
        type: CustomComponent,
        actions: [v.title('默认标题')], // 此类型所有字段的默认 Actions
      },
    },
  },
};
```

## 用法二：直接传组件类

直接将 Angular 组件构造函数传入，不依赖 `fieldGlobalConfig.types`：

```typescript
const schema = v.object({
  name: v.pipe(
    v.string(),
    setComponent(MyInputComponent), // 直接引用组件类
  ),
});
```

此时无需在 `fieldGlobalConfig.types` 中注册。

## 与内置类型名的关系

如果字段没有通过 `setComponent()` 显式指定类型，Piying-View 会使用 Valibot Schema 的原始类型名作为默认 key：

| Schema 类型     | 默认 key            |
| --------------- | ------------------- |
| `v.string()`    | `'string'`          |
| `v.number()`    | `'number'`          |
| `v.boolean()`   | `'boolean'`         |
| `v.object()`    | `'object'`          |
| `v.array()`     | `'array'`           |
| `v.intersect()` | `'intersect'`       |
| `v.record()`    | `'record'`          |

> **注意**：`'intersect-group'` 不是 `v.intersect()` 的默认 key。只有当 `v.intersect()` 配合 `asVirtualGroup()` 使用时，类型才会变为 `'intersect-group'`（见 [asControl / asVirtualGroup](zh/scenarios/as-control-group/)）。

因此以下代码中，`name` 字段会查找 `types['string']`：

```typescript
const schema = v.object({
  name: v.string(), // → types['string']
});

options = {
  fieldGlobalConfig: {
    types: {
      string: { type: TextInputComponent },
    },
  },
};
```

## 注意事项

- 字符串引用方式要求 key 必须存在于 `fieldGlobalConfig.types`，否则组件无法渲染
- 直接传组件类方式更灵活，但失去了全局统一管理的能力
- `setComponent` 可以与其他 Actions（`inputs`、`outputs`、`attributes` 等）配合使用

## 下一步

- [API: inputs](zh/api/inputs/) — 组件输入属性
- [API: outputs](zh/api/outputs/) — 组件输出事件
- [API: events](zh/api/events/) — DOM 事件处理
- [API: attributes](zh/api/attributes/) — HTML Attributes 设置
- [API: CSS class](zh/api/css-class/) — CSS Class 设置
- [API: global-config](zh/api/global-config/) — 全局类型配置优先级体系

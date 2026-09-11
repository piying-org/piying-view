---
title: "rawConfig — 直接读写配置对象"
---

```typescript
import * as v from 'valibot';
import { rawConfig } from '@piying/view-angular-core';

const schema = v.pipe(
  v.string(),
  rawConfig((field) => {
    field.attributes = { ...field.attributes, placeholder: '请输入' };
  }),
);
```

## 类型签名

```typescript
rawConfig<T>(
  value: (field: AnyCoreSchemaHandle, context?: any) => void,
  workOn?: 'afterSchemaType',
);
```

## field 常用属性

| 属性             | 说明                            |
| ---------------- | ------------------------------- |
| `inputs`         | 传给组件的 inputs               |
| `attributes`     | 宿主元素属性                    |
| `props`          | 组件配置（label、title 等）     |
| `events`         | 事件处理                        |
| `outputs`        | 输出                            |
| `slots`          | 插槽                            |
| `models`         | 关联模型                        |
| `wrappers`       | 包装器列表                      |
| `formConfig`     | 表单配置（禁用 / 校验 / 值转换）|
| `renderConfig`   | 渲染配置（hidden）              |

## 与现成 Action 的关系

`actions.inputs.set`、`actions.attributes.patch` 等 Action 已经覆盖了大部分配置场景，并且有类型约束。能用现成 Action 就不要写 `rawConfig`。

同一条 pipe 里，`rawConfig` 与 `formConfig` 等作用相同，按书写顺序生效。

## 下一步

- [表单配置 formConfig](zh/api/form-config/) — 禁用 / 校验 / 值转换
- [渲染配置 renderConfig](zh/api/render-config/) — 是否渲染字段
- [inputs](zh/api/inputs/) / [attributes](zh/api/attributes/) — 现成的配置 Action

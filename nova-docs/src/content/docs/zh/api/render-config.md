---
title: "renderConfig — 渲染配置"
---

```typescript
import * as v from 'valibot';
import { renderConfig } from '@piying/view-angular-core';

const schema = v.object({
  field1: v.pipe(v.string(), renderConfig({ hidden: true })),
  field2: v.pipe(v.string(), renderConfig({ hidden: false })),
});
```

## 类型签名

```typescript
interface FieldRenderConfig {
  hidden?: boolean;
}
```

`hidden: true` 时字段组件不渲染。字段仍然参与表单，值保留在模型里。

## 与 hideWhen 的区别

|            | `renderConfig({ hidden })` | `hideWhen`                       |
| ---------- | -------------------------- | -------------------------------- |
| 隐藏状态   | 静态，写死在 schema 里     | 跟随其他字段的值动态变化         |
| 适用       | 内部字段、始终不展示的字段 | 联动隐藏                         |

动态隐藏见 [`hideWhen`](zh/api/hide-disable/)。

## 下一步

- [表单配置 formConfig](zh/api/form-config/) — 禁用 / 校验 / 值转换
- [隐藏与禁用](zh/api/hide-disable/) — hideWhen / disableWhen

# CSS class — 样式设置

本文介绍如何通过 `actions.class` 设置字段的 CSS class。

## topClass — 顶部容器的 CSS class

在字段最外层容器上添加 class：

```typescript
import { actions } from '@piying/view-angular-core';

const schema = v.pipe(
  v.string(),
  actions.class.top('form-field required'),
);
```

## bottomClass — 底部区域的 CSS class

在字段底部区域（错误信息、后缀等）添加 class：

```typescript
const schema = v.pipe(
  v.string(),
  actions.class.bottom('error-message text-danger'),
);
```

## 完整示例

```typescript
import * as v from 'valibot';
import { actions, setComponent } from '@piying/view-angular-core';

const schema = v.object({
  username: v.pipe(
    v.string(),
    setComponent('input'),
    
    // 顶部容器 class
    actions.class.top('form-field'),
    // 底部区域 class
    actions.class.bottom('help-text'),
  ),

  email: v.pipe(
    v.string(),
    setComponent('input'),
    actions.class.top('email-field required'),
    actions.class.bottom('error-message text-danger'),
  ),
});
```

## 下一步

- [API: attributes](attributes.md) — HTML Attributes 设置
- [API: layout](layout.md) — keyPath / priority 调整布局
- [API: hideWhen/disableWhen/valueChange](hide-disable.md) — 动态控制

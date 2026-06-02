# attributes / CSS class — HTML 属性与样式设置

本文介绍如何通过 Actions 设置字段的 HTML attributes 和 CSS class。

## attributes — HTML 属性设置

### actions.attributes.set — 设置属性值

将指定对象设置为字段的 HTML attributes：

```typescript
import { actions } from '@piying/view-angular-core';

const schema = v.pipe(
  v.string(),
  actions.attributes.set({
    'data-testid': 'username-field',
    'aria-label': '请输入用户名',
    autocomplete: 'username',
  }),
);
```

### actions.attributes.patch — 合并属性值

在已有属性上合并新的键值对：

```typescript
const schema = v.pipe(
  v.string(),
  actions.attributes.set({ 'data-testid': 'name' }),
  actions.attributes.patch({ readonly: true }),
);

// 最终 attributes = { 'data-testid': 'name', readonly: true }
```

### actions.attributes.remove — 移除属性键

```typescript
const schema = v.pipe(
  v.string(),
  actions.attributes.set({ 'data-testid': 'name', autocomplete: 'on' }),
  actions.attributes.remove(['autocomplete']),
);

// 最终 attributes = { 'data-testid': 'name' }
```

### actions.attributes.patchAsync — 异步设置属性

通过字段引用动态创建异步属性值：

```typescript
const schema = v.pipe(
  v.string(),
  actions.attributes.patchAsync({
    'data-value': (field) => field.form.control?.value ?? '',
  }),
);
```

## classAction — CSS Class 设置

通过 `actions.class` 设置字段的 CSS class。

### topClass — 顶部容器的 CSS class

在字段最外层容器上添加 class：

```typescript
import { actions } from '@piying/view-angular-core';

const schema = v.pipe(
  v.string(),
  actions.class.top('form-field required'),
);
```

### bottomClass — 底部区域（error/suffix）的 CSS class

在字段底部区域（错误信息、后缀等）添加 class：

```typescript
const schema = v.pipe(
  v.string(),
  actions.class.bottom('error-message text-danger'),
);
```

## attributes vs inputs 的区别

| 特性 | `inputs` | `attributes` |
|------|---------|-------------|
| 作用目标 | 组件的 `@Input()` 属性 | HTML 原生 attribute |
| 用法 | `actions.inputs.set({ placeholder: '...' })` | `actions.attributes.set({ 'data-testid': '...' })` |
| 绑定方式 | Angular 属性绑定 `[inputName]` | HTML 属性直接设置 |
| 适用场景 | 组件间数据传递 | DOM 属性、ARIA 标签、自定义 data-* |

## 完整示例

```typescript
import * as v from 'valibot';
import { actions, setComponent } from '@piying/view-angular-core';

const schema = v.object({
  username: v.pipe(
    v.string(),
    setComponent('input'),
    
    // 组件输入属性
    actions.inputs.set({
      label: '用户名',
      placeholder: '请输入 2-20 个字符',
    }),

    // HTML attributes
    actions.attributes.set({
      'data-testid': 'username-input',
      'aria-required': 'true',
      autocomplete: 'username',
    }),

    // CSS class
    actions.class.top('form-field'),
    actions.class.bottom('help-text'),
  ),

  email: v.pipe(
    v.string(),
    setComponent('input'),
    actions.inputs.set({ type: 'email' }),
    actions.attributes.set({
      'aria-label': '邮箱地址',
    }),
  ),
});
```

## 下一步

- [API: layout](layout.md) — keyPath / priority 调整布局
- [API: hideWhen/disableWhen/valueChange](hide-disable.md) — 动态控制
- [API: wrappers](wrappers.md) — Wrapper 包装器设置

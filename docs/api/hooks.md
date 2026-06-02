# hooks — Hook 管理

本文介绍 Actions 中 Hooks 的管理方法（merge / patch / remove / set）。

## actions.hooks.merge — 合并 Hooks

多个 `actions.hooks.merge` 的回调依次执行：

```typescript
import { actions } from '@piying/view-angular-core';

const schema = v.pipe(
  v.string(),
  actions.hooks.merge({
    fieldResolved: (field) => {
      console.log('hook 1');
    },
  }),
  actions.hooks.merge({
    fieldResolved: (field) => {
      console.log('hook 2');
    },
  }),
);

// hook 1 先执行，hook 2 后执行 ✅
```

## actions.hooks.patch — 替换 Hook（覆盖）

`actions.hooks.patch` 会**覆盖**之前注册的同名 Hook：

```typescript
import { actions } from '@piying/view-angular-core';

const schema = v.pipe(
  v.string(),
  actions.hooks.patch({
    fieldResolved: (field) => {
      console.log('hook 1');
    }, // ❌ 不执行
  }),
  actions.hooks.patch({
    fieldResolved: (field) => {
      console.log('hook 2');
    }, // ✅ 只执行这个
  }),
);
```

## actions.hooks.remove — 移除 Hooks

通过键名移除特定 Hook：

```typescript
import { actions } from '@piying/view-angular-core';

const schema = v.pipe(
  v.string(),
  actions.hooks.merge({
    fieldResolved: (field) => {
      console.log('this will not run');
    },
  }),
  actions.hooks.remove(['fieldResolved']), // 移除 fieldResolved Hook
);

// 无任何输出 ✅
```

## actions.hooks.set — 设置 Hooks（替代 API）

与 `actions.hooks.merge` 同功能的便捷方法。

## 下一步

- [API: props](props.md) — 通用属性配置
- [API: providers](providers.md) — 注入业务服务

---
title: "hooks — Hook 管理"
---



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

## actions.hooks.set — 设置 Hooks（覆盖）

`actions.hooks.set` 会**整体替换**整个 hooks 配置对象，与 `merge`（依次执行）不同：

```typescript
import { actions } from '@piying/view-angular-core';

const schema = v.pipe(
  v.string(),
  actions.hooks.merge({
    fieldResolved: (field) => {
      console.log('hook 1');
    },
  }),
  actions.hooks.set({
    fieldResolved: (field) => {
      console.log('hook 2');
    },
  }),
);

// 只有 hook 2 执行 —— set 会覆盖之前所有已注册的 hooks
```

> **区别**：`merge` 链式叠加多个回调；`set` 直接替换整个 hooks 对象；`patch` 合并同名键覆盖。

## 下一步

- [API: props](api/props/) — 通用属性配置
- [API: providers](api/providers/) — 注入业务服务

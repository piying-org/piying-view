# inputs — 组件输入属性设置

本文介绍如何通过 Actions 为字段组件设置输入属性（inputs）。

## actions.inputs.set — 设置输入值

将指定的输入值设置为给定对象（覆盖已有值）：

```typescript
import { actions } from '@piying/view-angular-core';

const schema = v.pipe(
  v.string(),
  actions.inputs.set({
    placeholder: '请输入名称',
    maxLength: 50,
  }),
);
```

## actions.inputs.patch — 合并输入值

在已有输入值上合并新的键值对：

```typescript
const schema = v.pipe(
  v.string(),
  actions.inputs.set({ placeholder: '请输入' }),
  actions.inputs.patch({ maxLength: 50 }),
);

// 最终 inputs = { placeholder: '请输入', maxLength: 50 }
```

## actions.inputs.remove — 移除输入键

```typescript
const schema = v.pipe(
  v.string(),
  actions.inputs.set({ placeholder: '请输入', maxLength: 50 }),
  actions.inputs.remove(['placeholder']),
);

// 最终 inputs = { maxLength: 50 }
```

## 完整验证示例

### Inputs 操作链

```typescript
import { actions } from '@piying/view-angular-core';

const obj = v.pipe(
  v.string(),
  actions.inputs.set({ placeholder: '请输入', maxLength: 50 }),
  actions.inputs.patch({ disabled: false }),
  actions.inputs.remove(['placeholder']),
  setComponent('my-input'),
);

const resolved = createBuilder(obj);
expect(resolved.inputs()).toEqual({ maxLength: 50, disabled: false });
```

## 下一步

- [API: outputs](outputs.md) — 组件输出事件设置
- [API: attributes](attributes.md) — HTML Attributes 设置
- [API: Wrappers](wrappers.md) — Wrapper 包装器完整指南

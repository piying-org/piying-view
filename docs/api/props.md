# props — 通用属性

本文介绍 Props 和 Actions 的 set / patch / mapAsync 方法。

## actions.props.set — 设置 Props

```typescript
import { actions } from '@piying/view-angular-core';

const schema = v.pipe(v.string(), actions.props.set({ customKey: 'customValue', theme: 'dark' }));
```

## actions.props.patch — 合并 Props

```typescript
const schema = v.pipe(v.string(), actions.props.patch({ dataId: '123' }));
// props = { customKey: 'customValue', theme: 'dark', dataId: '123' }
```

## actions.props.mapAsync — 动态映射 Props

```typescript
const schema = v.pipe(
  v.string(),
  actions.props.patch({ value: '1' }),
  actions.inputs.mapAsync((field) => {
    return (value) => ({
      ...value,
      content: field.props()['value'],
    });
  }),
);
```

## Props 的使用

Props 是配置中的通用属性键，可以在当前组件和包装器中使用。设计上来讲 `props` 可以完成所有工作（只要定义得当），但为了更好的语义，Piying-View 将属性分为多种类型（Attributes / Events / Inputs / Outputs / Props）。实际开发中可按需选择。

组件通过 `field.props()` 获取 props 值。在 Angular 中可通过注入 `PI_VIEW_FIELD_TOKEN` 后访问 `field.props()`。

## 下一步

- [API: providers](providers.md) — 注入业务服务
- [API: field-config](field-config.md) — disabled/emptyValue/deletionMode 等配置详解

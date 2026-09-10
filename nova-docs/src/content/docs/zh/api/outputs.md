---
title: "outputs — 组件输出事件设置"
---



本文介绍如何通过 Actions 为字段组件设置输出事件（outputs）。

## actions.outputs.set — 设置事件处理器

```typescript
const schema = v.pipe(
  v.string(),
  actions.outputs.set({
    change: (value: any) => console.log('change:', value),
  }),
);
```

## actions.outputs.patch — 合并事件处理器

```typescript
const schema = v.pipe(
  v.string(),
  actions.outputs.set({ change: handleChange }),
  actions.outputs.patch({ blur: handleBlur }),
);
```

## actions.outputs.remove — 移除事件处理器

```typescript
const schema = v.pipe(
  v.string(),
  actions.outputs.set({ change: handleChange, blur: handleBlur }),
  actions.outputs.remove(['change']),
);

// 最终 outputs = { blur: handleBlur }
```

## actions.outputs.patchAsync — 异步设置事件处理器

通过字段引用动态创建事件处理器：

```typescript
const schema = v.pipe(
  v.string(),
  actions.outputs.patchAsync({
    change: (field) => (value: any) => {
      console.log('field:', field);
      console.log('value:', value);
    },
  }),
);
```

## actions.outputs.merge — 叠加事件处理器

与 `patch` 的「覆盖同名键」不同，`merge` 会**叠加**：同一键的新旧处理器都会执行（先旧后新）：

```typescript
const schema = v.pipe(
  v.string(),
  actions.outputs.set({ change: handleChange }),
  actions.outputs.merge({ change: handleChange2 }), // change 触发时 handleChange 先执行，再执行 handleChange2
);
```

## actions.outputs.mergeAsync — 异步叠加事件处理器

柯里化形式 `(field) => (...args) => void`，在所有字段解析完成后基于 `field` 动态创建处理器并叠加：

```typescript
const schema = v.pipe(
  v.string(),
  actions.outputs.mergeAsync({
    change: (field) => (value: any) => {
      console.log('field:', field, 'value:', value);
    },
  }),
);
```

## actions.outputs.mapAsync — 动态映射事件处理器

接收 `field`，返回一个转换函数，对已有的全部 outputs 进行映射变换：

```typescript
const schema = v.pipe(
  v.string(),
  actions.outputs.set({ change: handleChange }),
  actions.outputs.mapAsync((field) => (outputs) => ({
    ...outputs,
    change: (value: any) => {
      // 包一层逻辑
      outputs.change?.(value);
    },
  })),
);
```

## 完整验证示例

> 以下示例节选自单元测试（`createBuilder` 为测试内部工具，非公开 API）。

### Outputs 操作链

```typescript
let fn1CallCount = 0;
const fn = (value: any) => { fn1CallCount++; };
const fn2 = (value: any) => { /* ... */ };

const obj = v.pipe(
  v.string(),
  actions.outputs.set({ change: fn }),
  actions.outputs.patch({ blur: fn2 }),
  actions.outputs.remove(['change']),
  setComponent('mock-input'),
);

const resolved = createBuilder(obj);
expect(Object.keys(resolved.outputs())).toEqual(['blur']);
```

## 下一步

- [API: events](zh/api/events/) — DOM 事件处理
- [API: inputs](zh/api/inputs/) — 组件输入属性设置
- [API: Wrappers](zh/api/wrappers/) — Wrapper 包装器完整指南

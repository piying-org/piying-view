# outputs — 组件输出事件设置

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

## 完整验证示例

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

const resolved = createBuilder(resolved.outputs());
expect(Object.keys(resolved.outputs())).toEqual(['blur']);
```

## 下一步

- [API: events](events.md) — DOM 事件处理
- [API: inputs](inputs.md) — 组件输入属性设置
- [API: Wrappers](wrappers.md) — Wrapper 包装器完整指南

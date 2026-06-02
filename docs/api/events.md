# events — DOM 事件处理

通过 `actions.events.patchAsync` 绑定原生 DOM 事件：

```typescript
const schema = v.pipe(
  v.string(),
  actions.events.patchAsync({
    click: (event: Event) => {
      console.log('clicked', event);
    },
    keydown: (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        // 处理回车键
      }
    },
  }),
);
```

## 下一步

- [API: inputs](inputs.md) — 组件输入属性设置
- [API: outputs](outputs.md) — 组件输出事件设置
- [API: Wrappers](wrappers.md) — Wrapper 包装器完整指南

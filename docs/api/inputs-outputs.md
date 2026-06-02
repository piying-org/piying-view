# inputs / outputs / events — 组件输入输出设置

本文介绍如何通过 Actions 为字段组件设置输入属性（inputs）、输出事件（outputs）和 DOM 事件（events）。

## inputs — 设置组件输入属性

### actions.inputs.set — 设置输入值

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

### actions.inputs.patch — 合并输入值

在已有输入值上合并新的键值对：

```typescript
const schema = v.pipe(
  v.string(),
  actions.inputs.set({ placeholder: '请输入' }),
  actions.inputs.patch({ maxLength: 50 }),
);

// 最终 inputs = { placeholder: '请输入', maxLength: 50 }
```

### actions.inputs.remove — 移除输入键

```typescript
const schema = v.pipe(
  v.string(),
  actions.inputs.set({ placeholder: '请输入', maxLength: 50 }),
  actions.inputs.remove(['placeholder']),
);

// 最终 inputs = { maxLength: 50 }
```

## outputs — 设置组件输出事件

### actions.outputs.set — 设置事件处理器

```typescript
const schema = v.pipe(
  v.string(),
  actions.outputs.set({
    change: (value: any) => console.log('change:', value),
  }),
);
```

### actions.outputs.patch — 合并事件处理器

```typescript
const schema = v.pipe(
  v.string(),
  actions.outputs.set({ change: handleChange }),
  actions.outputs.patch({ blur: handleBlur }),
);
```

### actions.outputs.remove — 移除事件处理器

```typescript
const schema = v.pipe(
  v.string(),
  actions.outputs.set({ change: handleChange, blur: handleBlur }),
  actions.outputs.remove(['change']),
);

// 最终 outputs = { blur: handleBlur }
```

### actions.outputs.patchAsync — 异步设置事件处理器

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

## events — DOM 事件处理

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

## actions.wrappers — Wrapper 包装器设置

Wrapper 的 Actions（set/patch/remove/patchAsync）详见 [Wrappers API](wrappers.md)。此处仅列出简要用法：

```typescript
// 字符串引用
actions.wrappers.set(['card', 'fieldset']);

// 对象格式，指定 inputs
actions.wrappers.set([{ type: 'card', inputs: { title: '卡片标题' } }]);

// patchAsync / remove
actions.wrappers.patchAsync('w3');
actions.wrappers.remove(['w2']);
```

## hooks — Hook 管理

### actions.hooks.merge — 合并 Hooks

多个 `actions.hooks.merge` 的回调依次执行：

```typescript
import { actions } from '@piying/view-angular-core';

const schema = v.pipe(
  v.string(),
  actions.hooks.merge({
    fieldResolved: (field) => { console.log('hook 1'); },
  }),
  actions.hooks.merge({
    fieldResolved: (field) => { console.log('hook 2'); },
  }),
);

// hook 1 先执行，hook 2 后执行 ✅
```

### actions.hooks.patch — 替换 Hook（覆盖）

`actions.hooks.patch` 会**覆盖**之前注册的同名 Hook：

```typescript
import { actions } from '@piying/view-angular-core';

const schema = v.pipe(
  v.string(),
  actions.hooks.patch({
    fieldResolved: (field) => { console.log('hook 1'); },  // ❌ 不执行
  }),
  actions.hooks.patch({
    fieldResolved: (field) => { console.log('hook 2'); },  // ✅ 只执行这个
  }),
);
```

### actions.hooks.remove — 移除 Hooks

通过键名移除特定 Hook：

```typescript
import { actions } from '@piying/view-angular-core';

const schema = v.pipe(
  v.string(),
  actions.hooks.merge({
    fieldResolved: (field) => { console.log('this will not run'); },
  }),
  actions.hooks.remove(['fieldResolved']),   // 移除 fieldResolved Hook
);

// 无任何输出 ✅
```

### actions.hooks.set — 设置 Hooks（替代 API）

与 `actions.hooks.merge` 同功能的便捷方法。

## props — 通用属性

`props` 是配置中的通用属性键，可以在当前组件和包装器中使用。设计上来讲 `props` 可以完成所有工作（只要定义得当），但为了更好的语义，Piying-View 将属性分为多种类型（Attributes / Events / Inputs / Outputs / Props）。实际开发中可按需选择。

### actions.props.set — 设置 Props

```typescript
import { actions } from '@piying/view-angular-core';

const schema = v.pipe(
  v.string(),
  actions.props.set({ customKey: 'customValue', theme: 'dark' }),
);
```

### actions.props.patch — 合并 Props

```typescript
const schema = v.pipe(
  v.string(),
  actions.props.patch({ dataId: '123' }),
);
// props = { customKey: 'customValue', theme: 'dark', dataId: '123' }
```

### actions.props.mapAsync — 动态映射 Props

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

> **Props 的使用**：组件通过 `field.props()` 获取 props 值。在 Angular 中可通过注入 `PI_VIEW_FIELD_TOKEN` 后访问 `field.props()`。

---

## providers — 注入业务服务

### actions.providers.set — 设置 Provider（覆盖）

将业务服务注入到字段组件的 Injector 中，组件可直接通过 `inject()` 使用：

```typescript
import { UserService } from './user.service';
import { actions } from '@piying/view-angular-core';

const schema = v.pipe(
  v.string(),
  actions.providers.set([UserService]),
);
```

组件中使用：

```typescript
import { inject } from '@angular/core';

@Component({ ... })
export class MyInputComponent {
  private userSvc = inject(UserService);  // ✅ 直接注入，无需额外配置
}
```

### actions.providers.patch — 合并 Provider

在已有 Provider 上追加新的业务服务：

```typescript
import { LoggerService } from './logger.service';

const schema2 = v.pipe(
  v.string(),
  actions.providers.set([UserService]),
  actions.providers.patch([LoggerService]),
);
// 最终 providers = [UserService, LoggerService]
```

### actions.providers.change — 变更 Provider（函数式追加）

通过函数对现有 Provider 列表进行变换：

```typescript
import { AnalyticsService } from './analytics.service';

const schema3 = v.pipe(
  v.string(),
  actions.providers.set([UserService]),
  actions.providers.change((providers) => [...providers, AnalyticsService]),
);
// 最终 providers = [UserService, AnalyticsService]
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

- [API: attributes/class](attributes-class.md) — HTML attributes 和 CSS class 设置
- [API: Wrappers](wrappers.md) — Wrapper 包装器完整指南（编写、V1/V2 语法）
- [API: global-config](global-config.md) — types/wrappers 全局配置优先级

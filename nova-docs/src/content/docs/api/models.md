---
title: "models — 双向绑定模型设置"
---

本文介绍如何通过 `actions.models` 为字段组件建立**双向绑定（two-way model binding）**，将组件内部的 `model` 输入/输出连接到外部 Signal。

## 概念

`actions.models` 与 `inputs` 类似，但它专门用于**双向绑定**（如 Angular 的 `ngModel` / `model()`、Vue 的 `v-model`）。配置值是一个 `Record<string, WritableSignal<any>>`，每个键对应组件的一个 model 输入。

```typescript
type ViewModels = Record<string, WritableSignal<any>>;
```

当组件触发 model 的变更事件时，外部 Signal 会自动更新；反之，外部 Signal 变化也会同步到组件。这实现了真正的**双向数据流**，而 `inputs` 是单向的。

## actions.models.set — 设置 Model（覆盖）

```typescript
import { signal } from '@angular/core';
import { actions } from '@piying/view-angular-core';

const count = signal(0);

const schema = v.pipe(
  NFCSchema,
  setComponent(MyCounterComponent),
  actions.models.set({
    count, // 将外部 Signal 绑定到组件的 count model
  }),
);
```

## actions.models.patch — 合并 Model

在已有 models 上合并新的键值对：

```typescript
const a = signal(0);
const b = signal('');

const schema = v.pipe(
  NFCSchema,
  setComponent(MyComponent),
  actions.models.patch({ input1: a }),
  actions.models.patch({ input2: b }),
);
```

## actions.models.remove — 移除 Model

```typescript
const schema = v.pipe(
  NFCSchema,
  setComponent(MyComponent),
  actions.models.patch({ input1: a, input2: b }),
  actions.models.remove(['input1']), // 移除 input1 的绑定
);
```

## actions.models.patchAsync — 异步设置 Model

通过字段引用动态创建 model 绑定：

```typescript
const schema = v.pipe(
  NFCSchema,
  setComponent(MyComponent),
  actions.models.patchAsync({
    input1: (field) => signal(field.form.control?.value),
  }),
);
```

## actions.models.mapAsync — 动态映射 Model

对已有 models 进行函数式变换：

```typescript
const schema = v.pipe(
  NFCSchema,
  setComponent(MyComponent),
  actions.models.patch({ input1: a }),
  actions.models.mapAsync((field) => (value) => ({
    ...value,
    input2: value['input1'],
  })),
);
```

## 组件端的 Model 实现

### Angular 写法

组件使用 `@Input()` / `@Output()` 配对或 `model()` 语法实现 model 输入：

```typescript
// 方式一：@Input() + @Output() 配对
@Component({ ... })
export class MyComponent {
  input1 = input(0);           // @Input() 输入
  input1Change = output<number>(); // @Output() 变更事件（input1Change）
}

// 方式二：model() 语法（推荐）
@Component({ ... })
export class MyComponent {
  input2 = model(0); // Angular signal model()，自动生成 input2Change
}
```

### 其他框架写法

Vue / React / Solid / Svelte 均有对应的 model 双向绑定机制，`actions.models` 的用法一致，仅组件端实现不同。

## models vs inputs

| 特性 | `inputs` | `models` |
|------|----------|----------|
| 数据流 | 单向（父 → 组件） | 双向（父 ⇄ 组件） |
| 值类型 | `Record<string, any>` | `Record<string, WritableSignal<any>>` |
| 组件端 | 普通 `@Input()` | `@Input()` + `@Output()` 配对 / `model()` |
| 适用场景 | 传入静态/只读配置 | 双向绑定的表单值、开关状态等 |

## 完整示例

```typescript
import { signal } from '@angular/core';
import * as v from 'valibot';
import { actions, NFCSchema, setComponent } from '@piying/view-angular-core';
import { ToggleComponent } from './toggle.component';

// 外部状态
const enabled = signal(false);

const schema = v.pipe(
  NFCSchema,
  setComponent(ToggleComponent),
  actions.models.patch({
    checked: enabled, // 双向绑定：组件切换开关 → enabled 更新
  }),
);
```

## 下一步

- [API: inputs](api/inputs/) — 组件输入属性设置（单向）
- [API: outputs](api/outputs/) — 组件输出事件设置
- [API: props](api/props/) — 通用属性配置

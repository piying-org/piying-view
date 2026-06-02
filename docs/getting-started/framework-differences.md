# 框架差异

Piying-View 为五个前端框架分别实现了对应的适配器包，遵循同一套接口规范。本文档总结各框架在使用上的差异。

## 快速对比

| 特性                 | Angular                             | Vue                           | React                             | Solid                             | Svelte                            |
| -------------------- | ----------------------------------- | ----------------------------- | --------------------------------- | --------------------------------- | --------------------------------- |
| **包名**             | `@piying/view-angular`              | `@piying/view-vue`            | `@piying/view-react`              | `@piying/view-solid`              | `@piying/view-svelte`             |
| **获取 Field Token** | `inject(PI_VIEW_FIELD_TOKEN)`       | `inject(PI_VIEW_FIELD_TOKEN)` | `useContext(PI_VIEW_FIELD_TOKEN)` | `useContext(PI_VIEW_FIELD_TOKEN)` | `getContext(PI_VIEW_FIELD_TOKEN)` |
| **CVA 绑定方式**     | `BaseControl` + `NG_VALUE_ACCESSOR` | `defineExpose({ cva })`       | `useImperativeHandle`             | `createMemo`                      | `export { cva }`                  |
| **Signal 转换工具**  | —（框架原生支持）                   | `signalToRef`                 | `useSignalToRef`                  | `createSignalConvert`             | `signalToState`                   |

---

## Angular 差异

### 获取 Field Token

```typescript
import { inject } from '@angular/core';
import { PI_VIEW_FIELD_TOKEN } from '@piying/view-angular';

const field = inject(PI_VIEW_FIELD_TOKEN);
```

### 绑定 CVA / CVAA

Angular 通过 `NG_VALUE_ACCESSOR` 实现双向绑定。Piying-View 提供 `BaseControl` 基类简化实现：

```typescript
import { Component, forwardRef } from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { BaseControl } from '@piying/view-angular';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
  template: `<input [(ngModel)]="value$" [disabled]="disabled$()" />`,
})
export class InputComponent extends BaseControl {}
```

核心要点：

- **注册 `NG_VALUE_ACCESSOR`** — Angular 表单双向绑定的标准方式
- **继承 `BaseControl`** — 内置 `ControlValueAccessor` 实现，提供 `value$` 和 `disabled$` 信号
- Angular **原生支持 Signal**，不需要额外转换工具

---

## Vue 差异

### 获取 Field Token

```typescript
import { inject } from 'vue';
import { PI_VIEW_FIELD_TOKEN } from '@piying/view-vue';

const field = inject(PI_VIEW_FIELD_TOKEN)!;
```

> **注意**：支持 Vue 2 和 Vue 3。Vue 2 使用 `@piying/view-vue2-legacy` 包。

### 绑定 CVA / CVAA

```typescript
import { useControlValueAccessor } from '@piying/view-vue';

const {
  cva,
  cvaa: { value, valueChange, disabled, touchedChange },
} = useControlValueAccessor();

defineExpose({ cva });
```

### signalToRef — Signal 转换为 Ref

Vue 使用 `ref` 作为响应式基础。Piying-View 提供 `signalToRef` 工具：

```typescript
import { signalToRef } from '@piying/view-vue';

const inputs = signalToRef(() => props.field.inputs());
const outputs = signalToRef(() => props.field.outputs());
const renderConfig = signalToRef(() => props.field.renderConfig());
const attributes = signalToRef(() => props.field.attributes());
const wrappers = signalToRef(() => props.field.wrappers());
```

---

## React 差异

### 获取 Field Token

```typescript
import { PI_VIEW_FIELD_TOKEN } from '@piying/view-react';
import { useContext } from 'react';

const field = useContext(PI_VIEW_FIELD_TOKEN);
```

### 绑定 CVA / CVAA

React 通过 `useImperativeHandle` 暴露 CVA 实例：

```typescript
import type { ControlValueAccessor } from '@piying/view-core';
import { CVA, useControlValueAccessor, useInputTextModel } from '@piying/view-react';
import { useImperativeHandle } from 'react';

interface PiInputOptions {
  [CVA]: React.RefObject<ControlValueAccessor>;
}

export function InputText(props: PiInputOptions) {
  const { cva, cvaa } = useControlValueAccessor();
  useImperativeHandle(props[CVA], () => cva, [cva]);
  const textModel = useInputTextModel(cvaa, false);
  return <input type="text" {...textModel} />;
}
```

### useSignalToRef — Signal 转换为 Ref

React 组件接收的值需要通过 `useSignalToRef` 转换以支持动态更新：

```typescript
import { useSignalToRef } from '@piying/view-react';

const inputs = useSignalToRef(props.field, (field) => field.inputs());
const outputs = useSignalToRef(props.field, (field) => field.outputs());
const renderConfig = useSignalToRef(props.field, (field) => field.renderConfig());
const attributes = useSignalToRef(props.field, (field) => field.attributes());
const wrappers = useSignalToRef(props.field, (field) => field.wrappers());
```

---

## Solid 差异

### 获取 Field Token

```typescript
import { PI_VIEW_FIELD_TOKEN } from '@piying/view-solid';
import { useContext } from 'solid-js';

const field = useContext(PI_VIEW_FIELD_TOKEN);
```

### 绑定 CVA / CVAA

Solid 使用 `createMemo` 实现 CVA 绑定：

```typescript
import type { ControlValueAccessor } from '@piying/view-core';
import { CVA, useControlValueAccessor } from '@piying/view-solid';
import { createMemo } from 'solid-js';

interface PiInputOptions {
  [CVA]: Setter<ControlValueAccessor>;
}

export function InputText(props: PiInputOptions) {
  const result = useControlValueAccessor();
  createMemo(() => {
    props[CVA](result.cva);
  });
  // ...
}
```

### createSignalConvert — Signal 转换

Solid 使用自己的 Signal 系统。Piying-View 提供 `createSignalConvert` 进行适配：

```typescript
import { createSignalConvert } from '@piying/view-solid';

const inputs = createSignalConvert(() => field.inputs());
const outputs = createSignalConvert(() => field.outputs());
const renderConfig = createSignalConvert(() => field.renderConfig());
const attributes = createSignalConvert(() => field.attributes());
const wrappers = createSignalConvert(() => field.wrappers());
```

---

## Svelte 差异

### 获取 Field Token

```typescript
import { PI_VIEW_FIELD_TOKEN } from '@piying/view-svelte';
import { getContext } from 'svelte';

const field = getContext(PI_VIEW_FIELD_TOKEN);
```

> **注意**：Svelte 使用 `getContext` 而非依赖注入。Field Token 需要在父组件中通过 `setContext` 提供。

### 绑定 CVA / CVAA

Svelte 通过 `export` 导出 CVA：

```typescript
import { useControlValueAccessor } from '@piying/view-svelte';

const { cva, cvaa } = useControlValueAccessor();
export { cva };
```

模板中使用：

```svelte
<script lang="ts">
  import { useControlValueAccessor } from '@piying/view-svelte';
  const { cva, cvaa } = useControlValueAccessor();
  export { cva };
</script>

<input
  bind:value={() => cvaa.value, (v) => cvaa.valueChange(v)}
  disabled={cvaa.disabled}
  onblur={cvaa.touchedChange}
/>
```

### signalToState — Signal 转换

Svelte 使用 runes（`$:`）作为响应式系统。Piying-View 提供 `signalToState`：

```typescript
import { signalToState } from '@piying/view-svelte';

const inputs = signalToState(() => field().inputs());
const outputs = signalToState(() => field().outputs());
const renderConfig = signalToState(() => field().renderConfig());
const attributes = signalToState(() => field().attributes());
const wrappers = signalToState(() => field().wrappers());
```

---

## 跨框架通用概念

以下概念在所有框架中完全相同，Schema 定义无需修改：

- **Actions**（`setComponent`、`formConfig`、`actions.*` 等）的用法一致
- **Valibot Schema** 的定义方式一致
- **Field 配置对象**的结构一致（attributes、inputs、outputs、events、wrappers、children）
- **路径查询**语法（`#`、`..`、`@alias`、`['aa','bb']`）一致
- **验证系统**与组件解耦的设计一致

差异仅在于：

1. 框架特定的 **Field Token 获取方式**
2. 框架特定的 **CVA/CVAA 绑定机制**
3. 框架特定的 **Signal/响应式系统转换工具**

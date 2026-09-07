---
title: "Vue 包 API 参考（@piying/view-vue）"
---

本文介绍 Vue 包 `@piying/view-vue` 的公开 API。Vue 2 使用 `@piying/view-vue2-legacy`，两者 API 结构一致。

## 组件

### PiyingView

```vue
<template>
  <piying-view v-model="model" :schema="schema" :options="options" />
</template>
```

```typescript
import { PiyingView } from '@piying/view-vue';
```

| Props           | 类型                     | 说明                |
| --------------- | ------------------------ | ------------------- |
| `schema`        | `v.BaseSchema`           | Valibot Schema      |
| `modelValue`    | `any`                    | `v-model` 双向绑定  |
| `options`       | `FieldConvertViewOptions` | 转换选项          |

### PiyingFieldTemplate

> 🧭 **手动模式**：属于 [两种使用模式](/getting-started/two-modes/) 中的模式二（手动绑定）。`PiyingView` 是自动模式入口，而 `PiyingFieldTemplate` / `PiyingFieldControlBind` / `convertToField` 是手动模式的手动绑定工具。

渲染单个字段模板，通过 `field` / `path` 定位（模板内部仍全自动渲染）：

```vue
<piying-field-template :field="field" :path="keyPath" />
```

### PiyingViewGroup

字段组容器，用于渲染 `object` / `array` / `record`：

```typescript
import { PiyingViewGroup } from '@piying/view-vue';

options = {
  fieldGlobalConfig: {
    types: {
      object: { type: PiyingViewGroup },
      array: { type: PiyingViewGroup },
    },
  },
};
```

### PiyingFieldControlBind（别名 Field）

> 🧭 **手动模式**：同 `PiyingFieldTemplate`，属于模式二（手动绑定）。

字段控件绑定组件，将字段绑定为表单控件并暴露 `cvaa`：

```vue
<piying-field-control-bind :field="field">
  <template #default="{ cvaa, field }">
    <!-- 自定义控件，使用 cvaa 绑定值/事件 -->
  </template>
</piying-field-control-bind>
```

```typescript
import { PiyingFieldControlBind, Field } from '@piying/view-vue';
// Field 是 PiyingFieldControlBind 的别名
```

## Token

```typescript
import { PI_VIEW_FIELD_TOKEN, InjectorToken } from '@piying/view-vue';

// 自定义控件中获取当前字段
const field = inject(PI_VIEW_FIELD_TOKEN)!;
const injector = inject(InjectorToken)!;
```

- `PI_VIEW_FIELD_TOKEN` — 当前字段配置（`ComputedRef<PiResolvedViewFieldConfig>`）
- `InjectorToken` — 静态注入器（`ComputedRef<Injector>`）

## 工具函数

### useControlValueAccessor — CVA 适配器

返回 `cva`（ControlValueAccessor）和 `cvaa`（适配器）：

```typescript
import { useControlValueAccessor } from '@piying/view-vue';

const { cva, cvaa } = useControlValueAccessor();
// 通过 defineExpose 暴露 cva，供库内部注册
defineExpose({ cva });
```

`cvaa` 提供：

| 成员           | 类型                       | 说明                  |
| -------------- | -------------------------- | --------------------- |
| `value`        | `ShallowRef`               | 当前值                |
| `disabled`     | `Ref<boolean>`             | 禁用状态              |
| `valueChange(v)` | `(v) => void`            | 更新值并触发变更      |
| `touchedChange()` | `() => void`            | 触发 touched 回调     |

### signalToRef — Signal 转 Ref

```typescript
import { signalToRef } from '@piying/view-vue';

const inputs = signalToRef(() => field.value.inputs());
const outputs = signalToRef(() => field.value.outputs());
```

### typedComponent — 强类型 setComponent

详见 [Vue 强类型组件](/adapters/vue-typed-component/)。

```typescript
import { typedComponent } from '@piying/view-vue';
import { markRaw } from 'vue';

const typeDefine = typedComponent({
  types: {
    string: { type: markRaw(MyInput) },
  },
});

const schema = v.object({
  name: typeDefine.setComponent('string', (actions) => [
    actions.inputs.patch({ placeholder: '请输入' }),
  ]),
});
```

### convertToField — Schema 转换

> 🧭 **手动模式**：`convertToField` 是手动模式的核心入口，返回 `field` 后需用 `PiyingFieldControlBind` / `PiyingFieldTemplate` 手动绑定渲染位置。自动模式中 `PiyingView` 会在内部自动调用它，无需手动使用。详见 [两种使用模式](/getting-started/two-modes/)。

```typescript
import { convertToField } from '@piying/view-vue';

const field = convertToField(() => schema, subInjector, () => options);
```

### rawConfig — 原生配置 Action

`rawConfig` 与 `actions`、`setComponent` 等 Action 一样，逻辑定义在所有框架中相同。Vue 包**不单独导出**这些 Action，需从核心包导入：

```typescript
import { rawConfig, setComponent, actions } from '@piying/view-angular-core'; // 核心包统一导出
```

> **注意**：`@piying/view-vue` 包入口不导出 `rawConfig` / `actions` / `setComponent`，请从 `@piying/view-angular-core` 导入。

## 类

### VueSchemaHandle

Vue 的 Schema 处理句柄（继承 `CoreSchemaHandle`）：

```typescript
import { VueSchemaHandle } from '@piying/view-vue';

class MyHandle extends VueSchemaHandle {}
```

### VueFormBuilder

Vue 的 FormBuilder（继承 `FormBuilder<VueSchemaHandle>`）：

```typescript
import { VueFormBuilder } from '@piying/view-vue';

class MyBuilder extends VueFormBuilder {}
```

## Vue 2 Legacy 差异（@piying/view-vue2-legacy）

| 项                    | Vue 3                        | Vue 2 Legacy                     |
| --------------------- | ---------------------------- | -------------------------------- |
| `useControlValueAccessor` | `useControlValueAccessor(optionalBind?)` | `useControlValueAccessor(autoChange?, optionalBind?)` |
| 额外导出              | —                            | `clone`（rfdc 深拷贝）           |

Vue2-legacy 的 `useControlValueAccessor` 增加了 `autoChange` 参数，为 `true` 时自动 `watch(value)` 触发变更：

```typescript
import { useControlValueAccessor, clone } from '@piying/view-vue2-legacy';

const { cva, cvaa } = useControlValueAccessor(true);
const copy = clone(originalObj);
```

## 完整导出

`@piying/view-vue` 导出：`PiyingView`、`PiyingFieldTemplate`、`PiyingViewGroup`、`PiyingFieldControlBind`（别名 `Field`）、`PI_VIEW_FIELD_TOKEN`、`InjectorToken`、`signalToRef`、`useControlValueAccessor`、`typedComponent`、`convertToField`、`VueSchemaHandle`、`VueFormBuilder`、`VueSchema` 类型。

> **注意**：`rawConfig` / `actions` / `setComponent` 等 Action 需从 `@piying/view-angular-core` 导入，`@piying/view-vue` 不导出。

## 下一步

- [Vue 强类型组件](/adapters/vue-typed-component/) — typedComponent 详解
- [框架差异](/getting-started/framework-differences/) — Vue 的 Field Token / CVA 绑定
- [基础字段定义](/scenarios/basic-field/) — setComponent / formConfig

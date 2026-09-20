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

> 🧭 **手动模式**：属于 [两种使用模式](zh/getting-started/two-modes/) 中的模式二（手动绑定）。`PiyingView` 是自动模式入口，而 `PiyingFieldTemplate` / `PiyingField` / `convertToField` 是手动模式的手动绑定工具。

渲染字段（组件 + 包装器链 + 递归子字段），通过 `field` / `path` 定位，渲染到指定位置：

```vue
<template>
  <!-- 渲染整个根字段 -->
  <PiyingFieldTemplate :field="field" />

  <!-- 只把子字段 k2 摆到这里 -->
  <div class="k2-slot">
    <PiyingFieldTemplate :field="field" :path="['k2']" />
  </div>
</template>

<script setup lang="ts">
import { PiyingFieldTemplate, convertToField } from '@piying/view-vue';

const field = convertToField(() => schema, undefined, () => options);
</script>
```

| Props | 类型 | 说明 |
| --- | --- | --- |
| `field` | `PiResolvedViewFieldConfig`（必填） | 要渲染的字段配置 |
| `path` | `KeyPath`（可选） | 定位子字段；不传则渲染整个根字段 |

> 懒加载内置支持（`defineAsyncComponent` + `getLazyImport`）。完整渲染管线与常见坑见 [PiyingFieldTemplate（字段渲染）](zh/adapters/field-template/)。

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

### PiyingField

> 🧭 **手动模式**：同 `PiyingFieldTemplate`，属于模式二（手动绑定）。

字段绑定，将字段绑定为表单控件并暴露 `cvaa`：

```vue
<template>
  <PiyingField :field="field" :path="['text1']" v-slot="{ cvaa, field: f }">
    <input
      type="text"
      :value="unref(cvaa.value) ?? ''"
      :disabled="unref(cvaa.disabled)"
      @input="(e) => cvaa.valueChange((e.target as HTMLInputElement).value)"
      @blur="cvaa.touchedChange"
    />
  </PiyingField>
</template>

<script setup lang="ts">
import { unref } from 'vue';
import { PiyingField, convertToField } from '@piying/view-vue';

const field = convertToField(() => schema, undefined, () => options);
</script>
```

> ⚠️ Vue 的 `cvaa.value` 是 `ShallowRef`，插槽里不会自动解包，需要 `unref()`。

| Props | 类型 | 说明 |
| --- | --- | --- |
| `field` | `PiResolvedViewFieldConfig`（必填） | 字段配置 |
| `path` | `KeyPath`（可选） | 定位**叶子**子字段再绑定 |
| 默认插槽 | `{ cvaa, field }` | 渲染作用域，类型跟着 `path` 推导 |

```typescript
import { PiyingField, PiyingFieldControlBind } from '@piying/view-vue';
// 两者指向同一组件
```

> 完整说明（含 `cvaa` 成员、错误码、与 `PiyingFieldTemplate` 对比）见 [PiyingField（字段绑定）](zh/adapters/field/)。

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

详见 [Vue 强类型组件](zh/adapters/vue/typed-component/)。

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

### typedFieldComponentPipe — 路径 + 组件双强类型

按「路径 + 组件」写配置，`inputs` / `outputs` 的 key 与值类型跟着 Vue 组件走。详见 [typedFieldComponentPipe（Vue 3）](zh/adapters/vue/typed-field-component-pipe/)。

```typescript
import { typedComponent, typedFieldComponentPipe } from '@piying/view-vue';

const merged = typedFieldComponentPipe(schema, typeDefine, (d) => [
  d(['price'], 'amount', [d.inputs.patch({ placeholder: '请输入金额' })]),
  d(['tags'], 'tags', [d.outputs.merge({ change: (value) => {} })]),
]);
```

> Vue 版**没有 `d.models`**：`v-model` 就是 prop + `update:xxx` 的约定，运行时不消费 `field.models`。

### convertToField — Schema 转换

> 🧭 **手动模式**：`convertToField` 是手动模式的核心入口，返回 `field` 后需用 `PiyingField` / `PiyingFieldTemplate` 手动绑定渲染位置。自动模式中 `PiyingView` 会在内部自动调用它，无需手动使用。详见 [两种使用模式](zh/getting-started/two-modes/)。

```typescript
import { convertToField } from '@piying/view-vue';

const field = convertToField(() => schema, subInjector, () => options);
```

### rawConfig — 原生配置 Action

`rawConfig` 与 `actions`、`setComponent` 等 Action 一样，逻辑定义在所有框架中相同。Vue 包**不单独导出**这些 Action，需从框架无关的核心包导入：

```typescript
import { rawConfig, setComponent, actions } from '@piying/view-core'; // 核心包统一导出
```

> **注意**：`@piying/view-vue` 包入口不导出 `rawConfig` / `actions` / `setComponent`，请从 `@piying/view-core` 导入（React / Solid / Svelte 适配包同理）。

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

`@piying/view-vue` 导出：`PiyingView`、`PiyingFieldTemplate`、`PiyingViewGroup`、`PiyingField`（别名 `PiyingFieldControlBind`）、`PI_VIEW_FIELD_TOKEN`、`InjectorToken`、`signalToRef`、`useControlValueAccessor`、`typedComponent`、`typedFieldComponentPipe`、`convertToField`、`VueSchemaHandle`、`VueFormBuilder`、`VueSchema` 类型。

> **注意**：`rawConfig` / `actions` / `setComponent` 等 Action 需从 `@piying/view-core` 导入，`@piying/view-vue` 不导出。

## 下一步

- [Vue 强类型组件](zh/adapters/vue/typed-component/) — typedComponent 详解
- [typedFieldComponentPipe（Vue 3）](zh/adapters/vue/typed-field-component-pipe/) — 路径 + 组件双强类型
- [框架差异](zh/getting-started/framework-differences/) — Vue 的 Field Token / CVA 绑定
- [基础字段定义](zh/scenarios/basic-field/) — setComponent / formConfig

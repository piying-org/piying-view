---
title: "Svelte 包 API 参考（@piying/view-svelte）"
---

本文介绍 Svelte 包 `@piying/view-svelte` 的公开 API。Svelte 使用 runes（`$state` / `$effect`）作为响应式基础，字段通过 `getContext` 获取。

## 组件

### PiyingView

```svelte
<script>
  import { PiyingView } from '@piying/view-svelte';
</script>

<PiyingView {schema} {options} bind:model />
```

| Props        | 类型                     | 说明               |
| ------------ | ------------------------ | ------------------ |
| `schema`     | `v.BaseSchema`           | Valibot Schema     |
| `model`      | `any`                    | 双向绑定模型       |
| `options`    | `FieldConvertViewOptions` | 转换选项         |

### PiyingFieldTemplate

渲染字段模板：

```svelte
<script>
  import { PiyingFieldTemplate } from '@piying/view-svelte';
</script>

<PiyingFieldTemplate {field} {path} />
```

### Field

字段控件绑定组件，将字段绑定为表单控件并暴露 `cvaa`：

```svelte
<script>
  import { Field } from '@piying/view-svelte';
</script>

<Field {field}>
  <!-- 通过 slot props 获取 cvaa / field -->
</Field>
```

### PiyingViewGroup

字段组容器：

```svelte
<script>
  import { PiyingViewGroup } from '@piying/view-svelte';
</script>

<PiyingViewGroup {field} />
```

## Token

Svelte 通过 `getContext` 获取字段，而非依赖注入：

```svelte
<script>
  import { getContext } from 'svelte';
  import { PI_VIEW_FIELD_TOKEN, InjectorToken } from '@piying/view-svelte';

  const field = getContext(PI_VIEW_FIELD_TOKEN);       // () => PiResolvedViewFieldConfig
  const injector = getContext(InjectorToken);          // () => Injector
</script>
```

- `PI_VIEW_FIELD_TOKEN` — 当前字段配置（`() => PiResolvedViewFieldConfig`）
- `InjectorToken` — 静态注入器

## 工具函数

### useControlValueAccessor — CVA 适配器

```svelte
<script>
  import { useControlValueAccessor } from '@piying/view-svelte';
  const { cva, cvaa } = useControlValueAccessor();
  export { cva }; // 导出 CVA 供库内部注册
</script>
```

`cvaa` 提供：

| 成员             | 类型                 | 说明               |
| ---------------- | -------------------- | ------------------ |
| `value`          | `$state` getter      | 当前值             |
| `disabled`       | `$state` getter      | 禁用状态           |
| `valueChange(v)` | `(v) => void`        | 更新值并触发变更   |
| `touchedChange()`| `() => void`         | 触发 touched 回调  |

### signalToState — Signal 转 State

```svelte
<script>
  import { signalToState } from '@piying/view-svelte';
  const inputs = signalToState(() => field().inputs());
  const outputs = signalToState(() => field().outputs());
</script>
```

返回一个函数，调用时返回当前状态值（`() => dataRef`）。

## 类与转换

### SvelteSchemaHandle / SvelteFormBuilder

```svelte
<script>
  import { SvelteSchemaHandle, SvelteFormBuilder } from '@piying/view-svelte';
</script>
```

### convertToField — Schema 转换

```svelte
<script>
  import { convertToField } from '@piying/view-svelte';
  const field = convertToField(() => schema, envInjector, () => options);
</script>
```

### PiResolvedViewFieldConfig

Svelte 的字段配置类型：

```typescript
import type { PiResolvedViewFieldConfig } from '@piying/view-svelte';
```

## 编写字段控件示例

```svelte
<script lang="ts">
  import { useControlValueAccessor } from '@piying/view-svelte';
  const { cva, cvaa } = useControlValueAccessor();
  export { cva };
</script>

<input
  value={cvaa.value}
  disabled={cvaa.disabled}
  oninput={(e) => cvaa.valueChange(e.currentTarget.value)}
  onblur={() => cvaa.touchedChange()}
/>
```

## 完整导出

`@piying/view-svelte` 导出：`PiyingView`、`PiyingFieldTemplate`、`Field`、`PiyingViewGroup`、`PI_VIEW_FIELD_TOKEN`、`InjectorToken`、`signalToState`、`useControlValueAccessor`、`convertToField`、`SvelteSchemaHandle`、`SvelteFormBuilder`、`PiResolvedViewFieldConfig`。

## 下一步

- [框架差异](getting-started/framework-differences/) — Svelte 的 getContext / Signal 转换
- [基础字段定义](scenarios/basic-field/) — setComponent / formConfig
- [字段模型绑定（React）](adapters/field-model-binding-react/) — 各框架绑定方式对比

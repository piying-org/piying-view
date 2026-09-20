---
title: "Vue Package API Reference (@piying/view-vue)"
---

This page documents the public API of the Vue package `@piying/view-vue`. Vue 2 uses `@piying/view-vue2-legacy`; both share the same API shape.

## Components

### PiyingView

```vue
<template>
  <piying-view v-model="model" :schema="schema" :options="options" />
</template>
```

```typescript
import { PiyingView } from '@piying/view-vue';
```

| Props           | Type                     | Description            |
| --------------- | ------------------------ | ------------------- |
| `schema`        | `v.BaseSchema`           | Valibot Schema      |
| `modelValue`    | `any`                    | `v-model` two-way binding |
| `options`       | `FieldConvertViewOptions` | Conversion options       |

### PiyingFieldTemplate

> 🧭 **Manual mode**: this belongs to mode two (manual binding) of [Two Usage Modes](en/getting-started/two-modes/). `PiyingView` is the automatic-mode entry point, while `PiyingFieldTemplate` / `PiyingField` / `convertToField` are the manual-binding tools of manual mode.

Renders the whole "wrapper chain + component + recursive children" tree at the chosen position:

```vue
<template>
  <!-- Render the whole root field -->
  <PiyingFieldTemplate :field="field" />

  <!-- Place only the child field k2 here -->
  <div class="k2-slot">
    <PiyingFieldTemplate :field="field" :path="['k2']" />
  </div>
</template>

<script setup lang="ts">
import { PiyingFieldTemplate, convertToField } from '@piying/view-vue';

const field = convertToField(() => schema, undefined, () => options);
</script>
```

| Props | Type | Description |
| --- | --- | --- |
| `field` | `PiResolvedViewFieldConfig` (required) | The field config to render |
| `path` | `KeyPath` (optional) | Locate a child field; omit it to render the whole root field |

> Lazy loading is built in (`defineAsyncComponent` + `getLazyImport`). Full rendering pipeline and pitfalls: [PiyingFieldTemplate (Rendering)](en/adapters/field-template/).

### PiyingViewGroup

Field group container used to render `object` / `array` / `record`:

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

> 🧭 **Manual mode**: like `PiyingFieldTemplate`, this belongs to mode two (manual binding).

Control binding: binds the field as a form control and exposes `cvaa`:

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

> ⚠️ In Vue `cvaa.value` is a `ShallowRef`; slot props are not auto-unwrapped, so use `unref()`.

| Props | Type | Description |
| --- | --- | --- |
| `field` | `PiResolvedViewFieldConfig` (required) | Field config |
| `path` | `KeyPath` (optional) | Locate a **leaf** child field and bind that |
| Default slot | `{ cvaa, field }` | Render scope; types follow the `path` |

```typescript
import { PiyingField, PiyingFieldControlBind } from '@piying/view-vue';
// both refer to the same component
```

> Full details (`cvaa` members, error codes, comparison with `PiyingFieldTemplate`): [PiyingField (Binding)](en/adapters/field/).

## Token

```typescript
import { PI_VIEW_FIELD_TOKEN, InjectorToken } from '@piying/view-vue';

// get the current field inside a custom control
const field = inject(PI_VIEW_FIELD_TOKEN)!;
const injector = inject(InjectorToken)!;
```

- `PI_VIEW_FIELD_TOKEN` — current field configuration (`ComputedRef<PiResolvedViewFieldConfig>`)
- `InjectorToken` — static injector (`ComputedRef<Injector>`)

## Utilities

### useControlValueAccessor — CVA adapter

Returns `cva` (ControlValueAccessor) and `cvaa` (the adapter):

```typescript
import { useControlValueAccessor } from '@piying/view-vue';

const { cva, cvaa } = useControlValueAccessor();
// expose cva through defineExpose so the library can register it
defineExpose({ cva });
```

`cvaa` provides:

| Member         | Type                       | Description              |
| -------------- | -------------------------- | --------------------- |
| `value`        | `ShallowRef`               | Current value            |
| `disabled`     | `Ref<boolean>`             | Disabled state           |
| `valueChange(v)` | `(v) => void`            | Updates the value and emits change |
| `touchedChange()` | `() => void`            | Invokes the touched callback |

### signalToRef — signal to ref

```typescript
import { signalToRef } from '@piying/view-vue';

const inputs = signalToRef(() => field.value.inputs());
const outputs = signalToRef(() => field.value.outputs());
```

### typedComponent — strongly typed setComponent

See [Vue Typed Components](en/adapters/vue/typed-component/).

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
    actions.inputs.patch({ placeholder: 'Please enter' }),
  ]),
});
```

### typedFieldComponentPipe — path + component strong typing

Write config by "path + component" so `inputs` / `outputs` keys and value types follow the Vue component. Details: [typedFieldComponentPipe (Vue 3)](en/adapters/vue/typed-field-component-pipe/).

```typescript
import { typedComponent, typedFieldComponentPipe } from '@piying/view-vue';

const merged = typedFieldComponentPipe(schema, typeDefine, (d) => [
  d(['price'], 'amount', [d.inputs.patch({ placeholder: 'Enter amount' })]),
  d(['tags'], 'tags', [d.outputs.merge({ change: (value) => {} })]),
]);
```

> The Vue version has **no `d.models`**: `v-model` is just the prop + `update:xxx` convention, and the runtime does not consume `field.models`.

### convertToField — schema conversion

> 🧭 **Manual mode**: `convertToField` is the core entry point of manual mode — after obtaining `field` you must bind the render position manually with `PiyingField` / `PiyingFieldTemplate`. In automatic mode `PiyingView` calls it internally for you. See [Two Usage Modes](en/getting-started/two-modes/).

```typescript
import { convertToField } from '@piying/view-vue';

const field = convertToField(() => schema, subInjector, () => options);
```

### rawConfig — native configuration Action

`rawConfig` is defined once in the core and behaves identically in every framework, just like `actions` and `setComponent`. The Vue package does **not re-export** these Actions; import them from the framework-agnostic core package:

```typescript
import { rawConfig, setComponent, actions } from '@piying/view-core'; // unified exports from the core package
```

> **Note**: the `@piying/view-vue` entry does not export `rawConfig` / `actions` / `setComponent`; import them from `@piying/view-core` (the same applies to the React / Solid / Svelte adapter packages).

## Classes

### VueSchemaHandle

The Vue schema handle (extends `CoreSchemaHandle`):

```typescript
import { VueSchemaHandle } from '@piying/view-vue';

class MyHandle extends VueSchemaHandle {}
```

### VueFormBuilder

The Vue FormBuilder (extends `FormBuilder<VueSchemaHandle>`):

```typescript
import { VueFormBuilder } from '@piying/view-vue';

class MyBuilder extends VueFormBuilder {}
```

## Vue 2 Legacy Differences (@piying/view-vue2-legacy)

| Item                  | Vue 3                        | Vue 2 Legacy                   |
| --------------------- | ---------------------------- | -------------------------------- |
| `useControlValueAccessor` | `useControlValueAccessor(optionalBind?)` | `useControlValueAccessor(autoChange?, optionalBind?)` |
| Extra exports         | —                            | `clone` (rfdc deep clone)      |

In vue2-legacy, `useControlValueAccessor` accepts an extra `autoChange` parameter; when `true` it watches `value` and emits changes automatically:

```typescript
import { useControlValueAccessor, clone } from '@piying/view-vue2-legacy';

const { cva, cvaa } = useControlValueAccessor(true);
const copy = clone(originalObj);
```

## Full Exports

`@piying/view-vue` exports: `PiyingView`, `PiyingFieldTemplate`, `PiyingViewGroup`, `PiyingField` (alias `PiyingFieldControlBind`), `PI_VIEW_FIELD_TOKEN`, `InjectorToken`, `signalToRef`, `useControlValueAccessor`, `typedComponent`, `typedFieldComponentPipe`, `convertToField`, `VueSchemaHandle`, `VueFormBuilder`, and the `VueSchema` type.

> **Note**: Actions such as `rawConfig` / `actions` / `setComponent` must be imported from `@piying/view-core`; `@piying/view-vue` does not export them.

## Next Steps

- [Vue Typed Components](en/adapters/vue/typed-component/) — details of typedComponent
- [typedFieldComponentPipe (Vue 3)](en/adapters/vue/typed-field-component-pipe/) — path + component strong typing
- [Framework Differences](en/getting-started/framework-differences/) — Vue's Field Token / CVA binding
- [Basic Field Definition](en/scenarios/basic-field/) — setComponent / formConfig

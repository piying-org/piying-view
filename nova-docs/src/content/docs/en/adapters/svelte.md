---
title: "Svelte Package API Reference (@piying/view-svelte)"
---

This page documents the public API of the Svelte package `@piying/view-svelte`. Svelte uses runes (`$state` / `$effect`) as its reactivity primitive, and fields are obtained through `getContext`.

## Components

### PiyingView

```svelte
<script>
  import { PiyingView } from '@piying/view-svelte';
</script>

<PiyingView {schema} {options} bind:model />
```

| Props        | Type                     | Description          |
| ------------ | ------------------------ | ------------------ |
| `schema`     | `v.BaseSchema`           | Valibot Schema     |
| `model`      | `any`                    | Two-way bound model   |
| `options`    | `FieldConvertViewOptions` | Conversion options   |

### PiyingFieldTemplate

Renders a field template:

```svelte
<script>
  import { PiyingFieldTemplate } from '@piying/view-svelte';
</script>

<PiyingFieldTemplate {field} {path} />
```

### Field

Field control binding component: binds the field as a form control and exposes `cvaa`:

```svelte
<script>
  import { Field } from '@piying/view-svelte';
</script>

<Field {field}>
  <!-- get cvaa / field through slot props -->
</Field>
```

### PiyingViewGroup

Field group container:

```svelte
<script>
  import { PiyingViewGroup } from '@piying/view-svelte';
</script>

<PiyingViewGroup {field} />
```

## Token

Svelte gets the field through `getContext` instead of dependency injection:

```svelte
<script>
  import { getContext } from 'svelte';
  import { PI_VIEW_FIELD_TOKEN, InjectorToken } from '@piying/view-svelte';

  const field = getContext(PI_VIEW_FIELD_TOKEN);       // () => PiResolvedViewFieldConfig
  const injector = getContext(InjectorToken);          // () => Injector
</script>
```

- `PI_VIEW_FIELD_TOKEN` — current field configuration (`() => PiResolvedViewFieldConfig`)
- `InjectorToken` — static injector

## Utilities

### useControlValueAccessor — CVA adapter

```svelte
<script>
  import { useControlValueAccessor } from '@piying/view-svelte';
  const { cva, cvaa } = useControlValueAccessor();
  export { cva }; // export the CVA so the library can register it
</script>
```

`cvaa` provides:

| Member           | Type                 | Description            |
| ---------------- | -------------------- | ------------------ |
| `value`          | `$state` getter      | Current value          |
| `disabled`       | `$state` getter      | Disabled state         |
| `valueChange(v)` | `(v) => void`        | Updates the value and emits change |
| `touchedChange()`| `() => void`         | Invokes the touched callback |

### signalToState — signal to state

```svelte
<script>
  import { signalToState } from '@piying/view-svelte';
  const inputs = signalToState(() => field().inputs());
  const outputs = signalToState(() => field().outputs());
</script>
```

Returns a function that returns the current state value when called (`() => dataRef`).

## Classes and Conversion

### SvelteSchemaHandle / SvelteFormBuilder

```svelte
<script>
  import { SvelteSchemaHandle, SvelteFormBuilder } from '@piying/view-svelte';
</script>
```

### convertToField — schema conversion

```svelte
<script>
  import { convertToField } from '@piying/view-svelte';
  const field = convertToField(() => schema, envInjector, () => options);
</script>
```

### PiResolvedViewFieldConfig

The Svelte field configuration type:

```typescript
import type { PiResolvedViewFieldConfig } from '@piying/view-svelte';
```

## Writing a Field Control Example

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

## Full Exports

`@piying/view-svelte` exports: `PiyingView`, `PiyingFieldTemplate`, `Field`, `PiyingViewGroup`, `PI_VIEW_FIELD_TOKEN`, `InjectorToken`, `signalToState`, `useControlValueAccessor`, `convertToField`, `SvelteSchemaHandle`, `SvelteFormBuilder`, `PiResolvedViewFieldConfig`.

## Next Steps

- [Framework Differences](en/getting-started/framework-differences/) — Svelte's getContext / signal conversion
- [Basic Field Definition](en/scenarios/basic-field/) — setComponent / formConfig
- [Field Model Binding (React)](en/adapters/field-model-binding-react/) — compare binding approaches across frameworks

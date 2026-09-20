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

<PiyingView {schema} {options} {model} modelChange={(v) => (model = v)} />
```

| Props         | Type                       | Description                                        |
| ------------- | -------------------------- | -------------------------------------------------- |
| `schema`      | `v.BaseSchema`             | Valibot Schema                                     |
| `model`       | `any`                      | Model value (one-way in; writes back into the form)|
| `modelChange` | `(value: any) => void`     | Model change callback (fires only with **no validation errors**) |
| `options`     | `FieldConvertViewOptions`  | Conversion options                                 |

> `model` is not a `$bindable()` prop, so **`bind:model` does not work**; write the value back to your own state inside `modelChange`. 

### PiyingFieldTemplate

> 🧭 **Manual mode**: belongs to mode two of [Two Usage Modes](en/getting-started/two-modes/). Only the **render position** is manual; the field still renders fully automatically inside.

Renders the whole "wrapper chain + component + recursive children" tree at the chosen position:

```svelte
<script>
  import { PiyingFieldTemplate } from '@piying/view-svelte';
</script>

<PiyingFieldTemplate {field} {path} />
```

| Props | Type | Description |
| --- | --- | --- |
| `field` | `PiResolvedViewFieldConfig` (required) | The field config to render |
| `path` | `KeyPath` (optional) | Locate a child field; omit it to render the whole root field |

> Full rendering pipeline, lazy loading and pitfalls: [PiyingFieldTemplate (Rendering)](en/adapters/field-template/).

### PiyingField

> 🧭 **Manual mode**: like `PiyingFieldTemplate`, this belongs to mode two (manual binding).

Control binding component: connects the field's `FieldControl` to **a control you wrote yourself**, exposing `cvaa` / `field` through a `children` snippet:

```svelte
<script lang="ts">
  import { PiyingField } from '@piying/view-svelte';
  let { field } = $props();
</script>

<PiyingField {field} path={['text1']}>
  {#snippet children(cvaa, f)}
    <input
      type="text"
      value={cvaa.value ?? ''}
      disabled={cvaa.disabled}
      oninput={(e) => cvaa.valueChange(e.currentTarget.value)}
      onblur={cvaa.touchedChange}
    />
  {/snippet}
</PiyingField>
```

| Props | Type | Description |
| --- | --- | --- |
| `field` | `PiResolvedViewFieldConfig` (required) | Field config |
| `path` | `KeyPath` (optional) | Locate a **leaf** child field and bind that |
| `children` | `(cvaa, field) => any` | Snippet parameters; types follow the `path` |

> Full details (`cvaa` members, error codes, comparison with `PiyingFieldTemplate`): [PiyingField (Binding)](en/adapters/field/).

### PiyingViewGroup

Field group container for `object` / `array` / `record` types.

It takes **no props** — the field config comes from `getContext(PI_VIEW_FIELD_TOKEN)` (provided by `field-template.svelte`), so you only register it as the container component in `options`:

```svelte
<script lang="ts">
  import { PiyingViewGroup } from '@piying/view-svelte';

  const options = {
    fieldGlobalConfig: {
      types: {
        object: { type: PiyingViewGroup },
        array: { type: PiyingViewGroup },
      },
    },
  };
</script>
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

### typedFieldComponentPipe — path + component strong typing

Write config by "path + component": `inputs` takes non-function props, `outputs` takes function props (**names kept verbatim**). Note that **a Snippet is not an output**. Details: [typedFieldComponentPipe (Svelte)](en/adapters/svelte/typed-field-component-pipe/).

```ts
import { typedFieldComponentPipe } from '@piying/view-svelte';

const merged = typedFieldComponentPipe(schema, define, (d) => [
  d(['price'], 'amount', [d.inputs.patch({ placeholder: 'Enter amount' })]),
  d(['tags'], 'tags', [d.outputs.merge({ onChange: (value) => {} })]),
]);
```

> The Svelte version has **no `d.models`**: `bind:prop` is just a plain prop at the type level, and the runtime does not consume `field.models` either.

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
  // The second argument is an optional parent Injector; the third is options as a getter function
  const field = convertToField(() => schema, injector /* optional */, () => options);
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

`@piying/view-svelte` exports: `PiyingView`, `PiyingFieldTemplate`, `PiyingField`, `PiyingViewGroup`, `PI_VIEW_FIELD_TOKEN`, `InjectorToken`, `signalToState`, `useControlValueAccessor`, `typedFieldComponentPipe`, `convertToField`, `SvelteSchemaHandle`, `SvelteFormBuilder`, `PiResolvedViewFieldConfig`.

## Next Steps

- [typedFieldComponentPipe (Svelte)](en/adapters/svelte/typed-field-component-pipe/) — path + component strong typing
- [Framework Differences](en/getting-started/framework-differences/) — Svelte's getContext / signal conversion
- [Basic Field Definition](en/scenarios/basic-field/) — setComponent / formConfig
- [Field Model Binding (React)](en/adapters/react/field-model-binding/) — compare binding approaches across frameworks

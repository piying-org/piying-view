---
title: "Framework Differences"
---



Piying-View ships an adapter package for each of the five frontend frameworks, all following the same contract. This page summarises where they differ in practice.

## Quick Comparison

| Feature                | Angular                             | Vue                           | React                             | Solid                             | Svelte                            |
| -------------------- | ----------------------------------- | ----------------------------- | --------------------------------- | --------------------------------- | --------------------------------- |
| **Package**             | `@piying/view-angular`              | `@piying/view-vue`            | `@piying/view-react`              | `@piying/view-solid`              | `@piying/view-svelte`             |
| **Getting the Field Token** | `inject(PI_VIEW_FIELD_TOKEN)`   | `inject(PI_VIEW_FIELD_TOKEN)` | `useContext(PI_VIEW_FIELD_TOKEN)` | `useContext(PI_VIEW_FIELD_TOKEN)` | `getContext(PI_VIEW_FIELD_TOKEN)` |
| **CVA binding**         | `BaseControl` + `NG_VALUE_ACCESSOR` | `defineExpose({ cva })`       | `useImperativeHandle`             | `createMemo`                      | `export { cva }`                  |
| **Signal conversion**   | — (supported natively)               | `signalToRef`                 | `useSignalToRef`                  | `createSignalConvert`             | `signalToState`                   |

---

## Angular Differences

### Getting the Field Token

```typescript
import { inject } from '@angular/core';
import { PI_VIEW_FIELD_TOKEN } from '@piying/view-angular';

const field = inject(PI_VIEW_FIELD_TOKEN);
```

### Binding CVA / CVAA

Angular implements two-way binding through `NG_VALUE_ACCESSOR`. Piying-View provides the `BaseControl` base class to simplify it:

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

Key points:

- **Register `NG_VALUE_ACCESSOR`** — the standard way to bind Angular forms two ways
- **Extend `BaseControl`** — a built-in `ControlValueAccessor` implementation exposing the `value$` and `disabled$` signals
- Angular supports **Signals natively**, so no conversion helper is needed

---

## Vue Differences

### Getting the Field Token

```typescript
import { inject } from 'vue';
import { PI_VIEW_FIELD_TOKEN } from '@piying/view-vue';

const field = inject(PI_VIEW_FIELD_TOKEN)!;
```

> **Note**: both Vue 2 and Vue 3 are supported; Vue 2 uses the `@piying/view-vue2-legacy` package.

### Binding CVA / CVAA

```typescript
import { useControlValueAccessor } from '@piying/view-vue';

const {
  cva,
  cvaa: { value, valueChange, disabled, touchedChange },
} = useControlValueAccessor();

defineExpose({ cva });
```

### signalToRef — converting signals to refs

Vue uses `ref` as its reactive primitive, so Piying-View provides the `signalToRef` helper:

```typescript
import { signalToRef } from '@piying/view-vue';

const inputs = signalToRef(() => props.field.inputs());
const outputs = signalToRef(() => props.field.outputs());
const renderConfig = signalToRef(() => props.field.renderConfig());
const attributes = signalToRef(() => props.field.attributes());
const wrappers = signalToRef(() => props.field.wrappers());
```

---

## React Differences

### Getting the Field Token

```typescript
import { PI_VIEW_FIELD_TOKEN } from '@piying/view-react';
import { useContext } from 'react';

const field = useContext(PI_VIEW_FIELD_TOKEN);
```

### Binding CVA / CVAA

React exposes the CVA instance through `useImperativeHandle`:

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

### useSignalToRef — converting signals to refs

Values received by React components must go through `useSignalToRef` to support dynamic updates:

```typescript
import { useSignalToRef } from '@piying/view-react';

const inputs = useSignalToRef(props.field, (field) => field.inputs());
const outputs = useSignalToRef(props.field, (field) => field.outputs());
const renderConfig = useSignalToRef(props.field, (field) => field.renderConfig());
const attributes = useSignalToRef(props.field, (field) => field.attributes());
const wrappers = useSignalToRef(props.field, (field) => field.wrappers());
```

---

## Solid Differences

### Getting the Field Token

```typescript
import { PI_VIEW_FIELD_TOKEN } from '@piying/view-solid';
import { useContext } from 'solid-js';

const field = useContext(PI_VIEW_FIELD_TOKEN);
```

### Binding CVA / CVAA

Solid implements CVA binding with `createMemo`:

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

### createSignalConvert — signal conversion

Solid has its own signal system, and Piying-View adapts it through `createSignalConvert`:

```typescript
import { createSignalConvert } from '@piying/view-solid';

const inputs = createSignalConvert(() => field.inputs());
const outputs = createSignalConvert(() => field.outputs());
const renderConfig = createSignalConvert(() => field.renderConfig());
const attributes = createSignalConvert(() => field.attributes());
const wrappers = createSignalConvert(() => field.wrappers());
```

---

## Svelte Differences

### Getting the Field Token

```typescript
import { PI_VIEW_FIELD_TOKEN } from '@piying/view-svelte';
import { getContext } from 'svelte';

const field = getContext(PI_VIEW_FIELD_TOKEN);
```

> **Note**: Svelte uses `getContext` instead of dependency injection; the Field Token must be provided by a parent component with `setContext`.

### Binding CVA / CVAA

Svelte exports the CVA with `export`:

```typescript
import { useControlValueAccessor } from '@piying/view-svelte';

const { cva, cvaa } = useControlValueAccessor();
export { cva };
```

Used in the template:

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

### signalToState — signal conversion

Svelte uses runes (`$:`) as its reactivity system, and Piying-View provides `signalToState`:

```typescript
import { signalToState } from '@piying/view-svelte';

const inputs = signalToState(() => field().inputs());
const outputs = signalToState(() => field().outputs());
const renderConfig = signalToState(() => field().renderConfig());
const attributes = signalToState(() => field().attributes());
const wrappers = signalToState(() => field().wrappers());
```

---

## Cross-Framework Concepts

These concepts are identical in every framework and require no schema changes:

- **Actions** (`setComponent`, `formConfig`, `actions.*`, ...) are used the same way
- **Valibot schemas** are defined the same way
- The **Field configuration object** has the same shape (attributes, inputs, outputs, events, wrappers, children)
- **Path query** syntax (`#`, `..`, `@alias`, `['aa','bb']`) is identical
- The **validation system** stays decoupled from components everywhere

The differences are limited to:

1. The framework-specific **way of getting the Field Token**
2. The framework-specific **CVA/CVAA binding mechanism**
3. The framework-specific **signal/reactivity conversion helpers**

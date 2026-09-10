---
title: "models — Two-way Model Binding"
---

This page explains how to establish **two-way model binding** for a field component through `actions.models`, connecting the component's internal `model` input/output to an external signal.

## Concept

`actions.models` resembles `inputs` but is dedicated to **two-way binding** (Angular's `ngModel` / `model()`, Vue's `v-model`, ...). Its configuration value is a `Record<string, WritableSignal<any>>` where each key maps to one model input of the component.

```typescript
type ViewModels = Record<string, WritableSignal<any>>;
```

When the component fires the model change event, the external signal updates automatically; conversely, changes to the external signal propagate into the component. This is a real **two-way data flow**, whereas `inputs` is one-way.

## actions.models.set — set a model (replace)

```typescript
import { signal } from '@angular/core';
import { actions } from '@piying/view-angular-core';

const count = signal(0);

const schema = v.pipe(
  NFCSchema,
  setComponent(MyCounterComponent),
  actions.models.set({
    count, // bind the external signal to the component's count model
  }),
);
```

## actions.models.patch — merge models

Merges new key/value pairs into the existing models:

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

## actions.models.remove — remove models

```typescript
const schema = v.pipe(
  NFCSchema,
  setComponent(MyComponent),
  actions.models.patch({ input1: a, input2: b }),
  actions.models.remove(['input1']), // remove the input1 binding
);
```

## actions.models.patchAsync — asynchronous model binding

Creates model bindings dynamically from the field reference:

```typescript
const schema = v.pipe(
  NFCSchema,
  setComponent(MyComponent),
  actions.models.patchAsync({
    input1: (field) => signal(field.form.control?.value),
  }),
);
```

## actions.models.mapAsync — dynamic model mapping

Applies a functional transform to the existing models:

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

## Implementing Models in the Component

### Angular

A component exposes a model input either with an `@Input()` / `@Output()` pair or with `model()`:

```typescript
// style 1: @Input() + @Output() pair
@Component({ ... })
export class MyComponent {
  input1 = input(0);           // @Input() input
  input1Change = output<number>(); // @Output() change event (input1Change)
}

// style 2: model() syntax (recommended)
@Component({ ... })
export class MyComponent {
  input2 = model(0); // Angular signal model(), generates input2Change automatically
}
```

### Other Frameworks

Vue / React / Solid / Svelte each have their own two-way model mechanism; `actions.models` is used the same way and only the component side differs.

## models vs inputs

| Feature | `inputs` | `models` |
|------|----------|----------|
| Data flow | One-way (parent → component) | Two-way (parent ⇄ component) |
| Value type | `Record<string, any>` | `Record<string, WritableSignal<any>>` |
| Component side | Plain `@Input()` | `@Input()` + `@Output()` pair / `model()` |
| Use case | Static / read-only configuration | Two-way bound form values, toggle state, etc. |

## Full Example

```typescript
import { signal } from '@angular/core';
import * as v from 'valibot';
import { actions, NFCSchema, setComponent } from '@piying/view-angular-core';
import { ToggleComponent } from './toggle.component';

// external state
const enabled = signal(false);

const schema = v.pipe(
  NFCSchema,
  setComponent(ToggleComponent),
  actions.models.patch({
    checked: enabled, // two-way binding: toggling the switch updates enabled
  }),
);
```

## Next Steps

- [API: inputs](en/api/inputs/) — setting component inputs (one-way)
- [API: outputs](en/api/outputs/) — setting component outputs
- [API: props](en/api/props/) — generic property configuration

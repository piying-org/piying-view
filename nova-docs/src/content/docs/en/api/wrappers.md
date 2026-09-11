---
title: "Wrappers — Wrapper Configuration"
---



This page covers the wrapper Actions (set/patch/remove/patchAsync) and how to write custom wrapper components.

## actions.wrappers — wrapper operations

### set — set the wrapper list

Sets the given wrapper list as the field's wrappers (replacing existing values):

```typescript
import { actions } from '@piying/view-angular-core';

// string reference
const schema1 = v.pipe(
  v.string(),
  actions.wrappers.set(['card', 'fieldset']),
);

// object form, inputs may be provided
const schema2 = v.pipe(
  v.string(),
  actions.wrappers.set([
    { type: 'card', inputs: { title: 'Card title' } },
    'fieldset',
  ]),
);
```

### patch — append wrappers (keeps existing ones)

`set` clears the list first; `patch` appends to the end of the existing list:

```typescript
const schema = v.pipe(
  v.string(),
  actions.wrappers.set(['card']),
  actions.wrappers.patch(['fieldset']), // result: ['card', 'fieldset']
);
```

### patchAsync — add wrappers asynchronously

Appends a new wrapper to the end of the list, or inserts it at a given index:

```typescript
const schema = v.pipe(
  v.string(),
  actions.wrappers.patchAsync('w1'),                          // append to the end
  actions.wrappers.patchAsync('w2', undefined, { insertIndex: 0 }),  // insert at the start
);

// wrappers = ['w2', 'w1']
```

### changeAsync — modify an existing wrapper

Receives a locator function (its argument is the list of input Signals of the current wrappers; it returns the data source of the target wrapper) and the actions to apply:

```typescript
const schema = v.pipe(
  v.string(),
  actions.wrappers.set(['card']),
  actions.wrappers.changeAsync(
    (wrappers) => wrappers[0], // locate the first wrapper
    [actions.inputs.set({ title: 'New title' })],
  ),
);
```

### remove — remove wrappers

```typescript
const schema = v.pipe(
  v.string(),
  actions.wrappers.set(['w1', 'w2', 'w3']),
  actions.wrappers.remove(['w2']),
);

// wrappers = ['w1', 'w3']
```

## Wrapper Render Order

Wrappers wrap the field from the outside in:

```
[Wrapper0] → [Wrapper1] → [WrapperN] → [Field Component]
```

Each wrapper component renders its inner content (through `InsertFieldDirective`).

## Writing a Custom Wrapper Component

### Wrapper Requirements

A valid wrapper component must:

1. **Extend no base class** — a wrapper is a pure decorator, unlike group components (which extend `PiyingViewGroupBase`)
2. **Import `InsertFieldDirective`** — register it in the `imports` array
3. **Use `<ng-container insertField>`** — as the field insertion point
4. **In V2 mode, wrap the template in `<ng-template #templateRef>`** — read the reference with `viewChild`

### V2 Wrapper Template (recommended)

In V2 mode the whole wrapper UI lives inside `<ng-template #templateRef>`:

```typescript
// card.wrapper.ts
import { Component, viewChild } from '@angular/core';
import { InsertFieldDirective } from '@piying/view-angular';

@Component({
  selector: 'wrapper-card',
  standalone: true,
  imports: [InsertFieldDirective],
  templateUrl: './card.wrapper.html',
})
export class CardWrapperComponent {
  static __version = 2;                          // marks V2 mode
  templateRef = viewChild.required('templateRef');
}
```

The matching template file `card.wrapper.html`:

```html
<ng-template #templateRef>
  <div class="card">
    <h3>{{ title }}</h3>
    <ng-container insertField></ng-container>
  </div>
</ng-template>
```

### V1 Wrapper Template (compatibility)

In V1 mode there is no `<ng-template #templateRef>` wrapper:

```html
<!-- fieldset.wrapper.html -->
<fieldset>
  <legend>{{ legend }}</legend>
  <ng-container insertField></ng-container>
</fieldset>
```

```typescript
// fieldset.wrapper.ts
@Component({
  selector: 'wrapper-fieldset',
  standalone: true,
  imports: [InsertFieldDirective],
  templateUrl: './fieldset.wrapper.html',
})
export class FieldsetWrapperComponent {
  // V1: no templateRef needed and no __version flag
}
```

### Inputs of a Wrapper

Wrapper components receive configuration values through Angular `@Input()` (see the [Inputs/Attributes of Wrapper Components](#inputsattributes-of-wrapper-components) section below).

## V1 vs V2

| Feature | V1 (compatibility) | V2 (recommended) |
|------|-----------|-----------|
| `templateRef` declaration | Not needed | `<ng-template #templateRef>` wraps the whole UI |
| TypeScript | Not needed | `templateRef = viewChild.required('templateRef')` |
| Version flag | No `__version` | `static __version = 2` |
| `<ng-container insertField>` | Written at the top level of the template | Placed inside `<ng-template #templateRef>` |

> **Core similarity**: in both V1 and V2 the field insertion point is `<ng-container insertField>` — the single responsibility of a wrapper.

## Wrapper Configuration

### Registering in fieldGlobalConfig.wrappers

```typescript
options = {
  fieldGlobalConfig: {
    wrappers: {
      card:       { type: CardWrapperComponent },
      fieldset:   { type: FieldsetWrapperComponent },
    },
  },
};
```

### Default Actions of a Wrapper

You can set default Actions for wrappers in `fieldGlobalConfig.wrappers`:

```typescript
options = {
  fieldGlobalConfig: {
    wrappers: {
      card: {
        type: CardWrapperComponent,
        actions: [
          actions.inputs.set({ border: true }),   // default inputs for every card wrapper
        ],
      },
    },
  },
};
```

## Inputs/Attributes of Wrapper Components

Wrappers also support the object form of `actions.wrappers` to provide inputs:

```typescript
const schema = v.pipe(
  v.string(),
  actions.wrappers.set([
    { type: 'card', inputs: { title: 'Custom title', border: false } },
  ]),
);
```

The wrapper component receives these values through Angular `@Input()`.

## Wrapper Authoring Checklist

| Point | Description |
|------|------|
| **Extend no base class** | A wrapper is a pure decorator, unlike groups (`PiyingViewGroupBase`) |
| `imports: [InsertFieldDirective]` | Required, otherwise the `insertField` directive is unavailable |
| V2 wraps the whole UI in `<ng-template #templateRef>` | Read the reference with `viewChild.required('templateRef')` |
| V1 writes `<ng-container insertField>` directly | V1 templates need no templateRef |
| V2 sets `static __version = 2` | Marks the V2 template syntax |
| `<ng-container insertField>` is the insertion point | Never omitted; identical in V1 and V2 |
| Wrappers can nest | One wrapper inside another |

## Next Steps

- [API: path-querying](en/api/path-querying/) — fullPath / keyPath / get() / @alias
- [API: fieldGlobalConfig](en/api/global-config/) — priority system of types/wrappers global configuration
- [formConfig](en/api/form-config/) — details of disabled / emptyValue / deletionMode and more

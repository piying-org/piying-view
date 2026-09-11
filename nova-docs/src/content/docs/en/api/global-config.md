---
title: "fieldGlobalConfig — Global Configuration"
---

`fieldGlobalConfig` is configured inside `options` and provides global defaults for types and wrappers.

## Type Signature

```typescript
interface PiViewConfig {
  types?: Record<string, PiTypeConfig<TComponent>>;
  wrappers?: Record<string, PiWrapperConfig<TWrapperComponent>>;
}

interface PiTypeConfig<TComponent> {
  type?: TComponent;                     // component reference
  actions?: BaseMetadata[];              // default Actions for this type
}

interface PiWrapperConfig<TWrapperComponent> {
  type: TWrapperComponent;               // wrapper component reference (required)
  actions?: RawConfigAction[];           // default Actions for this wrapper
}
```

## types — global type map

`types` maps type names (string keys) to component configurations:

```typescript
options = {
  fieldGlobalConfig: {
    types: {
      // built-in types
      string:     { type: TextInputComponent },
      number:     { type: NumberInputComponent },
      boolean:    { type: CheckboxComponent },
      object:     { type: PiyingViewGroup },
      array:      { type: PiyingViewGroup },
      intersect:  { type: PiyingViewGroup },
      'intersect-group': { type: PiyingViewGroup },
      record:     { type: PiyingViewGroup },

      // custom types
      'my-input':  { type: MyInputComponent },
      'my-group':  { type: MyGroupComponent, actions: [v.title('Group title')] },
    },
  },
};
```

### actions inside types

Configuring `actions` for a `types` entry makes them the **default Actions** of every field of that type, **merged** with the Actions you define:

```typescript
const obj = v.pipe(
  v.string(),
  actions.inputs.patch({ k1: 1 }),   // user-defined Actions
  setComponent('test1'),
);

options = {
  fieldGlobalConfig: {
    types: {
      test1: {
        type: Test1Component,
        actions: [actions.inputs.set({ k2: 2 })],   // global default Actions
      },
    },
  },
};

// merged result: [...globalActions, ...defineActions]
// = [{k2: 2}, {k1: 1}]
// result.inputs() = {k2: 2, k1: 1}
```

**The global default Actions (`k2: 2`) run first, the user-defined Actions (`k1: 1`) afterwards.**

## wrappers — global wrapper registration

`wrappers` registers wrapper components that can be referenced from the schema:

```typescript
options = {
  fieldGlobalConfig: {
    wrappers: {
      card:        { type: CardWrapperComponent },
      fieldset:    { type: FieldsetWrapperComponent },
      panel:       { type: PanelWrapperComponent, actions: [actions.inputs.set({ bordered: true })] },
    },
  },
};
```

### actions inside wrappers

Configuring `actions` for a `wrappers` entry applies them automatically whenever the wrapper is referenced; they **target the wrapper component itself** (not the wrapped field component):

```typescript
const schema = v.pipe(
  v.string(),
  actions.wrappers.set(['panel']),   // reference the 'panel' wrapper
);

// the panel wrapper automatically carries wrappers.panel.actions, setting the panel component's own properties
```

## Priority System

### Component type resolution priority (highest first)

| Priority | Source | Description |
|--------|------|------|
| 1 (highest) | `setComponent(MyComponent)` | Component class passed directly, no types lookup |
| 2 | `setComponent('key')` + schema Actions | type key explicitly specified in the schema |


### Actions merge rules

Actions are merged as **arrays**: `[...globalActions, ...defineActions]` — global defaults first, user-defined Actions afterwards.

```
Global default Actions (types[].actions / wrappers[].actions)
    +
User-defined Actions (schema Actions declared in the v.pipe chain)
    =
Final Actions list = [...globalActions, ...defineActions]
```

In other words: **user-defined Actions run after the global defaults**, which gives them the higher priority.

### Wrapper component lookup priority

| Condition | Behaviour |
|------|------|
| Wrapper is an object `{ type, inputs }` | The `type` property is used directly |
| Wrapper is a string | Looked up in `fieldGlobalConfig.wrappers[key]`; throws when missing |

```typescript
// error: 'unknown-wrapper' is not in fieldGlobalConfig.wrappers
actions.wrappers.set(['unknown-wrapper']);
// → Error: 🈳wrapper:[unknown-wrapper]❗
```

## fieldGlobalConfig and Schema Actions

```
setComponent('key') + actions in the schema
    │
    ▼
Look up fieldGlobalConfig.types[key]
    │
    ├── type → component class (used for rendering)
    └── actions → merged into the field's Actions list
                  final = [...globalActions, ...defineActions]
```

**Key points**:
- `actions` in `fieldGlobalConfig.types` are **array-merged** with user-defined Actions, not replacing them
- Global default Actions come first (`...globalActions`), user-defined Actions after (`...defineActions`)
- `types[].actions` sets the default behaviour for every field of the same type

## Common Configuration Patterns

### Pattern 1: minimal setup (component map only)

> **Note**: each value of `types` must be an object of the form `{ type: Component }`; you cannot pass a component class directly.

```typescript
options = {
  fieldGlobalConfig: {
    types: {
      string: { type: TextInputComponent },
      number: { type: TextInputComponent },
      object: { type: PiyingViewGroup },
    },
  },
};
```

### Pattern 2: with default Actions

```typescript
options = {
  fieldGlobalConfig: {
    types: {
      string: { type: TextInputComponent },
      'custom': {
        type: CustomComponent,
        actions: [v.title('Custom title'), actions.inputs.set({ variant: 'outlined' })],
      },
    },
    wrappers: {
      card: {
        type: CardWrapperComponent,
        actions: [actions.class.top('card-wrapper')],
      },
    },
  },
};
```

### Pattern 3: full production setup

```typescript
options = {
  context: { userId: '123' },
  fieldGlobalConfig: {
    types: {
      string:   { type: TextInputComponent },
      number:   { type: NumberInputComponent },
      boolean:  { type: CheckboxComponent },
      object:   { type: PiyingViewGroup },
      array:    { type: PiyingViewGroup },
      record:   { type: PiyingViewGroup },

      'input':     { type: InputComponent, actions: [actions.class.top('form-field')] },
      'textarea':  { type: TextareaComponent },
      'select':    { type: SelectComponent },
      'date':      { type: DatePickerComponent },
    },
    wrappers: {
      card:     { type: CardWrapperComponent },
      fieldset: { type: FieldsetWrapperComponent },
      section:  { type: SectionWrapperComponent, actions: [actions.inputs.set({ bordered: false })] },
    },
  },
};
```

## Getting Started

- [Options Configuration](en/getting-started/options-config/) — introduction to context / fieldGlobalConfig / builder

## Next Steps

- [Scenario: asControl / asVirtualGroup](en/scenarios/as-control-group/) — treating a Group as a single control
- [API: setComponent](en/api/setcomponent/) — details of component registration
- [Quick Start](en/getting-started/quick-start/) — building from scratch

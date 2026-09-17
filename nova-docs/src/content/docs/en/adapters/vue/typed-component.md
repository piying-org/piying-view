---
title: "Vue Typed Components (typedComponent)"
---

`typedComponent` is a **strongly typed** `setComponent` wrapper provided by the Vue package (`@piying/view-vue`). It derives the component's input prop types from the types you registered in `fieldGlobalConfig`, giving `actions.inputs` full type checking and autocompletion while you write the schema.

## Why typedComponent

When using `setComponent` / `actions.inputs.set` directly, the `inputs` values are `Record<string, any>` with no type constraints. `typedComponent` **derives the input field names and value types** from the component type you registered, so the editor reports an error as you type.

```typescript
import { typedComponent } from '@piying/view-vue';
import { markRaw } from 'vue';
import InputsTest from './component/inputs-test.vue';

const typeDefine = typedComponent({
  types: {
    string: { type: markRaw(InputsTest) },
  },
});

// setComponent('string', (actions) => [...] )
// actions.inputs infers the props type of the InputsTest component
const result = typeDefine.setComponent('string', (actions) => [
  actions.inputs.patch({ value1: '1' }),
  actions.inputs.patch({ value1: '1', value2: 2 }),
  actions.inputs.set({ value1: '1', value2: 2 }),
  actions.inputs.remove(['value1', 'value2']),
  actions.inputs.patchAsync({ value1: async () => '1' }),
]);
```

## Three Usage Styles

### 1. Reference by type key (recommended)

Pass the `fieldGlobalConfig` options to `typedComponent`, then reference the type with `setComponent('typeKey', fn)`:

```typescript
const typeDefine = typedComponent({
  types: {
    string: { type: markRaw(InputsTest) },
    number: { type: NumberInput },
  },
});

const schema = v.object({
  name: typeDefine.setComponent('string', (actions) => [
    actions.inputs.patch({ value1: '1' }),
  ]),
});
```

`actions.inputs` is now typed as the props of `InputsTest`, so a wrong field name or type is a compile error.

### 2. Declaring default Actions with `types[].actions`

When a type declares `actions` inside `types`, `typedComponent` understands it too:

```typescript
const typeDefine = typedComponent({
  types: {
    string: { actions: [setComponent(markRaw(InputsTest))] },
  },
});

const schema = typeDefine.setComponent('string', (actions) => [
  actions.inputs.patch({ value1: '1' }),
]);
```

### 3. Passing a component directly

Without relying on the `types` config, pass the component straight into `setComponent`:

```typescript
const typeDefine = typedComponent({});

const schema = typeDefine.setComponent(markRaw(InputsTest), (actions) => [
  actions.inputs.patch({ value1: '1', value2: 2 }),
]);
```

## nfcComponent — typed non-field control

`typedComponent` also returns `nfcComponent`, used to create non-form-control (NonFieldControl) components:

```typescript
const typeDefine = typedComponent({
  types: {
    string: { type: markRaw(InputsTest) },
  },
});

const schema = typeDefine.nfcComponent('string', (actions) => [
  actions.inputs.patch({ value1: '1' }),
]);
```

## What the `actions` Argument Gives You

The `actions` argument received by the `fn` callback contains the usual `PresetActions`, and on top of that its `set` / `patch` / `patchAsync` / `remove` / `mapAsync` under `inputs` are automatically constrained to the registered component's `$props` (excluding VNodeProps / AllowedComponentProps) — field names and value types.

## Using `markRaw`

In Vue, component objects are proxied by the reactivity system by default. When registering them into a schema, wrap them with `markRaw()` to avoid unnecessary reactive wrapping:

```typescript
import { markRaw } from 'vue';
import InputsTest from './component/inputs-test.vue';

const typeDefine = typedComponent({
  types: {
    string: { type: markRaw(InputsTest) },
  },
});
```

## Next Steps

- [Framework Differences](en/getting-started/framework-differences/) — Vue's Field Token / CVA binding
- [Basic Field Definition](en/scenarios/basic-field/) — using setComponent / formConfig
- [API: setComponent](en/api/setcomponent/) — details of component registration

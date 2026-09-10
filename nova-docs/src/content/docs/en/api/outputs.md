---
title: "outputs — Setting Component Output Events"
---



This page explains how to set output events (outputs) of a field component through Actions.

## actions.outputs.set — set event handlers

```typescript
const schema = v.pipe(
  v.string(),
  actions.outputs.set({
    change: (value: any) => console.log('change:', value),
  }),
);
```

## actions.outputs.patch — merge event handlers

```typescript
const schema = v.pipe(
  v.string(),
  actions.outputs.set({ change: handleChange }),
  actions.outputs.patch({ blur: handleBlur }),
);
```

## actions.outputs.remove — remove event handlers

```typescript
const schema = v.pipe(
  v.string(),
  actions.outputs.set({ change: handleChange, blur: handleBlur }),
  actions.outputs.remove(['change']),
);

// final outputs = { blur: handleBlur }
```

## actions.outputs.patchAsync — asynchronous event handlers

Creates event handlers dynamically from the field reference:

```typescript
const schema = v.pipe(
  v.string(),
  actions.outputs.patchAsync({
    change: (field) => (value: any) => {
      console.log('field:', field);
      console.log('value:', value);
    },
  }),
);
```

## actions.outputs.merge — stacking event handlers

Unlike `patch`, which **overrides** handlers under the same key, `merge` **stacks** them: both the old and the new handler run (old first):

```typescript
const schema = v.pipe(
  v.string(),
  actions.outputs.set({ change: handleChange }),
  actions.outputs.merge({ change: handleChange2 }), // when change fires, handleChange runs first, then handleChange2
);
```

## actions.outputs.mergeAsync — stacking asynchronous event handlers

Curried form `(field) => (...args) => void`; the handler is created dynamically from `field`, after all fields are resolved, and stacked onto the existing ones:

```typescript
const schema = v.pipe(
  v.string(),
  actions.outputs.mergeAsync({
    change: (field) => (value: any) => {
      console.log('field:', field, 'value:', value);
    },
  }),
);
```

## actions.outputs.mapAsync — mapping event handlers dynamically

Receives `field` and returns a transform function that maps over all existing outputs:

```typescript
const schema = v.pipe(
  v.string(),
  actions.outputs.set({ change: handleChange }),
  actions.outputs.mapAsync((field) => (outputs) => ({
    ...outputs,
    change: (value: any) => {
      // wrap the original handler with extra logic
      outputs.change?.(value);
    },
  })),
);
```

## Full Validation Example

> The examples below are excerpted from the unit tests (`createBuilder` is an internal test utility, not a public API).

### Outputs Operation Chain

```typescript
let fn1CallCount = 0;
const fn = (value: any) => { fn1CallCount++; };
const fn2 = (value: any) => { /* ... */ };

const obj = v.pipe(
  v.string(),
  actions.outputs.set({ change: fn }),
  actions.outputs.patch({ blur: fn2 }),
  actions.outputs.remove(['change']),
  setComponent('mock-input'),
);

const resolved = createBuilder(obj);
expect(Object.keys(resolved.outputs())).toEqual(['blur']);
```

## Next Steps

- [API: events](en/api/events/) — DOM event handling
- [API: inputs](en/api/inputs/) — setting component inputs
- [API: Wrappers](en/api/wrappers/) — complete wrapper guide

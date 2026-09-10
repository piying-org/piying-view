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

## Full Validation Example

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

const resolved = createBuilder(resolved.outputs());
expect(Object.keys(resolved.outputs())).toEqual(['blur']);
```

## Next Steps

- [API: events](en/api/events/) — DOM event handling
- [API: inputs](en/api/inputs/) — setting component inputs
- [API: Wrappers](en/api/wrappers/) — complete wrapper guide

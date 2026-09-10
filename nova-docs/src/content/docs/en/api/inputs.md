---
title: "inputs — Setting Component Inputs"
---



This page explains how to set input properties (inputs) of a field component through Actions.

## actions.inputs.set — set input values

Sets the input values to the given object (replacing existing values):

```typescript
import { actions } from '@piying/view-angular-core';

const schema = v.pipe(
  v.string(),
  actions.inputs.set({
    placeholder: 'Please enter a name',
    maxLength: 50,
  }),
);
```

## actions.inputs.patch — merge input values

Merges new key/value pairs into the existing inputs:

```typescript
const schema = v.pipe(
  v.string(),
  actions.inputs.set({ placeholder: 'Please enter' }),
  actions.inputs.patch({ maxLength: 50 }),
);

// final inputs = { placeholder: 'Please enter', maxLength: 50 }
```

## actions.inputs.remove — remove input keys

```typescript
const schema = v.pipe(
  v.string(),
  actions.inputs.set({ placeholder: 'Please enter', maxLength: 50 }),
  actions.inputs.remove(['placeholder']),
);

// final inputs = { maxLength: 50 }
```

## actions.inputs.patchAsync — dynamic (asynchronous) values

Supports returning a `Promise` / `Observable` / `Signal` / plain value — handy for asynchronous data:

```typescript
import { actions } from '@piying/view-angular-core';
import { BehaviorSubject } from 'rxjs';

// plain value
v.pipe(NFCSchema, setComponent('button'), actions.inputs.patchAsync({ content: () => '1' }));

// Observable (timed updates)
v.pipe(
  NFCSchema,
  setComponent('button'),
  actions.inputs.patchAsync({
    content: () => {
      const ob = new BehaviorSubject(0);
      const id = setInterval(() => {
        ob.next(ob.value + 1);
        if (ob.value === 10) {
          clearInterval(id);
        }
      }, 500);
      return ob;
    },
  }),
);
```

## actions.inputs.mapAsync — mapping input values

Takes the `field` argument and returns a transform function applied to every input value:

```typescript
v.pipe(
  NFCSchema,
  setComponent('button'),
  actions.props.patch({ value: '1' }),
  actions.inputs.mapAsync((field) => {
    return (value) => ({
      ...value,
      content: field.props()['value'], // read a dynamic value from props
    });
  }),
);
```

## Full Validation Example

> The examples below are excerpted from the unit tests (`createBuilder` is an internal test utility, not a public API).

### Inputs Operation Chain

```typescript
import * as v from 'valibot';
import { actions, setComponent } from '@piying/view-angular-core';

const obj = v.pipe(
  v.string(),
  actions.inputs.set({ placeholder: 'Please enter', maxLength: 50 }),
  actions.inputs.patch({ disabled: false }),
  actions.inputs.remove(['placeholder']),
  setComponent('my-input'),
);

const resolved = createBuilder(obj);
expect(resolved.inputs()).toEqual({ maxLength: 50, disabled: false });
```

## Next Steps

- [API: outputs](en/api/outputs/) — setting component outputs
- [API: attributes](en/api/attributes/) — setting HTML attributes
- [API: Wrappers](en/api/wrappers/) — complete wrapper guide

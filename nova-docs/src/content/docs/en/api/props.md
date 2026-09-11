---
title: "props — Generic Properties"
---



This page covers Props and the set / patch / patchAsync / remove / mapAsync methods of Actions.

## actions.props.set — set props

```typescript
import { actions } from '@piying/view-angular-core';

const schema = v.pipe(v.string(), actions.props.set({ customKey: 'customValue', theme: 'dark' }));
```

## actions.props.patch — merge props

```typescript
const schema = v.pipe(v.string(), actions.props.patch({ dataId: '123' }));
// props = { customKey: 'customValue', theme: 'dark', dataId: '123' }
```

## actions.props.mapAsync — dynamic props mapping

```typescript
const schema = v.pipe(
  v.string(),
  actions.props.patch({ value: '1' }),
  actions.props.mapAsync((field) => {
    return (value) => ({
      ...value,
      content: field.props()['value'],
    });
  }),
);
```

## actions.props.patchAsync — asynchronous props values

Creates props values dynamically from the field reference:

```typescript
const schema = v.pipe(
  v.string(),
  actions.props.patchAsync({
    dynamicKey: (field) => field.form.control?.value ?? '',
  }),
);
```

## actions.props.remove — remove props keys

```typescript
const schema = v.pipe(
  v.string(),
  actions.props.set({ customKey: 'customValue', theme: 'dark' }),
  actions.props.remove(['theme']),
);

// final props = { customKey: 'customValue' }
```

## Using Props

Props are the generic property key of the configuration, usable in the current component and its wrappers. In principle `props` could do everything (given a good definition), but for better semantics Piying-View splits properties into several kinds (Attributes / Events / Inputs / Outputs / Props). Pick whatever fits your case.

Components read props through `field.props()`. In Angular, inject `PI_VIEW_FIELD_TOKEN` and then access `field.props()`.

## Next Steps

- [API: providers](en/api/providers/) — injecting business services
- [formConfig](en/api/form-config/) — details of disabled / emptyValue / deletionMode and more

---
title: "attributes — Setting HTML Attributes"
---



This page explains how to set the HTML attributes of a field through Actions.

## actions.attributes.set — set attribute values

Sets the given object as the field's HTML attributes:

```typescript
import { actions } from '@piying/view-angular-core';

const schema = v.pipe(
  v.string(),
  actions.attributes.set({
    'data-testid': 'username-field',
    'aria-label': 'Please enter your username',
    autocomplete: 'username',
  }),
);
```

## actions.attributes.patch — merge attribute values

Merges new key/value pairs into the existing attributes:

```typescript
const schema = v.pipe(
  v.string(),
  actions.attributes.set({ 'data-testid': 'name' }),
  actions.attributes.patch({ readonly: true }),
);

// final attributes = { 'data-testid': 'name', readonly: true }
```

## actions.attributes.remove — remove attribute keys

```typescript
const schema = v.pipe(
  v.string(),
  actions.attributes.set({ 'data-testid': 'name', autocomplete: 'on' }),
  actions.attributes.remove(['autocomplete']),
);

// final attributes = { 'data-testid': 'name' }
```

## actions.attributes.patchAsync — asynchronous attribute values

Creates attribute values asynchronously from the field reference:

```typescript
const schema = v.pipe(
  v.string(),
  actions.attributes.patchAsync({
    'data-value': (field) => field.form.control?.value ?? '',
  }),
);
```

## attributes vs inputs

| Feature | `inputs` | `attributes` |
|------|---------|-------------|
| Target | The component's `@Input()` properties | Native HTML attributes |
| Usage | `actions.inputs.set({ placeholder: '...' })` | `actions.attributes.set({ 'data-testid': '...' })` |
| Binding | Angular property binding `[inputName]` | Direct HTML attribute assignment |
| Use case | Passing data between components | DOM attributes, ARIA labels, custom data-* |

## Full Example

```typescript
import * as v from 'valibot';
import { actions, setComponent } from '@piying/view-angular-core';

const schema = v.object({
  username: v.pipe(
    v.string(),
    setComponent('input'),
    
    // component input properties
    actions.inputs.set({
      label: 'Username',
      placeholder: 'Enter 2-20 characters',
    }),

    // HTML attributes
    actions.attributes.set({
      'data-testid': 'username-input',
      'aria-required': 'true',
      autocomplete: 'username',
    }),
  ),

  email: v.pipe(
    v.string(),
    setComponent('input'),
    actions.inputs.set({ type: 'email' }),
    actions.attributes.set({
      'aria-label': 'Email address',
    }),
  ),
});
```

## Next Steps

- [API: CSS class](en/api/css-class/) — setting CSS classes
- [API: layout](en/api/layout/) — adjusting layout with keyPath / priority
- [API: inputs](en/api/inputs/) — setting component inputs

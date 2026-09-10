---
title: "setComponent — Component Registration"
---



`setComponent` chooses the component used to render a field.

## Type Signature

```typescript
function setComponent<T, D>(type: D): D extends string ? DefineTypeAction<T> : RawConfigAction<'viewRawConfig', T, AnyCoreSchemaHandle>;
```

## Usage 1: String Reference (recommended)

Reference a registered component type by its key in `fieldGlobalConfig.types`:

```typescript
import * as v from 'valibot';
import { setComponent } from '@piying/view-angular-core';

const schema = v.object({
  name: v.pipe(
    v.string(),
    setComponent('my-input'), // references fieldGlobalConfig.types['my-input']
  ),
});
```

The matching options configuration:

```typescript
options = {
  fieldGlobalConfig: {
    types: {
      'my-input': { type: MyInputComponent },
    },
  },
};
```

### Working with fieldGlobalConfig.types

The key given to `setComponent('key')` must exist in `fieldGlobalConfig.types`:

```typescript
const schema = v.object({
  field1: v.pipe(v.string(), setComponent('custom-type')),
});

options = {
  fieldGlobalConfig: {
    types: {
      'custom-type': {
        type: CustomComponent,
        actions: [v.title('Default title')], // default Actions for every field of this type
      },
    },
  },
};
```

## Usage 2: Passing a Component Class

Pass the component constructor directly without relying on `fieldGlobalConfig.types`:

```typescript
const schema = v.object({
  name: v.pipe(
    v.string(),
    setComponent(MyInputComponent), // reference the component class directly
  ),
});
```

No registration in `fieldGlobalConfig.types` is needed in that case.

## Relationship with Built-in Type Names

When a field does not specify a type through `setComponent()`, Piying-View uses the raw Valibot schema type name as the default key:

| Schema type       | Default key          |
| --------------- | ------------------- |
| `v.string()`    | `'string'`          |
| `v.number()`    | `'number'`          |
| `v.boolean()`   | `'boolean'`         |
| `v.object()`    | `'object'`          |
| `v.array()`     | `'array'`           |
| `v.intersect()` | `'intersect'`       |
| `v.record()`    | `'record'`          |

> **Note**: `'intersect-group'` is not the default key of `v.intersect()`. The type only becomes `'intersect-group'` when `v.intersect()` is combined with `asVirtualGroup()` (see [asControl / asVirtualGroup](en/scenarios/as-control-group/)).

So in the following code, the `name` field looks up `types['string']`:

```typescript
const schema = v.object({
  name: v.string(), // → types['string']
});

options = {
  fieldGlobalConfig: {
    types: {
      string: { type: TextInputComponent },
    },
  },
};
```

## Caveats

- The string reference requires the key to exist in `fieldGlobalConfig.types`, otherwise nothing renders
- Passing a component class is more flexible but loses centralised management
- `setComponent` can be combined with other Actions (`inputs`, `outputs`, `attributes`, ...)

## Next Steps

- [API: inputs](en/api/inputs/) — component inputs
- [API: outputs](en/api/outputs/) — component output events
- [API: events](en/api/events/) — DOM event handling
- [API: attributes](en/api/attributes/) — setting HTML attributes
- [API: CSS class](en/api/css-class/) — setting CSS classes
- [API: global-config](en/api/global-config/) — priority system of global type configuration

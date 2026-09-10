---
title: "Layout metadata — Layout Control"
---



The `layout` Action controls the order and position of fields in the form, letting you change sort priority and move a field to a specific location.

## Field Order Principles

On modern browsers (everything but IE11) the field order follows the definition order; use priority to change it.

## Type Signature

```typescript
function layout<TInput>(value: {
  keyPath?: KeyPath; // target path or special query expression
  priority?: number; // sort weight (smaller comes first)
}): LayoutAction<TInput>;
```

## priority — sort weight

Use `priority` to control field order in `intersect` and other multi-field scenarios:

### Basic Usage

```typescript
import * as v from 'valibot';
import { layout } from '@piying/view-angular-core';

const obj = v.object({
  k1: v.pipe(v.string(), layout({ priority: 1 })), // earlier (smaller weight)
  k2: v.pipe(v.string(), layout({ priority: 2 })), // later (larger weight)
});
```

## keyPath — moving field positions

`keyPath` moves a field to a different location and supports several query expressions.

### '#' — move to the start of the current level

Move a field to the front of its parent:

```typescript
const obj = v.object({
  input0: v.string(),
  input1: v.pipe(
    v.string(),
    layout({ keyPath: ['#'] }), // move to the start of the root level
  ),
});
```

### '..' — moving across levels

Move a field to a position in an ancestor level:

```typescript
const obj = v.object({
  k1: v.string(),
  o1: v.object({
    k2: v.pipe(
      v.string(),
      layout({ keyPath: ['..', '..'] }), // move to the root level
    ),
  }),
  k3: v.string(),
});
```

### '@alias' — locating by alias

Combine with `setAlias` to move a field to the position of an alias:

```typescript
import { layout, setAlias } from '@piying/view-angular-core';

const obj = v.intersect([
  v.pipe(v.object({}), setAlias('ly1')),
  v.object({
    input0: v.string(),
    input1: v.pipe(
      v.string(),
      layout({ keyPath: ['@ly1'] }), // move inside alias 'ly1'
    ),
  }),
]);
```

### Intersect + Layout Together

Inside `intersect`, layout can completely rearrange the fields:

```typescript
const obj = v.intersect([
  v.pipe(v.object({}), setAlias('scope1')),
  v.object({
    key1: v.pipe(
      v.object({
        test1: v.pipe(v.optional(v.string(), 'value1'), layout({ keyPath: ['@scope1'] })),
      }),
    ),
  }),
]);
```

### Empty Groups After an Intersect Move

When children of an `intersect` are moved out by layout, the group may become empty:

```typescript
const obj = v.intersect([
  v.object({
    data: v.pipe(v.intersect([v.pipe(v.object({}), layout({ priority: 2, keyPath: ['#'] })), v.pipe(v.object({}), layout({ priority: 3, keyPath: ['#'] }))]), asVirtualGroup()),
  }),
]);
```

## KeyPath Query Expressions

| Expression                  | Description       | Example                                  |
| --------------------------- | ---------------- | ---------------------------------------- |
| `undefined` / `[undefined]` | The field itself   | `layout({ keyPath: undefined })`         |
| `'#'`                       | Start of the current parent container | `layout({ keyPath: ['#'] })` |
| `'..'`                      | One level up       | `layout({ keyPath: ['..'] })`            |
| `['..', '..']`              | Two levels up      | `layout({ keyPath: ['..', '..'] })`      |
| `'@alias'`                  | Position of the given alias | `layout({ keyPath: ['#', '@myAlias'] })` |

## Combining priority + keyPath

```typescript
const obj = v.object({
  key1: v.pipe(
    v.object({
      test1: v.pipe(
        v.optional(v.string(), 'value1'),
        layout({ keyPath: ['#'], priority: 2 }), // set position and priority together
      ),
    }),
  ),
});
```

## Examples

```typescript
import * as v from 'valibot';
import { layout, asVirtualGroup, setAlias } from '@piying/view-angular-core';

// normal priority order (smaller comes first)
const obj = v.object({
  k1: v.pipe(v.string(), layout({ priority: 1 })),
  k2: v.pipe(v.string(), layout({ priority: 2 })),
});

// swapped priorities
const obj2 = v.object({
  k1: v.pipe(v.string(), layout({ priority: 2 })),
  k2: v.pipe(v.string(), layout({ priority: 1 })),
});

// keyPath move
const obj3 = v.object({
  input0: v.pipe(v.string()),
  input1: v.pipe(v.string(), layout({ keyPath: ['#'] })),
});
```

## Caveats

- `priority` sorts **ascending — smaller comes first**
- Moving fields with `keyPath` can leave some group/array containers empty; the container stays but has no children
- `@alias` requires the alias to be defined first with `setAlias`
- Layout is most often used inside `intersect` / `union`

## Path Querying Basics

For the KeyPath type definition, `field.get()` usage and resolution rules, see [Path Querying API](en/api/path-querying/).

## Next Steps

- [API: hideWhen/disableWhen](en/api/hide-disable/) — dynamic visibility/availability control
- [API: fieldGlobalConfig](en/api/global-config/) — global configuration priorities

---
title: "Path Querying — KeyPath Basics"
---



This page covers the basics of field path querying in Piying-View. `field.get()` accepts a `KeyPath` and locates a child field. Every Action that relies on path queries (`hideWhen`, `disableWhen`, `layout`, ...) follows the rules documented here.

> **Key note**: `field.get()` can also query non-control fields (plain components); the returned configuration simply has no control reference.

## Basic Usage — Getting a Field by Path

`field.get(path)` accepts a `KeyPath` and returns the target field:

```typescript
// parent field
const parentField = field.get(['..']);
// child field
const nameField = field.get(['name']);

// nested object field
const cityField = field.get(['address', 'city']);

// element inside an array
const firstTag = field.get(['tags', 0]);
const thirdItem = field.get(['items', 2]);
```

> **Use cases**: listen to other fields in the `listen` callback of `hideWhen`, `disableWhen`, `valueChange`; reach other fields from a field.

## KeyPath Query Expressions

When the first element of the path array (KeyPath) is a special expression, it enables relative positioning:

| Expression  | Meaning                            | Example                                      |
| ---------- | -------------------------------- | -------------------------------------------- |
| `'..'`     | Resolves the rest of the path starting from the parent field | `['..']` — the parent of the current field |
|            |                                  | `['..', 'name']` — the `name` child of the parent |
|            |                                  | `['..', '..', 'rootField']` — resolve from the grandparent |
| `'#'`      | Resolves the rest from the root field | `['#', 'name']` — the `name` child of the root field |
| `'@alias'` | Resolves the rest from the aliased field | `['@mySection']` — find the `mySection` alias |
|            |                                  | `['@mySection', 'child']` — child of the aliased field |

### `['aa']` vs `['..', 'aa']` — Sibling Queries Explained

**Important distinction**:

| Expression      | Meaning                                                          |
| -------------- | --------------------------------------------------------------- |
| `['aa']`       | **Always** queries the child named `aa` at the current level |
| `['..', 'aa']` | Jumps to the parent first and queries `aa` there (i.e. a sibling of the current field) |

> `['aa']` always means "child at the current level". To query a sibling you must use `['..', 'aa']`.

### How the Query Expressions Work

Each special expression switches the starting point to the target field and then recursively resolves the rest of the path:

```typescript
// '..' example: resolve from the parent field
field.get(['..']); // → returns the parent field (keyPath.length === level, returned directly)
field.get(['..', 'name']); // → parent.get(['name']), the name child of the parent
field.get(['..', '..', 'rootField']); // → parent.get(['..', 'rootField']) → grandparent.get(['rootField'])

// '#' example: resolve from the root field
field.get(['#']); // → returns the root field
field.get(['#', 'name']); // → root.get(['name']), the name child of the root field

// '@alias' example: resolve from the aliased field
field.get(['@mySection']); // → aliasMap.get('mySection'), returns that aliased field
field.get(['@mySection', 'nested']); // → aliasField.get(['nested']), child of the aliased field
```

> **Note**: both `'#'` and `'@alias'` switch the starting point to the target field (root or alias) and then resolve the rest of the path recursively.

### Example: Listening to a Parent Field

```typescript
// listen to a field under the parent
field.get(['..', 'parentField']);

// listen to a field under the grandparent
field.get(['..', '..', 'rootField']);
```

### Example: Locating with an Alias

`@alias` works together with `setAlias`, pointing the query at the field that carries the alias:

```typescript
import { setAlias } from '@piying/view-angular-core';

// define the alias
const schema = v.pipe(v.object({}), setAlias('mySection'));

// query the field through @alias
field.get(['@mySection']);

// get a child of that alias
field.get(['@mySection', 'childField']);
```

### Example: Locating from the Root Field

`'#'` switches the starting point to the root field, which is how top-level fields are reached across levels:

```typescript
// get the top-level 'name' field from the root
field.get(['#', 'name']);
```

## How '@alias' Lookup Works

### Lookup Priority

`field.get(['@aliasName'])` searches for the alias in this order:

1. **Current scope first** — aliases defined on siblings and descendants match first
2. **Then walk up level by level** — if the current level has no match, parent scopes are queried up to the root (a dedicated Map is usually created when an array is built)

### Real Examples

```typescript
import * as v from 'valibot';
import { setAlias } from '@piying/view-angular-core';

const schema = v.object({
  // root-level alias — reachable from every child field
  header: v.pipe(v.object({ title: v.string() }), setAlias('header')),

  user: v.object({ name: v.string(), email: v.string() }),

  items: v.array(v.pipe(v.object({ label: v.string() }), setAlias('item'))),
});

// the root-level alias is reachable from any field
field.get(['@header']); // → returns the header field configuration

// alias with a sub path — resolve the alias first, then the remaining path from there
field.get(['@header', 'title']); // → header.get(['title'])
```

### Naming Conflicts

Aliases with the same name follow the **nearest wins** rule: if the current scope or its descendants already define the same alias, outer fields with that name are not matched.

---
title: "typedFieldPipe — Path-based Actions"
---

Attach actions to fields by path.

Paths are derived from the schema structure and autocompleted. Inside callbacks, `field` and the value type of that path are exact, the same as `builder.get(path)`.

**Framework-agnostic.** Import it from the core package: `@piying/view-angular-core` for Angular, `@piying/view-core` for Vue / React / Solid / Svelte.

## Input

1. A Valibot schema variable
2. A callback: returns an array of `[path, actions[]]`

## Output

A new schema. The value type is unchanged, it just carries extra actions. **Always use the return value** — the original schema is never mutated.

## Example

```typescript
import * as v from 'valibot';
import { typedFieldPipe } from '@piying/view-core';

const merged = typedFieldPipe(root, (d) => [
  // root node
  d([], [d.props.patchAsync({ rootProp: () => 'ROOT' })]),

  // ['a'] is a string field
  d(['a'], [
    v.minLength(2),
    d.props.patchAsync({
      // field has exactly the type of builder.get(['a'])
      len: (field) => field.form.control!.value.length,
    }),
  ]),

  // array index / nested field
  d(['list', 0, 'c'], [
    d.inputs.patchAsync({ tag: () => 'CTAG' }),
    d.hooks.merge({
      fieldResolved: (field) => console.log(field.fullPath),
    }),
  ]),
]);
```

## Writing paths

A path is an array, autocompleted from the schema structure. If autocomplete cannot produce it, the path is invalid.

| Path | Points at |
| ---- | --------- |
| `[]` | the root node |
| `['a']` | an object field |
| `['outer', 'b']` | a nested object field |
| `['list', 0, 'c']` | a field of array item 0 / a tuple index |
| `['sel', 0, 'x']` | a field inside member 0 of a union / intersect / variant |
| `['[value]']` | the value node of record / map / set, the item of an array |
| `['[key]']` | the key node of record / map |
| `['[rest]']` | the rest node of objectWithRest / tupleWithRest |

> `'#'` `'..'` `'@alias'` cannot be written in a path (the pipe only walks the structure). Use them inside callbacks only: `field.get(['..'])` / `field.get(['#'])` / `field.get(['@ss'])`.

## Action factories

The callback parameter is itself callable as one entry and carries every action factory. The namespaces match `actions` exactly: `props` `inputs` `models` `slots` `attributes` `outputs` `events` `hooks` `providers` `class` `wrappers` `createOptions` `hideWhen` `disableWhen` `valueChange` `outputChange`.

Verb semantics (`set` / `patch` / `patchAsync` / `remove` / `mapAsync` / `merge`) are covered in the [Action Cheatsheet](en/api/action-cheatsheet/).

Official Valibot actions (`v.minLength` / `v.check` / `v.transform` / `v.email` …) can be mixed straight into the actions array; their callbacks receive the exact value type of that path.

## Notes

- **Always use the return value**; the original schema is not modified.
- Call the action factories inside the actions array of this call — storing them in a variable beforehand loses the type context.
- Multiple entries for the same path, or repeated calls of the same factory, all stack up; declared field order is preserved.
- Drilling into a node carrying `fallback` / `cache` is unsupported (it throws).
- This pipe **binds no component**, so `inputs` / `outputs` keys are not checked. For component-narrowed keys and value types, see the component-aware wrapper of your framework.

## Related

- [Action Cheatsheet](en/api/action-cheatsheet/) — all namespaces and verbs
- [Path Querying](en/api/path-querying/) — `#` / `..` / `@alias`

Component-aware wrappers (one per framework, each with its own mapping rules):

- [Angular](en/angular/typed-field-component-pipe/) — `input()` / `output()` / `model()`; the only framework that exposes `models`
- [Vue 3](en/adapters/vue/typed-field-component-pipe/) — split out of `$props`, emit names drop the `on` prefix
- [React](en/adapters/react/typed-field-component-pipe/) — function props are outputs, names kept verbatim
- [Solid](en/adapters/solid/typed-field-component-pipe/) — same shape as React, with `classList` added to the built-in keys
- [Svelte](en/adapters/svelte/typed-field-component-pipe/) — function props are outputs, a Snippet is not

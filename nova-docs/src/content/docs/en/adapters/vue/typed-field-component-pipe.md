---
title: "typedFieldComponentPipe (Vue 3)"
---

Vue 3 only (`@piying/view-vue`). It adds one "component" argument on top of `typedFieldPipe`, so `inputs` / `outputs` keys and value types follow that Vue component.

See [typedFieldPipe](en/api/typed-field-pipe/) for the generic version.

## Input

1. schema
2. `fieldGlobalConfig`
3. A callback: returns an array of `[path, component, actions[]]`

The component slot accepts a key registered in `types`, or the component itself (lazy imports included).

## Output

A new schema where every entry that names a component automatically carries `setComponent(component)`. **Always use the return value** — the original schema is never mutated.

## Example

```typescript
import * as v from 'valibot';
import { markRaw } from 'vue';
import { typedFieldComponentPipe } from '@piying/view-vue';
import AmountInput from './components/amount-input.vue';
import TagPicker from './components/tag-picker.vue';

const fieldGlobalConfig = {
  types: {
    amount: { type: markRaw(AmountInput) },
    tags: { type: markRaw(TagPicker) },
  },
};

const schema = v.object({
  price: v.number(),
  tags: v.array(v.string()),
});

const merged = typedFieldComponentPipe(schema, fieldGlobalConfig, (d) => [
  // AmountInput props: placeholder?: string; precision?: number
  d(['price'], 'amount', [
    d.inputs.patch({ placeholder: 'Enter amount' }),
    d.inputs.patchAsync({ precision: (field) => (field.value > 100 ? 0 : 2) }),
    d.inputs.remove(['placeholder']),
  ]),

  // TagPicker emits: change(value: string[]) / clear()
  d(['tags'], 'tags', [
    d.outputs.merge({ change: (value) => console.log(value) }),
    d.outputs.mergeAsync({ clear: (field) => () => console.log(field.fullPath) }),
    d.outputChange((fn) => fn([{ list: undefined, output: 'change' }])),
  ]),
]);
```

A wrong key (`placehold` instead of `placeholder`) or a wrong value type (`precision` given a string) means **the editor reports an error as you type**, and autocompletion only offers the keys the component actually has — that is what the strong typing is for: catch it while writing, not once it is running.

## Omitting the component

You can drop the second argument entirely (or pass `undefined`). Then **no `setComponent` is emitted** — at runtime the field keeps its own schema `type` (e.g. `string`) and looks up the default component in `types`; the type layer derives the tables from that same `type`, so narrowing still works.

```typescript
const fieldGlobalConfig = {
  types: { string: { type: markRaw(MyInput) } },
};

const merged = typedFieldComponentPipe(schema, fieldGlobalConfig, (d) => [
  d(['name'], [d.inputs.patch({ placeholder: 'default component prop' })]),
  d(['name'], undefined, [d.inputs.patchAsync({ maxlength: () => 20 })]),
]);
```

## Lazy loading

A plain `() => import('./x.vue').then((m) => m.default)` is unwrapped as-is; use `lazyMark()` when you need an explicit marker:

```typescript
import { lazyMark } from '@piying/view-core';

const lazyEmit = () => import('./components/typed-emit.vue').then((m) => m.default);

const fieldGlobalConfig = {
  types: { emit: { type: lazyMark(lazyEmit) } },
};

// inputs / outputs still narrow against the unwrapped component
const merged = typedFieldComponentPipe(schema, fieldGlobalConfig, (d) => [
  d(['e'], 'emit', [d.inputs.patch({ name: 'lazy-name' })]),
]);
```

## attributes / events naming

- Standard `attributes` names come from Vue's `HTMLAttributes`, with **`onXxx` removed** (that is the events namespace's territory). Use `class`, not `className`.
- Custom names (`data-*`, the component's own fallthrough attributes) are always allowed.
- `events` accepts standard DOM event names (`click` / `keydown` …) plus custom event names.

```typescript
d(['price'], 'amount', [
  d.attributes.patch({ class: 'w-full', id: 'price', role: 'spinbutton' }),
  d.attributes.patch({ 'data-x': 1 }),
  d.attributes.top.set({ title: 'top-title' }),
  d.events.patch({ click: (event) => console.log(event.clientX) }),
]);
```

## Degradation

Without a component it falls back to the generic `typedFieldPipe` behavior: `inputs` / `outputs` are plain key / value with no key checking.

## Notes

- **Always use the return value**; the original schema is not modified.
- Call the action factories inside the actions array of this call — storing them in a variable beforehand loses the type context.
- Multiple entries for the same path, or repeated calls of the same factory, all stack up; declared field order is preserved.
- The callback's `field` is read-only: reading values and state, or querying other fields via `field.get()`, all work; config changes go through the returned actions.
- Prefer `markRaw()` when registering components so Vue does not wrap them reactively.

## Related

- [typedFieldPipe](en/api/typed-field-pipe/) — the generic, framework-agnostic version
- [Vue Package API](en/adapters/vue/) — PiyingView / tokens / CVA
- [Action Cheatsheet](en/api/action-cheatsheet/) — all namespaces and verbs

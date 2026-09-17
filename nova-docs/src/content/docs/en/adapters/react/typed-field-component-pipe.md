---
title: "typedFieldComponentPipe (React)"
---

React only (`@piying/view-react`). It adds one "component" argument on top of `typedFieldPipe`, so `inputs` / `outputs` keys and value types follow that React component.

See [typedFieldPipe](en/api/typed-field-pipe/) for the generic version.

## Input

1. schema
2. `fieldGlobalConfig`
3. A callback: returns an array of `[path, component, actions[]]`

The component slot accepts a key registered in `types`, or the component itself (lazy imports included).

## Output

A new schema where every entry that names a component automatically carries `setComponent(component)`. **Always use the return value** — the original schema is never mutated.

## Example

```tsx
import * as v from 'valibot';
import { typedFieldComponentPipe } from '@piying/view-react';
import { AmountInput } from './components/amount-input';
import { TagPicker } from './components/tag-picker';

const fieldGlobalConfig = {
  types: {
    amount: { type: AmountInput },
    tags: { type: TagPicker },
  },
};

const schema = v.object({
  price: v.number(),
  tags: v.array(v.string()),
});

const merged = typedFieldComponentPipe(schema, fieldGlobalConfig, (d) => [
  // AmountInput non-function props: placeholder?: string; precision?: number
  d(['price'], 'amount', [
    d.inputs.patch({ placeholder: 'Enter amount' }),
    d.inputs.patchAsync({ precision: (field) => (field.value > 100 ? 0 : 2) }),
    d.inputs.remove(['placeholder']),
  ]),

  // TagPicker function props: onChange(value: string[]) / onClear()
  d(['tags'], 'tags', [
    d.outputs.merge({ onChange: (value) => console.log(value) }),
    d.outputs.mergeAsync({ onClear: (field) => () => console.log(field.fullPath) }),
    d.outputChange((fn) => fn([{ list: undefined, output: 'onChange' }])),
  ]),
]);
```

Multi-parameter callbacks keep the full tuple too:

```tsx
// component: onRange: (start: number, end: string) => void
d(['num'], 'multi', [
  d.outputs.patch({
    // start / end are inferred from the component type, no manual annotation needed
    onRange: (start, end) => console.log(start, end),
  }),
]);
```

## Omitting the component

Dropping the second argument (or passing `undefined` explicitly) means **no `setComponent` is emitted** — at runtime the field keeps its own schema `type` (e.g. `string`) and looks up the default component in `types`; the type layer derives the tables from that same `type`, so narrowing still works.

```tsx
const fieldGlobalConfig = { types: { string: { type: MyInput } } };

const merged = typedFieldComponentPipe(schema, fieldGlobalConfig, (d) => [
  d(['name'], [d.inputs.patch({ placeholder: 'default component prop' })]),
  d(['name'], undefined, [d.inputs.patchAsync({ maxLength: () => 20 })]),
]);
```

## Lazy loading: must use `React.lazy()`

The React adapter renders the `type` from the config directly and never unwraps a lazy function at runtime, so it must go through `React.lazy()` (the module needs a `default` export):

```tsx
import { lazy } from 'react';

const reactLazyEmit = lazy(() =>
  import('./components/typed-emit').then(({ TypedEmit }) => ({ default: TypedEmit })),
);

const fieldGlobalConfig = { types: { emit: { type: reactLazyEmit } } };

// the type layer still narrows against the unwrapped component
const merged = typedFieldComponentPipe(schema, fieldGlobalConfig, (d) => [
  d(['e'], 'emit', [d.inputs.patch({ name: 'lazy-name' })]),
]);
```

`lazyMark()` is the universal marker, but it only unwraps `() => Promise<Component>` **at the type level**; the React runtime does not consume it, so on its own it will not render.

## attributes / events naming

- Standard `attributes` names come from React's `HTMLAttributes`, with **`onXxx` removed** (that is the events namespace's territory).
- Use **`className`** for the class attribute, not `class`.
- Custom names (`data-*`, the component's own pass-through props) are always allowed.
- `events` accepts standard DOM event names (`click` / `keydown` …) plus custom event names.

```tsx
d(['price'], 'amount', [
  d.attributes.patch({ className: 'w-full', id: 'price', role: 'spinbutton' }),
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
- To get typed output parameters, the component's function props need explicit signatures; `any` props are classified as inputs, not outputs.

## Related

- [typedFieldPipe](en/api/typed-field-pipe/) — the generic, framework-agnostic version
- [React Package API](en/adapters/react/) — tokens / CVA / useSignalToRef
- [Field Model Binding](en/adapters/react/field-model-binding/) — the `use-*Model` family
- [Action Cheatsheet](en/api/action-cheatsheet/) — all namespaces and verbs

---
title: "typedFieldComponentPipe — Component + Field Typing"
---

Angular only (`@piying/view-angular`). It adds one "component" argument on top of `typedFieldPipe`, so `inputs` / `outputs` keys and value types follow that component too.

For the generic version see [typedFieldPipe](en/api/typed-field-pipe/).

## Input

1. schema
2. Component config: the `fieldGlobalConfig` itself, or the result of `typedComponent({ types: { ... } })`
3. A callback: returns an array of `[path, component, actions[]]`

One extra "component" argument compared to the generic version. Pass a key from `types` or the component class itself.

## Output

A new schema where every entry automatically carries `setComponent(component)`, so "the type used for validation" is exactly "the component that renders". **Always use the return value** — the original schema is never mutated.

## Example

```typescript
import * as v from 'valibot';
import { typedComponent, typedFieldComponentPipe } from '@piying/view-angular';

const typeDefine = typedComponent({
  types: {
    test1: { type: Test1Component },
    emit1: { type: Emit1Component },
  },
});

const merged = typedFieldComponentPipe(schema, typeDefine, (d) => [
  // component 'test1' → inputs keys are limited to Test1Component's inputs
  d(['num'], 'test1', [
    d.inputs.patch({ input1: 'abc' }),
    d.inputs.patchAsync({ input1: (field) => `field ${field.key}` }),
    d.inputs.remove(['input1']),
    d.inputs.mapAsync((field) => (value) => ({ ...value, input1: 'mapped' })),
  ]),

  // passing the component class works too
  d(['e'], Emit1Component, [
    d.outputs.merge({ output1: (data) => console.log(data) }),
    d.outputs.mergeAsync({
      output1: (field) => (data) => console.log(field.fullPath, data),
    }),
    d.outputChange((fn) => fn([{ list: undefined, output: 'output1' }])),
  ]),
]);
```

The output names watched by `outputChange` are locked to the component of that same entry.

Path syntax and the available action factory namespaces are identical to the generic version — see [typedFieldPipe](en/api/typed-field-pipe/).

## Notes

- **Always use the return value**; the original schema is not modified.
- Call the action factories inside the actions array of this call — storing them in a variable beforehand loses the type context.
- Multiple entries for the same path, or repeated calls of the same factory, all stack up; declared field order is preserved.
- If the component cannot be inferred, nothing is locked out: `inputs` / `outputs` degrade to plain key / value objects, everything else keeps working — only key checking is dropped.
- The callback's `field` is read-only: reading values and state, or querying other fields via `field.get()`, all work; config changes go through the returned actions.

## Related

- [typedFieldPipe](en/api/typed-field-pipe/) — the generic, framework-agnostic version
- [Utilities](en/angular/tools/) — `typedComponent` / `nfcComponent`
- [Action Cheatsheet](en/api/action-cheatsheet/) — all namespaces and verbs

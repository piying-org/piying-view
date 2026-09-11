---
title: "Troubleshooting"
---

This page collects the real runtime error messages produced by Piying-View (including their emoji prefixes) plus the high-frequency "no error, but not what I expected" situations.

## Error Quick Reference

| Error message | Where | Direct cause |
| ------------- | ----- | ------------ |
| `🈳define:[xxx]❗` | Component rendering | The key is missing from `types`, so the component type stayed a string |
| `🈳wrapper:[xxx]❗` | Wrapper lookup | `actions.wrappers` references a wrapper not registered in `fieldGlobalConfig.wrappers` |
| `🏷️ fieldControl❗` | `[formControl]` directive | A Group / Array (non-leaf control) was bound to `[formControl]` |
| `📍 fieldControlBind:[...]->[...]❗` | `[formControl]` directive | The target field has no control at all (non-field-control) |
| `移动视图项失败` ("failed to move view item") | `layout` | The `layout({ keyPath })` target resolves to no parent |
| `change wrapper not found` | `wrappers.changeAsync` | The locator function returned nothing |
| `child index not found` | Path computation | The link between a control and its parent's children broke |
| `action:[xxx]❗` | JSON Schema conversion | A custom action in the JSON was never registered in `customActions` |
| `未知类型:xxx` ("unknown type") | JSON Schema conversion | The JSON Schema `type` is not recognised |
| `options multi conflict` | JSON Schema conversion | Conflicting single-select / multi-select configuration |
| `patternProperties->xxx: 定义未找到` | JSON Schema conversion | `patternProperties` references a missing definition |
| `依赖->xxx: 定义未找到` | JSON Schema conversion | A keyword dependency is missing |

---

## 1. Rendering issues

### 1. `🈳define:[xxx]❗`

**Meaning**: the library received a **string** component definition and could not turn it into a real component.

```
🈳define:[my-input]❗
```

**Checklist**:

1. Was `options.fieldGlobalConfig.types` passed at all?
2. Does the key match `setComponent('my-input')` **exactly** (case-sensitive)?
3. Did you write a bare component class? The value must be a `{ type: Component }` object:

```typescript
// ❌ wrong: bare component class
fieldGlobalConfig: { types: { 'my-input': MyInputComponent } }

// ✅ correct: wrapped in { type }
fieldGlobalConfig: { types: { 'my-input': { type: MyInputComponent } } }
```

### 2. `🈳wrapper:[xxx]❗`

**Meaning**: `actions.wrappers` references a wrapper name that was never registered.

```typescript
actions.wrappers.set(['card']); // 💥 🈳wrapper:[card]❗
```

**Fix**: register a wrapper with the same name in `fieldGlobalConfig.wrappers`.

```typescript
fieldGlobalConfig: {
  wrappers: {
    card: { type: CardWrapperComponent },
  },
}
```

### 3. `change wrapper not found`

Raised by `actions.wrappers.changeAsync(indexFn, actions)` when `indexFn` returns an empty value.

```typescript
// ❌ the field only has one wrapper, so [5] is undefined
actions.wrappers.changeAsync((list) => list[5], [actions.inputs.set({ a: 1 })]);

// ✅ confirm it exists before locating it
actions.wrappers.changeAsync((list) => list[0], [actions.inputs.set({ a: 1 })]);
```

---

## 2. Binding issues (manual mode)

### 4. `🏷️ fieldControl❗`

**Meaning**: `[formControl]` only accepts a **leaf control** (`FieldControl`); you bound a Group or Array.

```html
<!-- ❌ the root field is a FieldGroup -->
<input [formControl]="field()" />
```

**Fix**: use `path` to point at a leaf field.

```html
<input [formControl]="field()" [path]="['name']" />
```

### 5. `📍 fieldControlBind:[a]->[b]❗`

**Meaning**: the path resolves to a field, but that field **has no `form.control`**. Typical causes:

- the field is a **non-field-control** declared via `NFCSchema` / `nonFieldControl()`
- the path is wrong and matched a non-existent field

**Debug it first**:

```typescript
const target = field().get(['b']);
console.log(target?.form.control); // undefined means it is not a form control
```

Non-field-controls should be rendered with `[fieldTemplate]`, not `[formControl]`.

---

## 3. Layout issues

### 6. `移动视图项失败` ("failed to move view item")

**Meaning**: the target position given to `layout({ keyPath })` resolves to no parent.

```typescript
// ❌ the '@section' alias was never declared with setAlias
layout({ keyPath: ['@section'] });
```

**Checklist**:

1. Using `@alias` → confirm the field carries `setAlias('section')`
2. Using `..` → confirm the level actually exists; climbing past the top with `['..','..']` will fail
3. Was the target removed by `hideWhen` / conditional rendering?

> Full `layout` semantics: [API: Layout metadata](en/api/layout/); path rules: [API: Path Querying](en/api/path-querying/).

---

## 4. Value and model issues (no error, but unexpected)

### 7. I typed something but `model` never updates

**This is by design**: `PiyingView` only emits `modelChange` when the **whole form is error-free**.

```typescript
// Library implementation (simplified)
if (result.form.control?.valueNoError$$()) {
  this.modelChange.emit(value);
}
```

So as soon as **any field fails validation**, `[(model)]` stops syncing.

**To observe intermediate values**, listen at the control level instead:

```typescript
import { valueChange } from '@piying/view-angular-core';

v.pipe(
  v.string(),
  valueChange((fn) =>
    fn().subscribe(({ list }) => console.log('live value:', list[0])),
  ),
);
```

Or grab the control directly: `field.form.control.valueChanges`.

### 8. The value of a disabled field "disappeared"

Controlled by the `disabledValue` strategy:

| `disabledValue` | Behaviour when disabled |
| --------------- | ----------------------- |
| `'reserve'` (default) | Keep the value and emit it |
| `'delete'` | Do not emit the field's value |

```typescript
formConfig({ disabled: true, disabledValue: 'delete' });
```

### 9. An empty array / empty object outputs `undefined`

Provide a fallback with `emptyValue`:

```typescript
v.pipe(v.array(v.string()), formConfig({ emptyValue: [] }));
```

### 10. Extra keys in the model get swallowed

Decided by `groupMode` (auto-derived from the schema):

| Schema | `groupMode` | Extra keys |
| ------ | ----------- | ---------- |
| `v.object()` | `default` | Dropped |
| `v.looseObject()` | `loose` | Kept |
| `v.strictObject()` | `strict` | Validation fails |

See [Advanced Object Group Usage](en/scenarios/object-group-advanced/).

---

## 5. Listening issues

### 11. The first callback receives `undefined`

`valueChange` / `hideWhen` / `disableWhen` fire once during initialisation with the initial value, which is `undefined` when no default was set.

**Two fixes**:

```typescript
// Option 1: built-in switch on the Action
hideWhen({
  listen: (fn) =>
    fn({ list: [['..', 'a']], skipInitValue: true }).pipe(map((i) => !i.list[0])),
});

// Option 2: skip it with RxJS
fn({ list: [['..', 'a']] }).pipe(skip(1), map((i) => !i.list[0]));
```

### 12. Cannot listen to the other field

`['aa']` queries a **child of the current level**, not a sibling. To query a sibling you must add `..`:

```typescript
fn({ list: [['aa']] });        // ❌ queries my own child 'aa'
fn({ list: [['..', 'aa']] }); // ✅ queries my sibling 'aa'
```

---

## 6. JSON Schema conversion issues

### 13. `action:[xxx]❗`

The JSON contains `actions: [{ "name": "myAction" }]` but the conversion was not registered:

```typescript
jsonSchemaToValibot(jsonSchema, {
  customActions: {
    myAction: () => v.title('Custom'),
  },
});
```

### 14. `未知类型:xxx` ("unknown type")

The `type` value is outside the supported list (`string` / `number` / `integer` / `boolean` / `null` / `object` / `array`).

### 15. `options multi conflict`

Single-select and multi-select semantics are expressed at the same place; drop the conflicting one.

> For the full set of JSON Schema limitations (mutually exclusive keywords, nesting limits, single-file `$ref`), see [JSON Schema Support](en/getting-started/jsonschema/).

---

## Debugging tips

| Technique | Usage |
| --------- | ----- |
| Inspect the parse result | `console.log(field.origin)` — keeps the raw pre-parse data, debug only |
| Inspect the control | `field.form.control` / `field.form.root` |
| Inspect the status | `control.status$$()` → `'VALID' \| 'INVALID' \| 'PENDING'` |
| Inspect errors | `control.errors` (`undefined` while `PENDING`, which is normal) |
| Query fields | `field.get(['..', 'name'])` / `field.get(['#', 'a', 'b'])` |
| Confirm type resolution | On `🈳define`, print `options.fieldGlobalConfig.types` and check the key |

> ⚠️ `control.errors` returns `undefined` while async validation is running — do not read that as "no errors"; use `status$$()` to tell the difference.

## Related documents

- [Two Usage Modes](en/getting-started/two-modes/) — where automatic and manual mode differ
- [Core Concepts](en/getting-started/core-concept/) — the Schema → Field → Component chain
- [AbstractControl](en/api/control-api/) — value / status / validation API
- [Path Querying](en/api/path-querying/) — the `..` / `#` / `@alias` rules

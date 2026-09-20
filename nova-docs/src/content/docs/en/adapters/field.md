---
title: "PiyingField (Binding)"
---

> 🧭 **Manual mode**: `PiyingField` belongs to mode two (manual binding) of [Two Usage Modes](en/getting-started/two-modes/). It does not render automatically — it only connects "the field's form control" to **a control you wrote yourself**.
>
> 📌 This page covers only the **cross-framework contract** (semantics, props, `cvaa`, error codes).

`PiyingField` (control binding) solves exactly one problem: **you hand-write a native control, but you still want Piying-View's two-way value binding, validation state and disabled state.**

## Export names per framework

| Framework | Export name | Shape |
| --- | --- | --- |
| Vue 3 | `PiyingField` (also exported as `PiyingFieldControlBind`) | Component + default slot |
| React | `PiyingField` | Component + `children` render function |
| Solid | `PiyingField` | Component + `children` render function |
| Svelte | `PiyingField` | Component + `children` snippet |

> ℹ️ Angular is not listed here: it uses the directive `PiyingFieldControlBindDirective` (`selector: '[formControl]'`) on top of Angular's `NG_VALUE_ACCESSOR` machinery — see [Angular Directives](en/angular/directives/).

## Props (identical across frameworks)

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `field` | `PiResolvedViewFieldConfig` | Yes | Field config (the value returned by `convertToField`, or any child field) |
| `path` | `KeyPath` | No | Locate a **leaf** child field of `field` and bind that instead |

## Render scope

| Param | Type | Description |
| --- | --- | --- |
| `cvaa` | `ControlValueAccessorAdapter<value type>` | Control value adapter, see table below |
| `field` | `PiFieldGet<S, P>` | The field the `path` points at (useful for reading errors, etc.) |

Types follow the `path`: with `path={['number1']}`, `cvaa.value` is `number` and `valueChange` only accepts `number`.

## `cvaa` members

| Member | Purpose | React | Vue | Solid | Svelte |
| --- | --- | --- | --- | --- | --- |
| `value` | Current value | `V` (plain value) | `ShallowRef<V>` (needs `unref` in template) | `Accessor<V>` (needs `()`) | `V` (`$state` getter) |
| `disabled` | Disabled state | `boolean` | `Ref<boolean>` | `Accessor<boolean>` | `boolean` |
| `valueChange(v)` | Write the value back and trigger change | ✅ | ✅ | ✅ | ✅ |
| `touchedChange()` | Mark as touched | ✅ | ✅ | ✅ | ✅ |

> The semantics are identical; only the **reactivity shell** differs: React re-renders, Vue uses refs, Solid uses accessors, Svelte uses runes.

## How it works internally

```
PiyingField
  ├── ① Resolve the field: path ? field.get(path) : field
  ├── ② useControlValueAccessor() creates a cva / cvaa pair
  ├── ③ Validate the target: it must have a form.control and be a leaf FieldControl
  ├── ④ createViewControlLink(() => control, cva, injector) establishes the two-way link
  └── ⑤ dispose(true) on unmount releases the link
```

Once the link is established:

- **Model → view**: `control` value changes → `cva.writeValue` → `cvaa.value` updates
- **View → model**: `cvaa.valueChange(v)` → the `onChange` registered on `cva` → `control.viewValueChange(v)` (affected by the `updateOn` strategy)
- **Disabled**: control disabled state → `cva.setDisabledState` → `cvaa.disabled`

## Common errors

| Error message | Cause | Fix |
| --- | --- | --- |
| `📍 fieldControlBind:[a]->[b]❗` | The target field has no `form.control` (marked `nonFieldControl`, or not resolved yet) | Make sure the field really participates in the form; check the `path` |
| `🏷️ fieldControl❗` | The target is not a leaf control but a `FieldGroup` / `FieldArray` / `FieldLogicGroup` | Use `path` to point at a leaf field; for containers use [PiyingFieldTemplate](en/adapters/field-template/) |

## Field vs PiyingFieldTemplate

| Aspect | `PiyingField` | `PiyingFieldTemplate` |
| --- | --- | --- |
| What is rendered | **Your own control** | The component decided by schema metadata |
| Component source | Written by you inside the slot | `setComponent` / `fieldGlobalConfig` |
| Output | `cvaa` (value / disabled / touched) | None (renders the component tree directly) |
| Wrappers applied | ❌ none | ✅ the whole wrapper chain |
| Child field recursion | ❌ leaf only | ✅ groups recurse automatically |
| Typical use | Native `<input>` but keep validation/linkage | Choose the position, everything inside stays automatic |

## Next steps

- [PiyingFieldTemplate (Rendering)](en/adapters/field-template/) — choose the position, inside stays automatic
- [Adapter Overview](en/adapters/) — adapter layering and the rendering chain
- [Two Usage Modes](en/getting-started/two-modes/) — automatic vs manual
- [Field Model Binding (React)](en/adapters/react/field-model-binding/) — `use-*Model` simplifies `cvaa` binding
- [AbstractControl](en/api/control-api/) — operating on `field.form.control`

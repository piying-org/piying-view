---
title: "PiyingFieldTemplate (Rendering)"
---

> 🧭 **Manual mode**: `PiyingFieldTemplate` belongs to mode two (manual binding) of [Two Usage Modes](en/getting-started/two-modes/). Only the **render position** is manual; everything inside the field still goes through the full automatic rendering pipeline.
>
> 📌 This page covers only the **cross-framework contract** (semantics, props, rendering pipeline).

`PiyingFieldTemplate` is the **rendering exit** of an adapter: give it a field and it renders the whole tree — "wrapper chain + component + recursive children" — at the position you choose. Under the hood, `PiyingView` is literally "`convertToField` + one `PiyingFieldTemplate`".

## Export names per framework

| Framework | Export name | Shape |
| --- | --- | --- |
| Vue 3 | `PiyingFieldTemplate` | Component |
| React | `PiyingFieldTemplate` | Component |
| Solid | `PiyingFieldTemplate` | Component |
| Svelte | `PiyingFieldTemplate` | Component |

> ℹ️ Angular is not listed here: it uses the directive `PiyingFieldTemplateDirective` (`selector: '[fieldTemplate]'`) — see [Angular Directives](en/angular/directives/).

## Props (identical across frameworks)

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `field` | `PiResolvedViewFieldConfig` | Yes | The field config to render |
| `path` | `KeyPath` | No | Locate a child field of `field`; omit it to render the whole root field |

## Rendering pipeline

```
PiyingFieldTemplate(field, path)
  ├── ① Locate the field: path ? field.get(path) : field
  ├── ② Provide the field context: write the field into PI_VIEW_FIELD_TOKEN (children can inject / getContext)
  ├── ③ Assemble inputs: { ...attributes(), ...inputs(), ...outputs() }
  ├── ④ Hidden check: renderConfig.hidden is true, or define?.type missing → render nothing
  ├── ⑤ Apply the wrapper chain: wrappers wrap from outside to inside
  └── ⑥ Render the define.type component
        └── if field.form.control exists → read back the component's CVA and
            createViewControlLink(() => control, cva, injector) establishes the two-way link
```

Key points:

- **Position manual, inside automatic**: component type, wrappers and child recursion all come from schema metadata — identical to automatic mode.
- **It provides the field context**: child components must render *inside* `PiyingFieldTemplate` to reach the current field through `PI_VIEW_FIELD_TOKEN`.
- **The CVA link only exists when there is a control**: pure display components (`nonFieldControl`) do not establish a control link.

## Lazy loading

| Framework | Lazy loading |
| --- | --- |
| Vue | Built in: `isLazyMark` + `defineAsyncComponent(getLazyImport(type))` |
| Svelte | Built in: `{#await loading then LazyComponent}` |
| React | Wrap the component with `React.lazy()` yourself |
| Solid | Wrap the component with `lazy()` yourself |

## Common pitfalls

| Symptom | Cause | Fix |
| --- | --- | --- |
| Nothing renders | `renderConfig.hidden` is true, or the field has no `define.type` (no `setComponent` / `fieldGlobalConfig`) | Check `hideWhen` and whether the component mapping matches |
| Value does not update / no validation | The field is `nonFieldControl` and has no `form.control` | Do not mark it `nonFieldControl` if it must participate in the form |
| Child cannot read the current field | The child renders outside `PiyingFieldTemplate` | Move it inside the template, or pass `field` explicitly |
| Still showing old content after changing `path` | `path` was not passed as a reactive reference | Pass it as a signal / ref / getter so changes can be tracked |

## PiyingFieldTemplate vs Field

| Aspect | `PiyingFieldTemplate` | [`PiyingField`](en/adapters/field/) |
| --- | --- | --- |
| What is rendered | The component decided by schema metadata | Your own control |
| Wrappers applied | ✅ the whole wrapper chain | ❌ none |
| Child field recursion | ✅ groups recurse automatically | ❌ leaf only |
| Output | None (renders directly) | `cvaa` (value / disabled / touched) |
| Typical use | Choose the position, inside stays automatic | Native control but keep validation/linkage |

## Next steps

- [PiyingField (Binding)](en/adapters/field/) — attach a field to your own control
- [Adapter Overview](en/adapters/) — adapter layering and the rendering chain
- [Two Usage Modes](en/getting-started/two-modes/) — automatic vs manual
- [Wrappers](en/api/wrappers/) — how the wrapper chain works
- [Directives (Angular)](en/angular/directives/) — full `PiyingFieldTemplateDirective` reference

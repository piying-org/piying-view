---
title: "Adapter Overview"
---

This page explains the **Adapter** layer: what it is, why it exists, which capabilities an adapter must provide, and how to write one for a new framework.

> 💡 Just want to know "what differs per framework"? Go to [Framework Differences](en/getting-started/framework-differences/). This page describes the unified contract behind those differences.

## Why an adapter is needed

The core logic of Piying-View (schema parsing, field tree construction, value / validation / linkage) is **framework agnostic**: it only relies on Angular-style Signals and the [static-injector](https://github.com/wszgrcy/static-injector) static injector.

But turning a field into real DOM requires each framework's component model, context mechanism and control binding. Hence the split into two layers:

```
@piying/view-core            ← Framework agnostic: schema parsing / FormBuilder / FieldControl / Actions / createViewControlLink
        ▲
@piying/view-<framework>     ← Adapter: Token / CVA bridge / rendering components / reactivity conversion
        ▲
Your application
```

**Bottom line**: schema, actions, field config, path querying and validation are identical everywhere; only the "render & bind" layer is implemented by the adapter.

## Package overview

| Package | Role |
| --- | --- |
| `@piying/view-core` | Framework-agnostic core (parsing chain, field tree, actions, control model) |
| `@piying/view-angular-core` | Angular-side core (reuses `@angular/core` Signals / DI) |
| `@piying/view-angular` | Angular adapter (components, directives, `NG_VALUE_ACCESSOR` bridge) |
| `@piying/view-vue` | Vue 3 adapter |
| `@piying/view-vue2-legacy` | Vue 2 adapter (same API shape, different details) |
| `@piying/view-react` | React adapter |
| `@piying/view-solid` | Solid adapter |
| `@piying/view-svelte` | Svelte 5 (runes) adapter |

## What every adapter must provide

Each `@piying/view-<framework>` must implement the following 8 capabilities — missing any one of them breaks the runtime:

| # | Capability | Description | Angular | Vue | React | Solid | Svelte |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | **SchemaHandle** | Extends `CoreSchemaHandle`, the framework-side parsing extension point | `NgSchemaHandle` | `VueSchemaHandle` | `ReactSchemaHandle` | `SolidSchemaHandle` | `SvelteSchemaHandle` |
| 2 | **FormBuilder** | Extends `FormBuilder<XxxSchemaHandle>` and produces resolved fields | `AngularFormBuilder` | `VueFormBuilder` | `ReactFormBuilder` | `SolidFormBuilder` | `SvelteFormBuilder` |
| 3 | **convertToField** | An instance of `createConvertToField({ builder, handle }, rootInjector)` | ✅ | ✅ | ✅ | ✅ | ✅ |
| 4 | **Tokens** | Field context `PI_VIEW_FIELD_TOKEN` and injector `InjectorToken` | DI token | `InjectionKey` | Context | Context | `Symbol` + context |
| 5 | **CVA adapter** | `useControlValueAccessor()` → `{ cva, cvaa }` | `BaseControl` + `NG_VALUE_ACCESSOR` | `defineExpose({ cva })` | `useImperativeHandle` | `createMemo` | `export { cva }` |
| 6 | **Reactivity conversion** | Converts core Signals into framework reactivity | — (native) | `signalToRef` | `useSignalToRef` | `createSignalConvert` | `signalToState` |
| 7 | **Rendering components** | `PiyingView` / `PiyingFieldTemplate` / `PiyingField` / Group / Wrapper | components + directives | SFC | function components | function components | Svelte components |
| 8 | **typedFieldComponentPipe** | "path + component" double strong typing (optional but recommended) | ✅ | ✅ | ✅ | ✅ | ✅ |

> 📌 Two of the capabilities in item 7 are the **core rendering exits** of an adapter and have their own docs:
>
> - [PiyingFieldTemplate (Rendering)](en/adapters/field-template/)
> - [PiyingField (Binding)](en/adapters/field/)

## Rendering chain

```
convertToField(schema, injector, options)
        │
        ▼
   field (PiResolvedViewFieldConfig — the whole resolved field tree)
        │
        ├── PiyingView ────────── automatic-mode entry (calls convertToField internally)
        │        │
        │        ▼
        │   PiyingFieldTemplate ─ renders "one field"
        │        │   ① hidden check  ② wrap with wrapper chain  ③ render define.type
        │        │   ④ if field.form.control exists → establish the CVA two-way link
        │        │
        │        └── container component (Group) → every child field goes through PiyingFieldTemplate again (recursion)
        │
        └── Field (FieldControlBind) ─ manual-mode exit
                Does not render define.type; hands the control to YOUR OWN component through `cvaa`
```

Both chains end up calling the core `createViewControlLink(() => control, cva, injector)` to synchronize value, touched and disabled between "form control ↔ view control". The only difference is **who provides the CVA**:

| Exit | Who provides the CVA | Who decides the component |
| --- | --- | --- |
| `PiyingFieldTemplate` | The adapter internally (CVA is read back from the rendered component) | Schema metadata (`setComponent` / `fieldGlobalConfig`) |
| `PiyingField` | Created by the adapter and handed to you via `cvaa` | **Your own component** |

## Writing a new adapter

Implement the checklist below (using `@piying/view-foo` as an example):

1. **Create the package**, depending on `@piying/view-core` and `static-injector`.
2. **SchemaHandle**: `class FooSchemaHandle extends CoreSchemaHandle<FooSchemaHandle, () => PiResolvedViewFieldConfig>`.
3. **FormBuilder**: `class FooFormBuilder extends FormBuilder<FooSchemaHandle> {}`.
4. **convertToField**: `createConvertToField({ builder: FooFormBuilder, handle: FooSchemaHandle }, rootInjector)`, where `rootInjector` must provide `ChangeDetectionScheduler`.
5. **Tokens**: define `PI_VIEW_FIELD_TOKEN` and `InjectorToken`, and make sure provide / inject semantics work inside the framework.
6. **CVA adapter**: implement `useControlValueAccessor()` returning `cva` (`writeValue` / `registerOnChange` / `registerOnTouched` / `setDisabledState`) and `cvaa` (`value` / `disabled` / `valueChange` / `touchedChange`).
7. **Reactivity conversion**: implement `signalConvert(() => signal)` turning core Signals into framework-tracked reactive values.
8. **Rendering components**: implement the five components `PiyingView`, `PiyingFieldTemplate`, `PiyingField`, Group and Wrapper following the rendering chain above.
9. **typedFieldComponentPipe** (optional): provide "path + component" double strong typing.
10. **Align the tests**: run the same suite as the existing adapters (two-way value, touched, disabled, lazy loading, destroy, wrapper, group recursion).

> ⚠️ The three easiest pitfalls while implementing:
>
> 1. **Always dispose**: the `dispose` returned by `createViewControlLink` must be called on unmount (`dispose(true)` recommended), otherwise listeners leak.
> 2. **Token scope**: `PiyingFieldTemplate` must provide the field context *before* rendering children, otherwise child components cannot `inject` the current field.
> 3. **hidden and missing component**: when `renderConfig.hidden` is true or `define?.type` is missing, the whole block must render nothing (not an empty shell).

## Next steps

- [PiyingField (Binding)](en/adapters/field/) — manually attach a field to your own control
- [PiyingFieldTemplate (Rendering)](en/adapters/field-template/) — pick the position, everything inside stays automatic
- [Framework Differences](en/getting-started/framework-differences/) — Token / CVA / Signal comparison
- [Two Usage Modes](en/getting-started/two-modes/) — automatic mode vs manual mode
- [Core Concepts](en/getting-started/core-concept/) — Schema → Field → Component parsing chain

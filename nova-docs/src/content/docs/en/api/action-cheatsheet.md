---
title: "Action Cheatsheet"
---

This page gathers the Actions scattered across the docs into one table, so you can quickly find "I want to do X — which Action do I need?".

## Shared operation semantics

Most `actions.*` namespaces share the same set of verbs, with fixed meanings:

| Operation | Semantics | Argument shape |
| --------- | --------- | -------------- |
| `set` | **Replace** the current value entirely | plain object |
| `patch` | **Merge** into the current value (shallow) | plain object |
| `remove` | **Remove** the given keys | array of key names |
| `patchAsync` | Resolve per field, then merge | `{ key: (field) => value \| Promise \| Observable \| Signal }` |
| `mapAsync` | Functionally transform the **whole existing value** | `(field) => (value) => newValue` |
| `merge` | **Stack** instead of replacing (both run) | only supported by `outputs` |

> ⚠️ Three easy mix-ups:
> - `set` replaces the whole object; `patch` only merges the keys you pass
> - `patchAsync` means "the value may be async"; `mapAsync` means "transform the whole bundle"
> - `merge` exists only on `outputs`, so several handlers can be active at once

---

## Namespace × operation support matrix

✅ = supported, — = not supported

| Namespace | `set` | `patch` | `patchAsync` | `remove` | `mapAsync` | Extra operations |
| --------- | :---: | :-----: | :----------: | :------: | :--------: | ---------------- |
| `actions.inputs` | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| `actions.attributes` | ✅ | ✅ | ✅ | ✅ | ✅ | `top.set` / `top.patch` |
| `actions.props` | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| `actions.models` | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| `actions.events` | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| `actions.slots` | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| `actions.outputs` | ✅ | ✅ | ✅ | ✅ | ✅ | `merge` / `mergeAsync` |
| `actions.wrappers` | ✅ | ✅ | ✅ | ✅ | — | `changeAsync` |
| `actions.hooks` | ✅ | ✅ | — | ✅ | — | `merge` (accepts `position`) |
| `actions.providers` | ✅ | ✅ | — | — | — | `change` |
| `actions.createOptions` | ✅ | ✅ | — | — | — | — |
| `actions.directives` (Angular only) | ✅ | ✅ | ✅ | ✅ | — | — |
| `actions.class` | — | — | — | — | — | see the section below |

### `actions.class` operations

| Operation | Target |
| --------- | ------ |
| `top(className, merge?)` | The outermost wrapper; the field component itself when there is no wrapper |
| `bottom(className, merge?)` | The field component itself |
| `component(className, merge?)` | The field component itself (same as `bottom`) |
| `asyncTop(fn)` | Outermost container, `fn(field)` returns the class |
| `asyncBottom(fn)` / `asyncComponent(fn)` | The field component itself, `fn(field)` returns the class |

> `top` / `bottom` refer to **position in the wrapping hierarchy**, not the visual top/bottom of the page.

---

## Top-level Actions (outside the `actions` namespace)

These are standalone functions used directly in `v.pipe()`:

| Action | Purpose | Details |
| ------ | ------- | ------- |
| `setComponent(type)` | Choose the rendering component (string key or component class) | [setComponent](en/api/setcomponent/) |
| `formConfig(config)` | Form behaviour: disable / validation / value transform / update timing | [formConfig](en/api/form-config/) |
| `renderConfig({ hidden })` | Whether the field renders at all (static) | [renderConfig](en/api/render-config/) |
| `rawConfig(fn)` | Mutate the underlying config object directly | [rawConfig](en/api/raw-config/) |
| `layout({ priority, keyPath })` | Ordering and position moves | [Layout metadata](en/api/layout/) |
| `setAlias(name)` | Give the field an alias for `@name` queries | [Path Querying](en/api/path-querying/) |
| `hideWhen(options)` | Conditional hiding (can disable too) | [hideWhen/disableWhen](en/api/hide-disable/) |
| `disableWhen(options)` | Conditional disabling | [hideWhen/disableWhen](en/api/hide-disable/) |
| `valueChange(fn)` | Value listening with no side effects | [hideWhen/disableWhen](en/api/hide-disable/) |
| `outputChange(fn)` | Listen to component output events | [hideWhen/disableWhen](en/api/hide-disable/) |
| `nonFieldControl(bool)` | Mark as a non-form control | [Using Components](en/scenarios/component-use/) |
| `asControl()` | Do not expand a Group/Array; treat it as one control | [asControl / asVirtualGroup](en/scenarios/as-control-group/) |
| `asVirtualGroup()` | Make Intersect children a regular Group | [asControl / asVirtualGroup](en/scenarios/as-control-group/) |
| `condition({ environments, actions })` | Run Actions conditionally per environment | [Core Utilities](en/api/core-utils/) |
| `NFCSchema` | Schema constant for non-field-controls | [Using Components](en/scenarios/component-use/) |
| `nfcComponent(input)` | Shorthand for a non-field-control component | [Utilities](en/angular/tools/) |

> Deprecated top-level aliases: `setHooks` / `patchHooks` / `mergeHooks` / `removeHooks` — use `actions.hooks.set/patch/merge/remove` instead.

---

## Execution order and merge rules

```
Final Actions list = [...global default Actions, ...Actions defined in the schema]
```

- Global defaults come from `fieldGlobalConfig.types[key].actions` and `fieldGlobalConfig.wrappers[key].actions`
- **Global first, user-defined last**; later Actions override earlier ones
- So `actions.inputs.set({ a: 1 })` in your schema overrides a global `{ a: 0 }`

See [fieldGlobalConfig](en/api/global-config/).

---

## Which one should I use?

| What I want to do | Use |
| --------------- | --- |
| Pass a configuration value to the component | `actions.inputs` |
| Set native HTML attributes / `data-*` / ARIA | `actions.attributes` |
| Add CSS classes | `actions.class` |
| Bind native DOM events (click, ...) | `actions.events` |
| Receive a component `@Output()` event | `actions.outputs` |
| Two-way binding (`ngModel` / `model()` / `v-model`) | `actions.models` |
| Pass template slots | `actions.slots` |
| Store custom config readable via `field.props()` | `actions.props` |
| Wrap it in a label / card | `actions.wrappers` |
| Attach lifecycle callbacks | `actions.hooks` |
| Inject a business service into the field | `actions.providers` |
| Attach a custom directive to the field (Angular) | `actions.directives` |

### Splitting `inputs` / `attributes` / `props`

| | Where it lands | Who can read it |
| - | -------------- | --------------- |
| `inputs` | The component's `@Input()` | The component itself |
| `attributes` | An attribute on the host DOM element | DOM / CSS / tests |
| `props` | The field config object | The component and its wrappers via `field.props()` |

> In principle `props` could do everything, but the split exists for clearer semantics. Prefer whichever matches your intent most closely.

## Related documents

- [fieldGlobalConfig](en/api/global-config/) — global defaults and merge rules
- [inputs](en/api/inputs/) / [outputs](en/api/outputs/) / [models](en/api/models/)
- [attributes](en/api/attributes/) / [CSS class](en/api/css-class/) / [props](en/api/props/)
- [Wrappers](en/api/wrappers/) / [Hooks](en/api/hooks/) / [Providers](en/api/providers/)

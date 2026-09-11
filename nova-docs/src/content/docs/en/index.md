---
title: "Piying-View Documentation"
---

Piying-View is an open-source TypeScript form library that turns [Valibot](https://github.com/fabian-hiller/valibot) validation schemas into UI view definitions. Define a schema, register the rendering components for it, and Piying-View renders the whole form, with two-way data binding, dynamic control, custom components and more.

**Key features:**

- **Schema driven**: form structures defined with type-safe Valibot schemas
- **Multi-framework**: Angular (primary), Vue, React, Solid, Svelte
- **Flexible component mapping**: choose the rendering component of every field with `setComponent`
- **Dynamic control**: field linkage through `hideWhen` / `disableWhen` / `valueChange`
- **Wrapper system**: user-defined wrappers around any field, with V1/V2 template syntax
- **Global configuration**: `fieldGlobalConfig` manages default types, wrappers and Actions

> 💡 **Framework note**: this documentation is split into **generic** and **framework-specific** parts. The Actions logic in the **generic documents** (Getting Started, Scenarios, API Reference) is identical in every framework; the **Angular** directory only covers Angular-specific APIs and directives.

---

## Table of Contents

### 🚀 Getting Started

Everything you need to start with Piying-View. The Actions logic in these documents is identical across frameworks; Angular is used as the example.

| Document                                               | Description                                                                                             |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| [5-Minute Quick Start](en/getting-started/quick-start/)  | Install (commands per framework) → define a schema → register components → render the form, incl. writing custom CVA components |
| [Two Usage Modes](en/getting-started/two-modes/)          | Automatic mode (`<piying-view>` renders everything) vs manual mode (`convertToField` + `[formControl]`/`[fieldTemplate]` binding), boundaries and code walkthrough |
| [Core Concepts](en/getting-started/core-concept/)        | The three-stage resolution chain Valibot Schema → CoreSchemaHandle → FormBuilder → Component Tree and its data flow (toView/toModel) |
| [Options Configuration](en/getting-started/options-config/) | Details of the PiyingView `options` property: context, fieldGlobalConfig type/wrapper maps, custom Builder |
| [Framework Differences](en/getting-started/framework-differences/) | Field Token access, CVA binding and signal helpers in Angular/Vue/React/Solid/Svelte |
| [JSON Schema Support](en/getting-started/jsonschema/)    | The `jsonSchemaToValibot()` converter, Draft-04/07/2020-12 support, type mapping table and limitations  |

### 📖 Scenarios

Organised by common business scenario; each one ships a verified, complete example (the Actions logic is generic and identical across frameworks).

| Document                                                          | Description                                                                                               |
| ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| [Basic Field Definition](en/scenarios/basic-field/)                 | `setComponent` (string reference vs component class), the complete `formConfig` table, Valibot metadata inference, custom validators |
| [Type Mapping (define equals form)](en/scenarios/type-mapping/) | Automatic mapping from Valibot types to form controls/groups/arrays: string/number/boolean/picklist/object/record/tuple/array, etc., including default values and nested definitions |
| [Using Forms](en/scenarios/form-use/) | Form usage overview: value listening/layout moving/section disabling/field grouping/cascading/validation/filter groups/scroll groups |
| [Using Components](en/scenarios/component-use/) | Component types, non-form controls (NFCSchema), property actions and event outputs, context, advanced customisation with rawConfig, selectorless components |
| [Complex Schema Structures](en/scenarios/complex-schema/)           | v.object()→FieldGroup / v.array()→FieldArray / v.record()/intersect()/union() mappings and layout priority sorting |
| [asControl / asVirtualGroup](en/scenarios/as-control-group/)        | `asControl()` treats a nested object as a single control, `asVirtualGroup()` turns Intersect children into a normal Group, with three main scenarios |
| [Dynamic Field Control](en/scenarios/dynamic-fields/)               | hideWhen (conditional hiding), disableWhen (conditional disabling), valueChange (side-effect-free listening), with payment switching / cascading examples |
| [Value Transformation and Linkage](en/scenarios/value-transform/)   | formConfig.transformer (toView/toModel), pipe (RxJS observable pipe), comparison with Valibot v.transform() + full data flow diagram |
| [Custom Validation](en/scenarios/custom-validation/)                | validators/asyncValidators (four flavours: Promise/Observable/Signal), old vs new error formats, cross-field and conditional validation examples |
| [Advanced Array Usage](en/scenarios/array-advanced/)                | FieldArray API (set/remove/updateValue/clear/reset), deletionMode (shrink/mark), groupMode, TupleWithRest |
| [Record Schema Dynamic Groups](en/scenarios/record-dynamic-group/) | Special Group handling of v.record(): `groupKeySchema`/`groupValueSchema` constraints, with tag editing / config maps / translation scenarios |
| [Complete Example: a Real Business Form](en/scenarios/complete-example/) | A registration form in practice: basic info + password + privacy + dynamic tags + bio, combining validation/hideWhen/disableWhen/component registration |

### 🔧 API Reference

Detailed reference for every Action, configuration item and helper; the logic is defined once and shared by all frameworks. Wrappers, the Control API and Providers are generic capabilities; other frameworks have equivalent mechanisms (such as `static-injector`).

**Framework package APIs:**

| Document                                  | Description                                                                                             |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| [Vue](en/adapters/vue/)                     | `@piying/view-vue` + `@piying/view-vue2-legacy` adapter APIs: PiyingView/Field/useControlValueAccessor/signalToRef/typedComponent/VueSchemaHandle |
| [React](en/adapters/react/)                 | `@piying/view-react` adapter APIs: Token/useControlValueAccessor/useSignalToRef/useEffectSync/use-*Model/ReactSchemaHandle |
| [Solid](en/adapters/solid/)                 | `@piying/view-solid` adapter APIs: Token/useControlValueAccessor/createSignalConvert/useEffectSync/use-*Model/SolidSchemaHandle |
| [Svelte](en/adapters/svelte/)               | `@piying/view-svelte` adapter APIs: PiyingView/Field/signalToState/useControlValueAccessor/SvelteSchemaHandle |

| Document                                                          | Description                                                                                                     |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [setComponent](en/api/setcomponent/)                                | Full `setComponent` API: string references (through fieldGlobalConfig.types) vs component classes, incl. built-in type key mapping |
| [inputs](en/api/inputs/)                                            | `actions.inputs`: set (replace), patch (merge), remove, passing @Input() values to field components |
| [outputs](en/api/outputs/)                                          | `actions.outputs`: set/patch/remove/patchAsync (created dynamically), binding custom event handlers to a field |
| [models](en/api/models/)                                            | `actions.models` two-way model binding: set/patch/remove/patchAsync/mapAsync, binding external signals to component model input/output pairs |
| [events](en/api/events/)                                            | Declarative native DOM event binding through `actions.events.patchAsync`, handling click/keydown and more |
| [attributes](en/api/attributes/)                                    | `actions.attributes` for native HTML attributes: set/patch/remove/patchAsync, attributes vs inputs comparison, ARIA/data-\* attributes |
| [CSS class](en/api/css-class/)                                      | `actions.class`: top (outermost wrapper) / bottom・component (the field component itself) / asyncTop・asyncBottom  |
| [Layout metadata](en/api/layout/)                                   | The `layout` Action: priority weighting + keyPath expressions ('#'/'..'/'@alias'), Intersect + Layout rearranging fields |
| [hideWhen / disableWhen / valueChange](en/api/hide-disable/)        | Full API signatures of hideWhen/disableWhen/valueChange/outputChange, the listenFields mechanism, skipInitValue, lifecycle timing |
| [Path Querying](en/api/path-querying/)                              | KeyPath type definition, `field.get()` usage: `['..']` (from the parent) / `'#'` (from the root) / `'@alias'` (alias lookup), naming conflict rules |
| [formConfig](en/api/form-config/)                          | The `FieldFormConfig` field table: disabling / value transformation / validation / update timing / array & group behaviour        |
| [renderConfig](en/api/render-config/)                      | The `hidden` option: whether a field is rendered, and how it differs from hideWhen                                               |
| [rawConfig](en/api/raw-config/)                            | Edit the field config object directly (inputs / attributes / props, ...), for cases the ready-made Actions do not cover            |
| [fieldGlobalConfig](en/api/global-config/)                          | `fieldGlobalConfig` types/wrappers structure + Actions merge rules (global first) + component type lookup priority system |
| [Hooks Lifecycle](en/api/hooks/)                                    | `actions.hooks` lifecycle management: merge (run several in order) / patch (override by name) / remove / set, hook registration and ordering |
| [Props Generic Properties](en/api/props/)                            | `actions.props` generic property keys: set (replace) / patch (merge) / patchAsync (async) / remove / mapAsync (dynamic mapping), read through field.props(), semantics vs Attributes/Inputs/Outputs |
| [Core Utilities](en/api/core-utils/)                                 | Core signal helpers such as `combineSignal`/`observableSignal`/`asyncObjectSignal`                       |
| [Wrappers](en/api/wrappers/)                                        | `actions.wrappers` set/patch/patchAsync/remove/changeAsync + guide to writing wrapper components (V1/V2 templates, InsertFieldDirective usage), generic across frameworks |
| [Control API](en/api/control-api/)                                  | Complete FieldControl/AbstractControl reference: getting controls, value API (updateValue/reset/viewValueChange), state API (disabled/touched/dirty), FieldArray API (length/controls/removeRestControl) |
| [Providers](en/api/providers/)                                      | `actions.providers` injects business services into the field component injector: set (replace) / patch (append) / change (functional transform); inject() in Angular, static-injector elsewhere |

### 🅰️ Angular Specific

The following documents only cover APIs and directives unique to the **Angular framework** (`@piying/view-angular`); other frameworks have no equivalent mechanisms.

| Document                                                          | Description                                                                                                     |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [API Index](en/angular/api/)                                        | Public API index of `@piying/view-angular`, linking to the individual component / directive / token / utility documents |
| [Components](en/angular/components/)                                | PiyingView root component, PiyingViewGroup container, PiyingViewGroupBase base class                             |
| [Directives](en/angular/directives/)                                | InsertFieldDirective, PiyingFieldTemplateDirective, PiyingFieldControlBindDirective, AttributesDirective / EventsDirective |
| [Field Directive Config](en/angular/field-directives/)              | Angular directive configuration (`actions.directives`): stable directive instances (inputs keep updating), runtime add/clean |
| [Tokens](en/angular/tokens/)                                        | Injection tokens such as PI_VIEW_FIELD_TOKEN, PI_VIEW_FIELD_TEMPLATE_REF_TOKEN, PI_COMPONENT_REF_TOKEN           |
| [Utilities](en/angular/tools/)                                      | typedComponent / nfcComponent, convertToField, NgSchemaHandle / AngularFormBuilder, actions.directives            |
| [BaseControl](en/angular/base-control/)                             | Base class for field controls implementing ControlValueAccessor                                                  |

---

## Quick Navigation

| Topic      | Link                                             |
| ---------- | ----------------------------------------------- |
| Installation | [5-Minute Quick Start](en/getting-started/quick-start/) |
| Two modes    | [Two Usage Modes](en/getting-started/two-modes/)      |
| How it works | [Core Concepts](en/getting-started/core-concept/)     |
| Basic fields | [Basic Field Definition](en/scenarios/basic-field/)   |
| Dynamic control | [Dynamic Field Control](en/scenarios/dynamic-fields/) |
| Custom components | [setComponent](en/api/setcomponent/)               |
| Wrappers     | [Wrappers](en/api/wrappers/)                          |
| Global config | [fieldGlobalConfig](en/api/global-config/)           |

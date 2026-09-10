---
title: "Core Concepts: From Schema to View"
---



> 💡 The resolution chain described here is **shared by both usage modes**. When it comes to rendering there is automatic mode (`<piying-view>` fully automatic) and manual mode (`convertToField` + directives bound by hand); see [Two Usage Modes](en/getting-started/two-modes/) for the boundary.

This page explains the core workflow of Piying-View and how data travels from a Valibot schema to a UI view.

## Architecture Overview

### The Schema → Field → Component resolution chain

The runtime flow of Piying-View is a three-stage pipeline:

```
Valibot Schema ──(parse)──► Field Config ──(render)──► Component Tree
```

1. **Schema definition**: you build a structured type definition with the Valibot API
2. **Field resolution**: Piying-View walks the schema and turns every node into a Field configuration object containing component props, event listeners, wrapper chain, children and more
3. **Component rendering**: UI components are instantiated dynamically from the Field configuration and assembled into a component tree

### Complete Separation of View and Logic

Piying-View splits the runtime behaviour of a form into two orthogonal dimensions:

| Dimension                 | Responsibility                                                   |
| ----------------------- | ---------------------------------------------------------------- |
| **Structure (Schema)**    | Static metadata: field types, defaults, validation rules, component mapping, wrapper configuration |
| **Rendering (Component)** | Renders the UI component tree dynamically from the resolved Field configuration |

The two dimensions communicate through a uniform **input/output contract** (Attributes / Events / Inputs / Outputs). Replacing the implementation-level component requires no change to the schema — that is exactly what makes cross-framework support possible.

---

## Conversion Flow Overview

```
Valibot Schema (v.object / v.pipe)
    │
    ▼
CoreSchemaHandle
    │  - parses every Action (setComponent, inputs, outputs, ...)
    │  - collects metadata (priority, keyPath, alias, ...)
    │  - marks non-field controls (nonFieldControl / NonFieldControlAction)
    ▼
FormBuilder
    │  - buildRoot() / buildControl() / #buildField()
    │  - walks every CoreSchemaHandle and creates PiResolvedViewFieldConfig
    │  - with a key path → creates FieldControl (bound to a form control)
    │  - without a key path (nonFieldControl) → rendered as a plain view component
    │  - recurses into children of group / array / logicGroup
    │  - manages injectors, destroy lifecycle and scope maps
    ▼
Resolved Field Tree
    │  - FieldControl: single-value control bound to a Form Control, holding value/errors/validators
    │  - FieldGroup: object control group holding a record of child controls
    │  - FieldArray: array control with add/remove/update operations
    │  - FieldLogicGroup: intersect/union logical grouping
    │  - plain components: no form binding, rendered as view components (defined via setComponent)
    ▼
View Component
    │  - Angular: PiyingView / custom components
    │  - Vue / React / Solid / Svelte
    ▼
UI rendering
```

## 1. Valibot Schema

Piying-View builds on [Valibot](https://github.com/fabian-hiller/valibot). The schema defines:

- **Field structure**: which fields exist and how they nest
- **Validation rules**: required, length, range and more
- **Transformation logic**: transform / transformAsync
- **View configuration**: Actions chained with `v.pipe()`

```typescript
import * as v from 'valibot';

const schema = v.object({
  name: v.pipe(
    v.string(), // type definition
    v.minLength(2), // validation rule
    setComponent('my-input'), // view configuration: which component renders it
    formConfig({ required: true }), // form configuration
  ),
});
```

## 2. CoreSchemaHandle

Once the schema is passed to `convertToField()`, Piying-View walks the schema tree and creates a `CoreSchemaHandle` for each node. This handle:

- **Parses Actions**: converts `setComponent`, `inputs`, `outputs`, `attributes`, `wrappers` and other Actions into internal data
- **Collects metadata**: priority, key path (keyPath/fullPath), alias
- **Applies hooks**: handles `mergeHooks`, `patchHooks` and other lifecycle callbacks

```typescript
import { convertToField } from '@piying/view-angular';

const field = convertToField(() => schema, injector, () => ({
  fieldGlobalConfig: { types, wrappers },
  context: myContext,
}));
```

### How Actions Are Parsed

Each Action inside `v.pipe()` runs in order:

```typescript
v.pipe(
  v.string(),
  actions.inputs.set({ placeholder: 'Please enter' }), // 1. set input props
  setComponent('my-input'), // 2. set the component type
  actions.outputs.set({ change: handleChange }), // 3. set output events
);
// → CoreSchemaHandle: {
//     type: 'my-input',
//     inputs: { placeholder: 'Please enter' },
//     outputs: { change: handleChange },
//     attributes: {},
//     wrappers: []
//   }
```

### Field Control vs Non-Field Control

CoreSchemaHandle distinguishes two purposes through the `nonFieldControl` flag:

- **Fields with a form control** (default): they have a `keyPath`, so a `FieldControl`/`FieldGroup`/`FieldArray` is created and they take part in value management and validation
- **Fields without a form control** (`nonFieldControl = true` or defined through `NonFieldControlAction`): no key path, so FormBuilder creates no Form Control and the field renders as a plain view component

```typescript
// example: a presentation-only component with no form binding
v.pipe(
  v.string(),
  setComponent('user-avatar'), // view component
  nonFieldControl(), // marks it as a non-form field, no Form Control is generated
);
```

## 3. FormBuilder — Schema Handle → Resolved Field

`CoreSchemaHandle` is only raw data; **FormBuilder** turns it into `PiResolvedViewFieldConfig` (the resolved field).

`FormBuilder` is the engine of the whole conversion:

- **`buildRoot()`**: starts building from the root node
- **`buildControl()`**: walks every CoreSchemaHandle and performs the following:
  1. Finds the component definition (the type registered through `setComponent`)
  2. Creates an injector (giving the field DI capabilities)
  3. With a key path → calls `createField()` to create the Form Control (`FieldControl`/`FieldGroup`/`FieldArray`)
  4. Builds the `PiResolvedViewFieldConfig` object: inputs, outputs, attributes, slots, wrappers and more
  5. If `nonFieldControl = true` → skips Form Control creation and keeps only the render configuration
- **`#buildField()`**: recurses into children of group/array/logicGroup
- **Scope management**: field aliases are tracked through `PI_FORM_BUILDER_ALIAS_MAP`
- **Lifecycle management**: injector destruction and batch invocation of the `allFieldsResolved` hook

```typescript
// call chain inside convertToField()
const injector = Injector.create({
  providers: [
    { provide: PI_FORM_BUILDER_OPTIONS_TOKEN, useValue: buildOptions },
    builder, // FormBuilder instance
  ],
});

convertCore(obj, (item) => {
  injector.get(builder).buildRoot({ field: item });
  return buildOptions.resolvedField$();
});
//                          │
//                          ▼
//           buildRoot → buildControl → #buildField (recursive)
```

## 4. Field Control Tree & Resolved Field

`FormBuilder` outputs `PiResolvedViewFieldConfig`, which contains two kinds of artefacts:

| Type                | Description                                                |
| ------------------- | ---------------------------------------------------------- |
| **FieldControl**    | Single-value control bound to a Form Control, holding value/errors/validators |
| **FieldGroup**      | Object control group holding a record of child controls     |
| **FieldArray**      | Array control with add/remove/update operations             |
| **FieldLogicGroup** | intersect/union logical grouping                             |
| **Plain components** | No form binding, rendered as view components (defined via `setComponent`) |

Each Field Control manages its state with Angular Signals (existing alongside plain components):

```typescript
class FieldControl<TValue> {
  // values
  value$$: Signal<TValue>;
  originValue$$: Signal<TValue | undefined>;

  // state
  errors: any;
  dirty: Signal<boolean>;
  touched: Signal<boolean>;
  pristine: Signal<boolean>;

  // configuration
  formConfig: WritableSignal<FieldFormConfig>;
  renderConfig: WritableSignal<RenderConfig>;

  // methods
  viewValueChange(value: any): void; // value change from the view
  updateValue(value: any): void; // value change from the model
}
```

## 5. View Component

Once the Field Control tree is built, Piying-View renders components dynamically according to the `type` map:

### Rendering in Angular

1. **PiyingView** receives `schema`, `model` and `options`
2. It calls `convertToField()` to build the Field Control tree
3. **InsertFieldDirective** walks the Fields and creates a component instance for each one
4. `NgComponentOutlet` mounts the components you registered

```typescript
// internal flow of PiyingView
@Component({
  selector: 'piying-view',
  template: `
    <ng-container *ngFor="let field of fields">
      <ng-container insertField [insertFieldSlots]="field.slots" [insertFieldAttributes]="field.attributes"></ng-container>
    </ng-container>
  `,
})
export class PiyingView {
  @Input() schema!: BaseSchema;
  @Input() model!: Signal<any>;
  @Input() options!: NgConvertOptions;
  @Output() modelChange = new EventEmitter();
}
```

## Component Categories

Piying-View splits reusable units into three single-responsibility component types:

#### Control

Atomic UI components implementing the CVA contract, responsible for the input/output of a single value and its validation. Examples: wrappers around native form elements such as `<input>` or `<select>`.

#### Wrapper

Decorative components that add generic capabilities to a non-wrapper component: label rendering, validation messages, prefix/suffix icons. Several wrappers can be combined freely with:

- `actions.wrappers.set` — replaces the whole wrapper chain
- `actions.wrappers.patch` — appends wrappers incrementally
- `actions.wrappers.remove` — removes specific wrappers

#### Group

Handles schema types that contain child fields (`v.object()`, `v.array()`, `v.tuple()`, ...). Group components define their own layout and styling — card containers, tab pages, accordions and so on. Piying-View ships a base `PiyingViewGroupBase` class for every framework, ready to be extended.

---

### How Wrappers Wrap

A field can carry several wrappers; rendering wraps it from the outside in:

```
[Wrapper3] → [Wrapper2] → [Wrapper1] → [Field Component]
```

A wrapper component must use `InsertFieldDirective` to render its inner field.

## 6. Data Flow

### Model → View (toView)

```
model value → transformer.toView → view value
```

### View → Model (toModel)

```
view value → pipe(toModel) → transformer.toModel → originValue$$ → v.transformer → model value
```

### Two-way Binding

```typescript
// two-way binding inside the PiyingView template
<piying-view
  [(model)]="model"
  (modelChange)="onModelChange($event)"
></piying-view>
```

## Next Steps

- [Options Configuration](en/getting-started/options-config/) — introduction to context / fieldGlobalConfig / builder
- [fieldGlobalConfig API](en/api/global-config/) — complete reference of the types/wrappers priority system
- [Basic Field Definition](en/scenarios/basic-field/) — practice: using setComponent / formConfig

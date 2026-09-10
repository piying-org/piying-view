---
title: "Directives — Field Template / Control Binding and More"
---

This page covers the directives provided by `@piying/view-angular`: `InsertFieldDirective`, `PiyingFieldTemplateDirective`, `PiyingFieldControlBindDirective`, `AttributesDirective` / `EventsDirective`.

> ⚠️ These are the directives the **library exposes to users**. If you care about attaching **your own directives** to a field via `actions.directives`, see [Field Directive Config](en/angular/field-directives/).

## InsertFieldDirective

The field insertion point directive for wrappers, `selector: '[insertField]'`, `exportAs: 'insertField'`, extends `BaseComponent`. Declares where fields are inserted inside a wrapper template:

```html
<!-- wrapper.component.html -->
<ng-container insertField></ng-container>
```

```typescript
import { InsertFieldDirective } from '@piying/view-angular';

@Component({
  standalone: true,
  imports: [InsertFieldDirective], // required import
  templateUrl: './wrapper.component.html',
})
export class MyWrapperComponent {}
```

Inputs:

| Input                    | Type                          | Description                                 |
| ------------------------ | ----------------------------- | ------------------------------------------ |
| `insertFieldSlots`       | `Record<string, TemplateRef>` | Slot templates to merge into the field's `slots` |
| `insertFieldAttributes`  | `Record<string, any>`         | Attributes to merge into the field's `inputs` |

## PiyingFieldTemplateDirective

Directive that renders a field template, `selector: '[fieldTemplate]'`, `standalone`, `exportAs: 'fieldTemplate'`, extends `DynamicCreateDirective`:

```html
<ng-container [fieldTemplate]="field" [path]="keyPath"></ng-container>
```

| Input           | Type                              | Description                     |
| --------------- | -------------------------------- | ---------------------------- |
| `fieldTemplate` | `PiResolvedViewFieldConfig` (required) | Field configuration to render |
| `path`          | `KeyPath` (optional)               | Locate a child field by path     |
| `onInit`        | `(field) => void` (optional)       | Callback executed once when the field is first initialized |

`field$$` is computed from `path`: with a `path` it reads `fieldTemplate().get(keyPath)`, otherwise `fieldTemplate()`.

### onInit

`onInit` runs **once** when the field has been resolved and created for the first time; later field updates do not trigger it (an internal `#initialized` flag guarantees a single call):

```html
<ng-container [fieldTemplate]="bind()" [onInit]="onInit()"></ng-container>
```

```typescript
import { PiResolvedViewFieldConfig } from '@piying/view-angular';

onInit = input<(field: PiResolvedViewFieldConfig) => void>((field) => {
  console.log('field initialized', field);
});
```

It also exposes `summaryList$$` / `valibotIssueSummary$$` for error summaries (based on `errorSummary`).

## PiyingFieldControlBindDirective

Binds a field as a form control (`NgControl`), `selector: '[formControl]'`, `standalone`, `exportAs: 'formControl'`, extends `FieldControlBase`. Use it to bind a field manually inside a custom template:

```html
<input [formControl]="bind1()" [path]="['k1']" />
```

```typescript
import { PiyingFieldControlBindDirective } from '@piying/view-angular';
// import it into the imports array of a standalone component
```

Inputs:

| Input         | Type                                   | Description                  |
| ------------- | ------------------------------------- | -------------------------- |
| `formControl` | `_PiResolvedCommonViewFieldConfig` (required) | Field configuration to bind |
| `path`        | `KeyPath` (optional)                    | Locate a child field by path  |

`fieldControl$$` performs validation: it throws `🏷️ fieldControl❗` when the target is not a leaf control. It provides `NgControl` through the `formControlBinding` provider, emulating dynamic binding.

## AttributesDirective / EventsDirective

Internal directives that bind `actions.attributes` / `actions.events` to the component DOM:

- `AttributesDirective`: `selector: '[attributes]'`, inputs `attributes` (required) and `excludes` (attribute keys to exclude). On change it applies values with `Renderer2.setAttribute` and removes deleted attributes.
- `EventsDirective`: `selector: '[events]'`, input `events` (required, `Record<string, (event) => any>`). It re-subscribes on change and unbinds on destroy.

```typescript
import { AttributesDirective, EventsDirective } from '@piying/view-angular';
```

## Related Documents

- [Components](en/angular/components/) — PiyingView / PiyingViewGroup
- [Angular API Reference](en/angular/api/) — index of all public APIs

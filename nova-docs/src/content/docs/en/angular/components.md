---
title: "Components — PiyingView / PiyingViewGroup"
---

This page covers the components provided by `@piying/view-angular`: the form root component `PiyingView`, the field group container `PiyingViewGroup` and its base class.

## PiyingView

The form root component, `selector: 'piying-view'`, `standalone`, `OnPush` change detection. It takes `schema` / `model` / `options` and renders the whole form automatically.

```html
<piying-view [schema]="schema" [(model)]="model" [options]="options"></piying-view>
```

| Input/Output     | Type                                                             | Description                           |
| ---------------- | ---------------------------------------------------------------- | ----------------------------------- |
| `schema`         | `v.BaseSchema<any, any, any>` (required)                          | Valibot schema                        |
| `model`          | `any` (optional)                                                  | Two-way bound model data              |
| `modelChange`    | `output<any>()`                                                   | Model change event                    |
| `options`        | `NgConvertOptions` (builder/handle omitted, may contain fieldGlobalConfig) | Conversion options (context / builder, etc.) |
| `selectorless`   | `boolean` (optional, default `false`)                             | Whether to use selectorless mode      |
| `form$$()`       | `Signal<FieldControl \| FieldGroup \| FieldArray \| undefined>`   | Current root form control (computed, may be undefined) |

`form$$` is computed from `resolvedField$()?.form.control`; it is `undefined` until the field has been resolved.

## PiyingViewGroup

The field group container component, `selector: 'piying-view-group'`, extends `PiyingViewGroupBase`, used to render container types such as `object` / `array` / `record`:

```typescript
import { PiyingViewGroup } from '@piying/view-angular';

options = {
  fieldGlobalConfig: {
    types: {
      object: { type: PiyingViewGroup },
      array: { type: PiyingViewGroup },
    },
  },
};
```

It keeps `templateRef = viewChild.required('templateRef')` internally and sets `static __version = 2` (used for V2 component version detection).

## PiyingViewGroupBase

The base class of group components, `@Directive()`. It is declared as a directive only to satisfy Angular dependency injection (it uses `inject()` in the constructor to inject the field signal); **what actually extends it is normally a component** (the built-in `PiyingViewGroup` is an `@Component`). To build a custom group, extend this class and write your own component:

```typescript
import { Component } from '@angular/core';
import { PiyingViewGroupBase } from '@piying/view-angular';

@Component({
  selector: 'my-group',
  standalone: true,
  templateUrl: './my-group.component.html',
})
export class MyGroupComponent extends PiyingViewGroupBase {
  // inherited members (injected in the constructor):
  // field$$()            — current field configuration (PI_VIEW_FIELD_TOKEN)
  // props$$()            — field props
  // children$$()         — list of child fields
  // fixedChildren$$() / restChildren$$() — fixed / variable children of an array
  // fieldTemplateRef     — field template ref (PI_VIEW_FIELD_TEMPLATE_REF_TOKEN, optional)
  // injector             — Injector
}
```

Provided members (all injected in the constructor):

| Member                   | Source                                        | Description                             |
| ------------------------ | --------------------------------------------- | --------------------------------------- |
| `field$$`                | `inject(PI_VIEW_FIELD_TOKEN)`                 | Current field configuration             |
| `props$$()`              | `computed(() => this.field$$().props())`      | Field props                             |
| `children$$()`           | `computed(() => this.field$$().children!())`  | List of child fields                    |
| `fixedChildren$$()`      | `computed(() => this.field$$().fixedChildren?.() ?? [])` | Fixed children of an array (`[]` when absent) |
| `restChildren$$()`       | `computed(() => this.field$$().restChildren?.() ?? [])` | Variable children of an array (`[]` when absent) |
| `fieldTemplateRef`       | `inject(PI_VIEW_FIELD_TEMPLATE_REF_TOKEN, { optional: true })` | Field template reference (optional) |
| `injector`               | `inject(Injector)`                            | Injector                              |

## Related Documents

- [Directives](en/angular/directives/) — field template, control binding and other directives
- [Angular API Reference](en/angular/api/) — index of all public APIs

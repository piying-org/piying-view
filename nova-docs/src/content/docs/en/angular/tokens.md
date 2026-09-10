---
title: "Tokens — Dependency Injection Marks"
---

This page documents the `InjectionToken`s provided by `@piying/view-angular`. They are used to inject the resolved field configuration and component references into field components, directives and wrappers.

```typescript
import {
  PI_VIEW_FIELD_TOKEN,               // current field configuration (Signal)
  PI_VIEW_FIELD_TEMPLATE_REF_TOKEN,  // field template reference (TemplateRef)
  PI_COMPONENT_REF_TOKEN,            // ComponentRef of the field's rendered component
  PI_COMPONENT_LIST,                 // @internal
  PI_COMPONENT_INDEX,                // @internal
  PI_COMPONENT_LIST_LISTEN,          // @internal
  PI_INPUT_OPTIONS_TOKEN,            // input options from core
  PI_INPUT_SCHEMA_TOKEN,             // input schema from core
} from '@piying/view-angular';
```

## PI_VIEW_FIELD_TOKEN

The current field configuration (`Signal<PiResolvedViewFieldConfig>`); a re-export of `PI_VIEW_FIELD_TOKEN` from `@piying/view-angular-core`. Inject it in a custom field component to get the current field:

```typescript
import { inject } from '@angular/core';
import { PI_VIEW_FIELD_TOKEN } from '@piying/view-angular';

@Component({ ... })
export class MyInputComponent {
  readonly field = inject(PI_VIEW_FIELD_TOKEN);
}
```

## PI_VIEW_FIELD_TEMPLATE_REF_TOKEN

The field template reference (`TemplateRef`). Provided/injected in `PiyingView` / `PiyingViewGroupBase` and used to render field templates.

## PI_COMPONENT_REF_TOKEN

The `ComponentRef` of the component that **actually renders** the field. Mostly used inside directives attached to a field, to reach the component reference of that field.

```typescript
import { inject } from '@angular/core';
import { PI_COMPONENT_REF_TOKEN } from '@piying/view-angular';

@Directive({ selector: '[myDirective]', standalone: true })
export class MyDirective {
  injector = inject(Injector);
  componentRef = injector.get(PI_COMPONENT_REF_TOKEN);
  // componentRef.instance — the field component instance
}
```

Key characteristics:

- **It resolves the innermost component even when wrappers are involved**, always returning the component that truly renders the field
- Typically used when a directive needs to access methods / properties of the field component (trigger an internal refresh, read component state)

```typescript
const componentRef = directive.injector.get(PI_COMPONENT_REF_TOKEN);
expect(componentRef.instance).toBeInstanceOf(Test1Component); // ✅
```

> For the directive-configuration use case of this token, see [Field Directive Configuration](en/angular/field-directives/).

## Internal Tokens (@internal)

These tokens are used internally to pass parameters and are rarely needed directly:

| Token                      | Type                                       | Description                |
| -------------------------- | --------------------------------------- | ------------------------ |
| `PI_COMPONENT_LIST`        | `InjectionToken<DynamicComponentConfig[]>` | Component configuration list |
| `PI_COMPONENT_INDEX`       | `InjectionToken<number>`                   | Component index (1-based)   |
| `PI_COMPONENT_LIST_LISTEN` | `InjectionToken<EventEmitter<...>>`        | Component list change event |

## Related Documents

- [Components](en/angular/components/) — how components inject the field configuration
- [Directives](en/angular/directives/) — how directives obtain component references
- [Angular API Reference](en/angular/api/) — index of all public APIs

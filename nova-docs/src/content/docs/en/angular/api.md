---
title: "Angular Package API Reference (@piying/view-angular)"
---

This page is the **index** of the public API of `@piying/view-angular`. Components, directives, tokens and utilities live in their own documents — follow the links for details.

## Components

| Document                   | Description                                            |
| -------------------------- | ---------------------------------------------------- |
| [Components](en/angular/components/) | `PiyingView` root component, `PiyingViewGroup` container, `PiyingViewGroupBase` base class |

## Directives

| Document                   | Description                                                          |
| -------------------------- | ------------------------------------------------------------------ |
| [Directives](en/angular/directives/) | `InsertFieldDirective`, `PiyingFieldTemplateDirective`, `PiyingFieldControlBindDirective`, `AttributesDirective` / `EventsDirective` |
| [Field Directive Config](en/angular/field-directives/) | Behaviour of custom directives attached through `actions.directives` (stable instances, dynamic add/remove) |

## Token

| Document                 | Description                                                    |
| ---------------------- | ------------------------------------------------------------ |
| [Tokens](en/angular/tokens/) | Injection tokens such as `PI_VIEW_FIELD_TOKEN`, `PI_VIEW_FIELD_TEMPLATE_REF_TOKEN`, `PI_COMPONENT_REF_TOKEN` |

## Utilities

| Document                   | Description                                                          |
| ------------------------ | -------------------------------------------------------------- |
| [Utilities](en/angular/tools/) | `typedComponent` / `nfcComponent`, `convertToField`, `NgSchemaHandle` / `AngularFormBuilder`, `actions.directives` |

## Base Classes

| Document                         | Description                             |
| ---------------------------- | -------------------------------------- |
| [BaseControl](en/angular/base-control/) | Base class for field controls implementing `ControlValueAccessor` |

## Next Steps

- [Quick Start](en/getting-started/quick-start/) — writing controls with BaseControl
- [Wrappers](en/api/wrappers/) — using InsertFieldDirective
- [Framework Differences](en/getting-started/framework-differences/) — Field Token comparison across frameworks

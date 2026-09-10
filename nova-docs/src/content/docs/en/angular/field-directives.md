---
title: "Field Directive Configuration"
---

This page documents Angular's **directive configuration** (`actions.directives`): attaching your own directives to a field, directive instance stability, and adding/removing directives at runtime.

> ⚠️ **Two different kinds of directives**:
> - This page is about **directive configuration** — attaching your custom directives (e.g. `D1Directive`) to a field component via `actions.directives`;
> - `PiyingFieldTemplateDirective` (`[fieldTemplate]`) is a manual-mode binding directive exposed by the library, a different category — see [Angular API Reference](en/angular/api/).

## Stable Directive Instances — Inputs Keep Updating

Directives attached to a field through `actions.directives` have **stable instances**: when an input changes the directive instance is not recreated, and its internal data follows the update reactively through signals.

```typescript
import { signal } from '@angular/core';
import { actions } from '@piying/view-angular';
import { D1Directive } from './d1.directive';

const inputs = signal('id1');
const define = v.pipe(
  v.string(),
  setComponent('test1'),
  actions.directives.patchAsync(D1Directive, [
    actions.inputs.patchAsync({ id: () => inputs }),
  ]),
);
```

Then change the input:

```typescript
inputs.set('id2');
```

Result:

- The directive **instance is unchanged** (reference equality, `toBe` assertions pass) and is never recreated
- `id()` inside the directive has already updated to `'id2'` and the DOM attribute follows

> 💡 This guarantees that business state living on the directive (event subscriptions, internal caches) survives input changes.

## Adding / Removing Directives at Runtime

Inside a hook you can drive the directives attached to a field through `field.directives`, without re-rendering the whole field.

```typescript
import { asyncObjectSignal } from '@piying/view-angular-core';
import { NgDirectiveConfig } from '@piying/view-angular';

const makeDirective = () =>
  signal<NgDirectiveConfig>({
    type: D1Directive,
    inputs: asyncObjectSignal({}),
    outputs: asyncObjectSignal({}),
    attributes: asyncObjectSignal({}),
    events: asyncObjectSignal({}),
    model: asyncObjectSignal({}),
  });

const define = v.pipe(
  v.string(),
  setComponent('test1'),
  mergeHooks({
    allFieldsResolved(field) {
      // add a directive dynamically; it takes effect immediately
      field.directives!.add(makeDirective());
      // later clear it (the directive is removed from the DOM)
      field.directives!.clean();
      // and add it again
      field.directives!.add(makeDirective());
    },
  }),
);
```

> `field.directives` offers operations such as `add` (append) and `clean` (remove all), which is handy for toggling directives based on business state (permission checks, watermarks, analytics tracking, and so on).

> 💡 To get the component reference a directive is attached to, inject `PI_COMPONENT_REF_TOKEN`; see [Tokens](en/angular/tokens/).

## Related Documents

- [Angular Package API Reference](en/angular/api/) — full reference for directive configuration and tokens (including the `onInit` input of `PiyingFieldTemplateDirective`)
- [Wrappers](en/api/wrappers/) — relationship between wrappers and component resolution

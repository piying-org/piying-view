---
title: "CSS class — Styling"
---



This page explains how to set the CSS classes of a field through `actions.class`.

## topClass — CSS class of the top container

Adds classes to the outermost container of the field:

```typescript
import { actions } from '@piying/view-angular-core';

const schema = v.pipe(
  v.string(),
  actions.class.top('form-field required'),
);
```

## bottomClass — CSS class of the bottom area

Adds classes to the bottom area of the field (error messages, suffix, etc.):

```typescript
const schema = v.pipe(
  v.string(),
  actions.class.bottom('error-message text-danger'),
);
```

## Full Example

```typescript
import * as v from 'valibot';
import { actions, setComponent } from '@piying/view-angular-core';

const schema = v.object({
  username: v.pipe(
    v.string(),
    setComponent('input'),
    
    // top container classes
    actions.class.top('form-field'),
    // bottom area classes
    actions.class.bottom('help-text'),
  ),

  email: v.pipe(
    v.string(),
    setComponent('input'),
    actions.class.top('email-field required'),
    actions.class.bottom('error-message text-danger'),
  ),
});
```

## Next Steps

- [API: attributes](en/api/attributes/) — setting HTML attributes
- [API: layout](en/api/layout/) — adjusting layout with keyPath / priority
- [API: hideWhen/disableWhen/valueChange](en/api/hide-disable/) — dynamic control

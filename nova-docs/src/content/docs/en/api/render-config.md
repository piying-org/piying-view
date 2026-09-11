---
title: "renderConfig — Render Configuration"
---

```typescript
import * as v from 'valibot';
import { renderConfig } from '@piying/view-angular-core';

const schema = v.object({
  field1: v.pipe(v.string(), renderConfig({ hidden: true })),
  field2: v.pipe(v.string(), renderConfig({ hidden: false })),
});
```

## Type signature

```typescript
interface FieldRenderConfig {
  hidden?: boolean;
}
```

`hidden: true` keeps the component from rendering. The field still takes part in the form and its value stays in the model.

## Difference from hideWhen

|                | `renderConfig({ hidden })`     | `hideWhen`                       |
| -------------- | ------------------------------ | -------------------------------- |
| Hidden state   | static, written in the schema  | follows the value of other fields |
| Use for        | internal fields, fields that are never displayed | conditional hiding |

For dynamic hiding see [`hideWhen`](en/api/hide-disable/).

## Next steps

- [formConfig](en/api/form-config/) — disabling / validation / value transformation
- [Hide & Disable](en/api/hide-disable/) — hideWhen / disableWhen

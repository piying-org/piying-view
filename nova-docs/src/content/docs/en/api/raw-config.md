---
title: "rawConfig — Edit the Config Object Directly"
---

```typescript
import * as v from 'valibot';
import { rawConfig } from '@piying/view-angular-core';

const schema = v.pipe(
  v.string(),
  rawConfig((field) => {
    field.attributes = { ...field.attributes, placeholder: 'Please enter' };
  }),
);
```

## Input

You pass in a callback whose argument is the mutable config object `field` (see the common properties below). Just modify it directly; there is nothing to return.

## Commonly used field properties

| Property       | Description                                   |
| -------------- | --------------------------------------------- |
| `inputs`       | inputs passed to the component                |
| `attributes`   | host element attributes                       |
| `props`        | component options (label, title, ...)         |
| `events`       | event handlers                                |
| `outputs`      | outputs                                       |
| `slots`        | slots                                         |
| `models`       | associated models                             |
| `wrappers`     | wrapper list                                  |
| `formConfig`   | form configuration (disabling / validation / value transformation) |
| `renderConfig` | render configuration (hidden)                 |

## Compared with the ready-made Actions

`actions.inputs.set`, `actions.attributes.patch` and friends already cover most configuration cases and come with type constraints. Prefer them over `rawConfig`.

Inside one pipe, `rawConfig` behaves like the other Actions: the writing order decides.

## Next steps

- [formConfig](en/api/form-config/) — disabling / validation / value transformation
- [renderConfig](en/api/render-config/) — whether a field is rendered
- [inputs](en/api/inputs/) / [attributes](en/api/attributes/) — the ready-made Actions

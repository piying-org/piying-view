---
title: "providers — Injecting Business Services"
---



This page covers managing Providers through Actions (set / patch / change), injecting business services into the injector of a field component. Every framework can use it; only the import source differs:

| Framework                    | actions import                 | inject import          |
| ---------------------------- | ------------------------------ | ---------------------- |
| Angular                      | `@piying/view-angular-core`    | `@angular/core`        |
| Vue / React / Solid / Svelte | `@piying/view-core`            | `static-injector`      |

## actions.providers.set — set providers (replace)

Injects a business service into the field component's injector so the component can use `inject()` directly:

```typescript
import { UserService } from './user.service';
import { actions } from '@piying/view-angular-core';

const schema = v.pipe(v.string(), actions.providers.set([UserService]));
```

Using it inside the component:

```typescript
import { inject } from '@angular/core';

@Component({ ... })
export class MyInputComponent {
  private userSvc = inject(UserService);  // ✅ injected directly, no extra configuration
}
```

## actions.providers.patch — merge providers

Appends new business services to the existing providers:

```typescript
import { LoggerService } from './logger.service';

const schema2 = v.pipe(
  v.string(),
  actions.providers.set([UserService]),
  actions.providers.patch([LoggerService])
);
// final providers = [UserService, LoggerService]
```

## actions.providers.change — change providers (functional append)

Transforms the existing provider list with a function:

```typescript
import { AnalyticsService } from './analytics.service';

const schema3 = v.pipe(
  v.string(),
  actions.providers.set([UserService]),
  actions.providers.change((providers) => [...providers, AnalyticsService])
);
// final providers = [UserService, AnalyticsService]
```

## Next Steps

- [API: wrappers](en/api/wrappers/) — complete wrapper guide (writing wrappers, V1/V2 syntax)
- [API: global-config](en/api/global-config/) — types/wrappers global configuration priorities

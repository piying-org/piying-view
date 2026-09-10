---
title: "hooks — Hook Management"
---



This page covers managing Hooks through Actions (merge / patch / remove / set).

## actions.hooks.merge — merging hooks

Callbacks from several `actions.hooks.merge` calls run in order:

```typescript
import { actions } from '@piying/view-angular-core';

const schema = v.pipe(
  v.string(),
  actions.hooks.merge({
    fieldResolved: (field) => {
      console.log('hook 1');
    },
  }),
  actions.hooks.merge({
    fieldResolved: (field) => {
      console.log('hook 2');
    },
  }),
);

// hook 1 runs first, hook 2 afterwards
```

## actions.hooks.patch — replacing a hook (override)

`actions.hooks.patch` **overrides** a previously registered hook with the same name:

```typescript
import { actions } from '@piying/view-angular-core';

const schema = v.pipe(
  v.string(),
  actions.hooks.patch({
    fieldResolved: (field) => {
      console.log('hook 1');
    }, // ❌ not executed
  }),
  actions.hooks.patch({
    fieldResolved: (field) => {
      console.log('hook 2');
    }, // ✅ only this one runs
  }),
);
```

## actions.hooks.remove — removing hooks

Remove specific hooks by key:

```typescript
import { actions } from '@piying/view-angular-core';

const schema = v.pipe(
  v.string(),
  actions.hooks.merge({
    fieldResolved: (field) => {
      console.log('this will not run');
    },
  }),
  actions.hooks.remove(['fieldResolved']), // remove the fieldResolved hook
);

// no output at all
```

## actions.hooks.set — setting hooks (replace)

`actions.hooks.set` **replaces the whole hooks configuration object**, unlike `merge` which chains callbacks:

```typescript
import { actions } from '@piying/view-angular-core';

const schema = v.pipe(
  v.string(),
  actions.hooks.merge({
    fieldResolved: (field) => {
      console.log('hook 1');
    },
  }),
  actions.hooks.set({
    fieldResolved: (field) => {
      console.log('hook 2');
    },
  }),
);

// only hook 2 runs — set replaces every previously registered hook
```

> **Difference**: `merge` stacks multiple callbacks; `set` replaces the whole hooks object; `patch` merges by key and overrides same-named entries.

## Next Steps

- [API: props](en/api/props/) — generic property configuration
- [API: providers](en/api/providers/) — injecting business services

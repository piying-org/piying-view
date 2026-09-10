---
title: "hideWhen / disableWhen / valueChange — Dynamic Control API Reference"
---



This page documents the full API signatures, parameters and implementation details of the three Actions.

## hideWhen — Hiding Fields Dynamically

### Type Signature

```typescript
interface HideWhenOption {
  disabled?: boolean; // whether to disable the field while hidden
  listen: (
    fn: (input: ValueChangFnOptions) => Observable<{
      field: _PiResolvedCommonViewFieldConfig;
      list: any[];
      listenFields: _PiResolvedCommonViewFieldConfig[];
    }>,
    field: _PiResolvedCommonViewFieldConfig,
  ) => Observable<boolean>;
}

function hideWhen<TInput>(options: HideWhenOption): RawConfigAction<TInput>;
```

### Parameters

| Parameter  | Type       | Required | Description                             |
| ---------- | ---------- | ---- | ------------------------------------ |
| `listen`   | `Function` | ✅   | Listener callback returning `Observable<boolean>` |
| `disabled` | `boolean`  | ❌   | Whether to disable the field while hiding it |

### listen Callback Arguments

```typescript
interface ValueChangFnOptions {
  list?: (KeyPath | undefined)[]; // paths of the fields to listen to
  skipInitValue?: boolean; // skip the initial emission
}
```

Returns `Observable<boolean>`: `true` → hide, `false` → show.

### The listenFields Array

The Observable returned by `fn()` contains a `listenFields` array with the field instances matching each path in `list`:

```typescript
import { hideWhen } from '@piying/view-angular-core';
import { map } from 'rxjs';

const schema = v.object({
  showExtra: v.boolean(),
  extraField: v.pipe(
    v.string(),
    hideWhen({
      listen: (fn) =>
        fn({ list: [['..', 'showExtra']] }).pipe(
          map((item) => !item.list[0]), // showExtra = false → hidden
        ),
    }),
  ),
});
```

### Example: hideWhen + disabled

```typescript
const schema = v.object({
  enable: v.boolean(),
  name: v.pipe(
    v.string(),
    hideWhen({
      disabled: true, // disable it while hidden too
      listen: (fn) => fn({ list: [['..', 'enable']] }).pipe(map((item) => !item.list[0])),
    }),
  ),
});
```

When `enable = false`, `name` is **hidden and disabled at the same time**.

## disableWhen — Disabling Fields Dynamically

### Type Signature

```typescript
interface DisableWhenOption {
  listen: (
    fn: (input: ValueChangFnOptions) => Observable<{
      field: _PiResolvedCommonViewFieldConfig;
      list: any[];
      listenFields: _PiResolvedCommonViewFieldConfig[];
    }>,
    field: _PiResolvedCommonViewFieldConfig,
  ) => Observable<boolean>;
}

function disableWhen<TInput>(options: DisableWhenOption): RawConfigAction<TInput>;
```

### disableWhen vs hideWhen.disabled

| Feature    | `disableWhen`         | `hideWhen({ disabled: true })` |
| -------- | ------------------ | ------------------------------ |
| Capability | Controls `disabled` only | Controls `hidden` + `disabled` |
| When to use | Field visible but not editable | Field invisible and not editable |

### Example

```typescript
import { disableWhen } from '@piying/view-angular-core';
import { map } from 'rxjs';

const schema = v.object({
  isLocked: v.boolean(),
  name: v.pipe(
    v.string(),
    disableWhen({
      listen: (fn) =>
        fn({ list: [['..', 'isLocked']] }).pipe(
          map((item) => item.list[0]), // isLocked = true → disabled
        ),
    }),
  ),
});
```

## valueChange — Value Listening (Side-Effect Free)

### Type Signature

```typescript
type ValueChangeFn = (
  fn: (input?: ValueChangFnOptions) => Observable<{
    field: _PiResolvedCommonViewFieldConfig;
    list: any[];
    listenFields: _PiResolvedCommonViewFieldConfig[];
  }>,
  field: _PiResolvedCommonViewFieldConfig,
) => void;

function valueChange<TInput>(listenFn: ValueChangeFn): RawConfigAction<TInput>;
```

`valueChange` **only listens** to value changes and produces no side effects (it never changes hidden/disabled), which suits custom linkage logic.

```typescript
import { valueChange } from '@piying/view-angular-core';

const schema = v.object({
  source: v.string(),
  target: v.pipe(
    v.string(),
    valueChange((fn) =>
      fn({ list: [['..', 'source']] }).subscribe((value) => {
        // custom logic: watch source and do your own thing
        console.log('source changed to:', value.list[0]);
      }),
    ),
  ),
});
```

## skipInitValue — Skipping the Initial Emission

```typescript
hideWhen({
  listen: (fn) =>
    fn({
      list: [['..', 'field']],
      skipInitValue: true, // do not run the callback during component initialisation
    }).pipe(map((item) => !item.list[0])),
});
```

## Lifecycle Timing

The callbacks of all three Actions run inside the `allFieldsResolved` hook:

```typescript
mergeHooksFn(
  {
    allFieldsResolved: (field) => {
      options
        .listen((options) => valueChangeFn(field, options), field)
        .subscribe((result) => {
          /* update hidden/disabled */
        });
    },
  },
  { position: 'bottom' },
  field,
);
```

This means these three Actions **can only be set up after every field has been resolved**, so they can reference the fields they listen to.

## outputChange — listening to output events

`outputChange` listens to custom output events of the component (such as `@Output()` / emit events) and supports listening to multiple fields.

### Type Signature

```typescript
function outputChange<TInput>(
  fn: (
    input?: OutputChangeFnOptions,
  ) => Observable<{
    list: any[];
    field: _PiResolvedCommonViewFieldConfig;
  }>,
): RawConfigAction<TInput>;
```

### Example: Listening to Component Output Events

```typescript
import { outputChange } from '@piying/view-angular-core';

const schema = v.object({
  childField: v.pipe(
    v.string(),
    actions.outputs.set({ myEvent: (value) => console.log('event:', value) }),
    outputChange((fn) =>
      fn([
        { list: undefined, output: 'myEvent' },
        { list: ['..', 'otherField'], output: 'otherEvent' },
      ]).subscribe((result) => {
        console.log('output change:', result);
      }),
    ),
  ),
});
```

## Related Documents

- [Dynamic Field Control](en/scenarios/dynamic-fields/) — hideWhen/disableWhen/valueChange in practice and common linkage scenarios
- [Complete Example](en/scenarios/complete-example/) — a full business form combining every concept

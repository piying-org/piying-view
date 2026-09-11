---
title: "Core Utilities (@piying/view-angular-core)"
---

This page documents the public signal and form utilities of the core library. Most of them are used internally by the framework packages (`field-control-bind` / `PiyingView`, etc.) but can also be called directly from custom components or Actions.

> These functions are all exported from the package **root entry**: `@piying/view-angular-core` for Angular, `@piying/view-core` for the other frameworks. There is **no `/util` subpath** (the only subpath is `@piying/view-angular-core/adapter`, which exports just `jsonSchemaToValibot`).

## combineSignal — combining signals

Combines several signals into one computed signal and offers add/remove/update operations:

```typescript
import { combineSignal } from '@piying/view-angular-core';
import { signal } from '@angular/core';

const value$ = combineSignal<number>();
console.log(value$()); // []

const a = signal(1);
value$.add(a);        // add
console.log(value$()); // [1]

value$.remove(a);     // remove
console.log(value$()); // []
```

The returned object is a `Signal<Input[]>` with extra methods:

| Method                 | Description                 |
| ---------------------- | -------------------------- |
| `add(item, index?)`    | Adds a signal (optional position) |
| `remove(item)`         | Removes a signal             |
| `items()`              | Returns the internal signal list |
| `clean()`              | Removes everything           |
| `update(fn)`           | Functional list update       |

## observableSignal — signal + RxJS pipe

Wraps a signal as an observable signal supporting an RxJS `pipe`, with input/output/loading state:

```typescript
import { observableSignal } from '@piying/view-angular-core';
import { map, pipe } from 'rxjs';

const value$ = observableSignal(1, {
  pipe: pipe(map((value: number) => value * 2)),
  autoDestroy: false,
});
console.log(value$());       // 2 (value after the pipe)
console.log(value$.output()); // 2

value$.set(2);
console.log(value$());       // 4
console.log(value$.output()); // 4
```

The returned object is a `WritableSignal<Output>` with extra members:

| Member        | Type                    | Description               |
| ------------- | ----------------------- | ------------------------ |
| `input`       | `Signal<Input>`         | Original input signal      |
| `output`      | `Signal<Output>`        | Output signal after the pipe |
| `loading`     | `Signal<boolean>`       | Whether the pipe is loading |
| `input$$`     | `Observable<Input>`     | Input observable stream    |
| `output$$`    | `Observable<Output>`    | Output observable stream   |
| `subject`     | `BehaviorSubject<Input>` | Internal input subject    |
| `set(value)`  | —                        | Sets the input and runs the pipe |
| `update(fn)`  | —                        | Functional input update     |

**Options:**

| Option        | Type            | Description                    |
| ------------- | --------------- | ----------------------------- |
| `pipe`        | `OperatorFunction<Input, Output>` | RxJS pipe              |
| `injector`    | `Injector`      | Used to unsubscribe on destroy |
| `autoDestroy` | `boolean`       | Default `true`; completes automatically when the injector is destroyed |

## asyncObjectSignal — asynchronous object signal

Manages an object signal whose values may be `Promise` / `Observable` / `Signal` / plain values, writing asynchronous results automatically:

```typescript
import { asyncObjectSignal } from '@piying/view-angular-core';
import { signal } from '@angular/core';
import { Subject } from 'rxjs';

const value$ = asyncObjectSignal<any>({ value: 1 });

// plain update
value$.update((data) => ({ ...data, value2: 2 }));
value$.set({ value3: 3 });

// connect an async value (Promise)
value$.connect('k1', Promise.resolve(20));
// connect an Observable
const sub$ = new Subject();
value$.connect('k1', sub$);
sub$.next(1); // value$() = { value: 1, k1: 1 }

// connect a Signal
const s$ = signal(0);
value$.connect('k1', s$);
s$.set(1); // value$() = { value: 1, k1: 1 }

// disconnect
value$.disconnect('k1');
```

The returned object is a `Signal<Input>` with extra methods:

| Method              | Description                                |
| ------------------ | ---------------------------------------- |
| `connect(key, value)` | Connect an async value (Promise/Observable/Signal/plain value) |
| `disconnect(key)`  | Disconnects the async value of a key        |
| `set(value)`       | Replaces the whole object                    |
| `update(fn)`       | Functional update                            |
| `map(fn)`          | Sets a mapping function applied to the final value |

**Value types supported by `connect`:**

| Type         | Behavior                                |
| ------------ | -------------------------------------- |
| `Promise`    | Written after resolve                    |
| `Observable` | Subscribes to every next value           |
| `Signal`     | Read reactively; updates on signal change |
| Plain value  | Written immediately                      |

## condition — conditional Actions

`condition` runs different Actions depending on the environment or a condition; `environments` must be configured in the component options:

```typescript
import * as v from 'valibot';
import { condition, rawConfig } from '@piying/view-angular-core';

const schema = v.object({
  key1: v.pipe(
    v.string(),
    condition({
      environments: ['default'],
      actions: [
        rawConfig((item) => {
          item.inputs = { ...item.inputs, type: 'date' };
          return item;
        }),
      ],
    }),
  ),
});
```

> `environments` matches the current environment and runs the corresponding `actions` on a match.

## Other Utilities

| Name                          | Kind     | Description                                                              |
| ----------------------------- | -------- | ------------------------------------------------------------------------ |
| `toArray`                     | function | Normalizes a single value / array / iterable into an array               |
| `clone`                       | function | Deep clone (used when copying form values)                               |
| `SortedArray`                 | class    | Extends `Array`, re-sorts with the given `compareFn` after `push`        |
| `arrayStartsWith`             | function | Array prefix match (used for key-path comparison)                        |
| `controlStatusList`           | function | `(control?, skipDisabled?) => string[]`, e.g. `['touched','pristine','valid']` |
| `fieldControlStatusClass`     | function | Same as above, joined as `pi-touched pi-pristine pi-valid`               |
| `errorSummary` / `getDeepError` | function  | Error summary for the field itself / including descendants              |
| `effectListen`                | function | Creates an effect inside a `static-injector` injector                    |
| `toObservable`                | function | Signal → Observable (supports options such as `distinct`)                |
| `lazyMark` / `getLazyImport`  | function | Two-step lazy loading: `lazyMark(factory)` marks, `getLazyImport(type)` retrieves the factory |
| `isLazyMark`                  | function | Whether a component type is a lazy-loading marker                        |
| `computedWithPrev`            | function | `computed` variant that can read the previous value                      |
| `asyncValidatorToSignal`      | function | Normalizes Promise / Observable / Signal async validators into a Signal  |
| `initListen`                  | function | Two-way listening between the root form and the external model           |
| `createViewControlLink`       | function | Links a `ControlValueAccessor` to a field control (used by framework packages) |

> Only `observableSignal` exists (documented above) — there is **no** `createObservableSignal`. `unwrapSignal` does not exist either, only the types `UnWrapSignal` / `SignalInputValue`.

## Next Steps

- [Core Concepts](en/getting-started/core-concept/) — the Schema → Field → Component resolution chain
- [Control API](en/api/control-api/) — value / state / validation APIs of form controls
- [formConfig](en/api/form-config/) — form configuration

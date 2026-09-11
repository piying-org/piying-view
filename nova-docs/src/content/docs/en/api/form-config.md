---
title: "formConfig — Form Configuration"
---

```typescript
import * as v from 'valibot';
import { formConfig } from '@piying/view-angular-core';

const schema = v.object({
  // disabled
  a: v.pipe(v.string(), formConfig({ disabled: true })),
  // update the model on blur only
  b: v.pipe(v.string(), formConfig({ updateOn: 'blur' })),
  // an empty array outputs []
  c: v.pipe(v.array(v.string()), formConfig({ emptyValue: [] })),
});
```

## Type signature

```typescript
interface FieldFormConfig<T = any> {
  // common
  disabled?: boolean; // disable this field
  disabledValue?: 'reserve' | 'delete'; // how value is handled while disabled
  transformer?: FieldTransformerConfig; // value transformer (toModel / toView)
  pipe?: { toModel?: UnaryFunction<Observable<any>, Observable<T>> }; // value stream pipeline
  defaultValue?: any; // default value
  validators?: ValidatorFn[]; // synchronous validators
  asyncValidators?: AsyncValidatorFn[]; // asynchronous validators
  updateOn?: 'change' | 'blur' | 'submit'; // when the value is updated

  // derived from the schema
  required?: boolean;
  undefinedable?: boolean;
  nullable?: boolean;

  // array / group / logic group
  emptyValue?: any;

  // array
  deletionMode?: 'shrink' | 'mark';

  // group / array
  groupMode?: 'loose' | 'default' | 'strict' | 'reset';
  groupKeySchema?: BaseSchema<any, any, any>;
  groupValueSchema?: BaseSchema<any, any, any>;

  // logic group
  disableOrUpdateActivate?: boolean;
}
```

## Disabling

| Field           | Description                                                                                   |
| --------------- | --------------------------------------------------------------------------------------------- |
| `disabled`      | disable this field                                                                            |
| `disabledValue` | `'reserve'` (default) keeps the value; `'delete'` leaves the value out of the model            |

```typescript
formConfig({ disabled: true });
formConfig({ disabled: true, disabledValue: 'delete' });
```

To disable a field depending on the value of another one, use [`disableWhen`](en/api/hide-disable/).

## Value transformation

`transformer` performs synchronous conversions and supports both directions; `pipe` wraps the value stream in an RxJS pipeline (debounce, filter, ...) and currently only supports the `toModel` direction:

```typescript
interface FieldTransformerConfig {
  toModel?: (value: any, control: AbstractControl) => any; // view → model
  toView?: (value: any, control: AbstractControl) => any; // model → view
}
```

```typescript
import { pipe, debounceTime, filter, map } from 'rxjs';

const schema = v.object({
  // toModel: strip spaces + uppercase
  code: v.pipe(
    v.string(),
    formConfig({
      transformer: {
        toModel: (value) => value?.replace(/\s/g, '').toUpperCase() ?? '',
      },
    }),
  ),

  // toView: always display in lower case
  name: v.pipe(
    v.string(),
    formConfig({
      transformer: {
        toView: (value) => value?.toLowerCase() ?? '',
      },
    }),
  ),
});

// debounce + filter + transform
formConfig({
  pipe: {
    toModel: pipe(
      debounceTime(300),
      filter((v) => v.trim().length > 0),
      map((v) => v.toLowerCase()),
    ),
  },
});
```

## Validation

Pass an array of validator functions through `validators` / `asyncValidators`. The signatures are:

```typescript
interface ValidatorFn {
  (control: AbstractControl):
    ValidationErrorsLegacy | ValidationErrors2[] | undefined;
}

interface AsyncValidatorFn {
  (control: AbstractControl):
    | Promise<ValidationErrorsLegacy | ValidationErrors2[] | undefined>
    | Observable<ValidationErrorsLegacy | ValidationErrors2[] | undefined>
    | Signal<ValidationErrorsLegacy | ValidationErrors2[] | undefined>;
}
```

Return `undefined` when the value is valid; otherwise return one of the two shapes:

```typescript
type ValidationErrorsLegacy = { [key: string]: any };

type ValidationErrors2 =
  | { kind: 'valibot'; metadata: [v.BaseIssue<unknown>, ...v.BaseIssue<unknown>[]] }
  | { kind: 'error'; metadata: Error }
  | { kind: 'descendant'; key: string | number; field: AbstractControl; metadata: ValidationCommonError2[] }
  | { kind: string; metadata?: any; message?: string };
```

```typescript
formConfig({
  validators: [
    (control) => {
      if (control.value.length < 6) {
        return [
          {
            kind: 'minLength',
            metadata: { required: 6, actual: control.value.length },
            message: 'at least 6 characters',
          },
        ];
      }
      return undefined;
    },
  ],
  asyncValidators: [
    async (control) => {
      const { available } = await fetch(`/api/check?value=${control.value}`).then((r) => r.json());
      if (!available) {
        return [{ kind: 'duplicate', metadata: { value: control.value }, message: 'this value already exists' }];
      }
      return undefined;
    },
  ],
});
```

An asynchronous validator may return a `Promise`, an `Observable` or a `Signal`. It runs in parallel with the synchronous validators and its errors are merged automatically; while it is pending the control status is `PENDING`.

> More validation patterns: [Custom Validation](en/scenarios/custom-validation/).

## Update timing

```typescript
formConfig({ updateOn: 'change' }); // default, updates on input
formConfig({ updateOn: 'blur' }); // updates on blur
formConfig({ updateOn: 'submit' }); // updates on submit
```

## Arrays and form groups

| Field              | Applies to                  | Description                                                                                     |
| ------------------ | --------------------------- | ----------------------------------------------------------------------------------------------- |
| `emptyValue`       | array / group / logic group | used as the final value when the aggregated result is empty (empty array, empty object, no matching branch) |
| `deletionMode`     | array                       | `'shrink'` (default) shortens the array; `'mark'` sets the slot to `undefined` and keeps the length |
| `groupMode`        | group / array               | how extra keys / surplus items are handled, see table below                                     |
| `groupKeySchema`   | group (record)              | key type constraint                                                                             |
| `groupValueSchema` | group / array               | value / element type constraint                                                                 |

```typescript
formConfig({ emptyValue: [] }); // output [] when the array is empty
formConfig({ deletionMode: 'mark' });
```

## Logic groups

For logic groups resolved from `v.intersect()` / `v.union()` of type `or`, updating the value automatically activates the first matching branch. Set this to `true` to turn the automatic activation off:

```typescript
formConfig({ disableOrUpdateActivate: true });
```

## Configuration derived from the schema

The fields below normally **do not need to be set manually** — a correct schema produces them; a manually provided value overrides the derived one.

| Field              | Derived from                                                                                                                  |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| `undefinedable`    | `v.optional()` / `v.undefinedable()`                                                                                          |
| `nullable`         | `v.nullable()` / `v.nullish()`                                                                                                |
| `required`         | `!undefinedable && !nullable`                                                                                                 |
| `defaultValue`     | the second argument of `v.optional(schema, defaultValue)`                                                                      |
| `groupMode`        | `v.object()` → `default`; `v.looseObject()` → `loose`; `v.strictObject()` → `strict`; `v.array()` / the rest part → `reset`   |
| `groupKeySchema`   | the key schema of `v.record()`                                                                                                |
| `groupValueSchema` | the value schema of `v.record()` / the element schema of `v.array()`                                                          |

```typescript
const schema = v.object({
  a: v.string(), // required: true
  b: v.optional(v.string()), // required: false, undefinedable: true, groupMode: 'default'
  c: v.optional(v.nullable(v.string()), 'default text'), // nullable: true, defaultValue: 'default text'
  d: v.looseObject({ x: v.string() }), // groupMode: 'loose'
});
```

## Complete example

```typescript
import * as v from 'valibot';
import { formConfig } from '@piying/view-angular-core';
import { debounceTime, filter, map, pipe } from 'rxjs';

const schema = v.object({
  // search box: debounce + filter + transform
  search: v.pipe(
    v.string(),
    formConfig({
      updateOn: 'change',
      pipe: {
        toModel: pipe(
          debounceTime(300),
          filter((v) => v.trim().length > 0),
          map((v) => v.toLowerCase()),
        ),
      },
    }),
  ),

  // price: trim + structured validation
  price: v.pipe(
    v.string(),
    formConfig({
      transformer: {
        toModel: (value) => value?.trim() ?? '',
      },
      validators: [
        (control) => {
          const val = parseFloat(control.value);
          if (val < 0) {
            return [{ kind: 'negative', message: 'price cannot be negative' }];
          }
          if (val > 999999) {
            return [{ kind: 'tooLarge', message: 'price out of range' }];
          }
          return undefined;
        },
      ],
    }),
  ),

  // username: synchronous length check + asynchronous uniqueness check
  username: v.pipe(
    v.string(),
    formConfig({
      validators: [
        (control) =>
          control.value.length < 3
            ? [{ kind: 'tooShort', message: 'username must be at least 3 characters' }]
            : undefined,
      ],
      asyncValidators: [
        async (control) => {
          const { available } = await fetch(
            `/api/check-username?name=${control.value}`,
          ).then((r) => r.json());
          return available
            ? undefined
            : [
                {
                  kind: 'usernameTaken',
                  metadata: { value: control.value },
                  message: 'this username is taken',
                },
              ];
        },
      ],
    }),
  ),

  // array: mark deletion mode + empty value fallback
  tags: v.pipe(
    v.array(v.string()),
    formConfig({ deletionMode: 'mark', emptyValue: [] }),
  ),
});
```

## Next steps

- [Hide & Disable](en/api/hide-disable/) — hideWhen / disableWhen
- [renderConfig](en/api/render-config/) — whether a field is rendered
- [Global Configuration](en/api/global-config/) — the priority system of fieldGlobalConfig
- [Value Transformation & Linkage](en/scenarios/value-transform/) — transformer / pipe in practice
- [Advanced Array Usage](en/scenarios/array-advanced/) — deletionMode / groupMode in practice
- [Custom Validation](en/scenarios/custom-validation/) — validators and group validation

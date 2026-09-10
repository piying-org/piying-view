---
title: "FieldFormConfig — Field Form Configuration"
---



`FieldFormConfig` is the configuration object accepted by the `formConfig()` Action; it controls the form-level behaviour of a field.

> 💡 **Tip:** fields marked with 🔄 are **parsed and extracted** from schema metadata and never need to be configured manually.

## rawConfig — direct access to the field configuration

`rawConfig` lets you read and mutate `FieldConfig` directly inside the schema pipeline, which is useful when writing custom Action wrappers. It takes a callback whose argument is the current field's configuration object:

```typescript
import { rawConfig } from '@piying/view-angular-core';

const schema = v.pipe(
  v.string(),
  rawConfig((item) => {
    // mutate inputs directly
    item.inputs = { ...item.inputs, type: 'date' };
    // mutate attributes directly
    item.attributes.placeholder = 'Please select a date';
    return item;
  }),
);
```

> **Note**: `rawConfig` bypasses type safety and should only be used when you need fine-grained control. Prefer the existing Actions (`actions.inputs.set`, `actions.attributes.patch`, ...) in most cases.

---

## renderConfig — rendering configuration

`renderConfig` controls component rendering behaviour at the schema level:

| Parameter | Description                 |
| -------- | ---------------- |
| `hidden`  | Controls whether the component is hidden |

```typescript
import { renderConfig } from '@piying/view-angular-core';

const schema = v.object({
  field1: v.pipe(v.string(), renderConfig({ hidden: true })),
  field2: v.pipe(v.string(), renderConfig({ hidden: false })),
});
```

> **Difference from `hideWhen`**: `renderConfig({ hidden })` sets a static hidden state, while `hideWhen` hides conditionally through a listener function. Prefer `hideWhen` for dynamic control.

---

## Type Signature

```typescript
interface FieldFormConfig<T = any> {
  disabled?: boolean; // disable this field
  disabledValue?: DisabledValueStrategy; // value strategy while disabled
  transformer?: FieldTransformerConfig; // value transformer (toModel / toView)
  pipe?: { toModel?: UnaryFunction<Observable<any>, Observable<T>> }; // RxJS pipe
  defaultValue?: any; // 🔄 parsed metadata | default value (extracted from the schema default)
  validators?: ValidatorFn[]; // custom synchronous validators
  asyncValidators?: AsyncValidatorFn[]; // custom asynchronous validators
  updateOn?: FormHooks; // when updates are applied
  required?: boolean; // 🔄 parsed metadata | required flag (derived from undefinedable/nullable)
  undefinedable?: boolean; // 🔄 parsed metadata | allow undefined
  nullable?: boolean; // 🔄 parsed metadata | allow null
  emptyValue?: any; // empty value fallback for group/array
  deletionMode?: ArrayDeletionMode; // array deletion mode
  groupMode?: 'loose' | 'default' | 'strict' | 'reset'; // 🔄 parsed metadata | group validation mode (from the schema type)
  groupKeySchema?: BaseSchema<any, any, any>; // 🔄 parsed metadata | record key constraint
  groupValueSchema?: BaseSchema<any, any, any>; // 🔄 parsed metadata | record/array value constraint
  disableOrUpdateActivate?: boolean; // auto-activate when a LogicGroup 'or' switches
}
```

## Field Reference

### disabled — disabled state

```typescript
formConfig({ disabled: true });
```

A disabled field cannot be edited and its value is not submitted. Combine it with `disableWhen` for dynamic control.

### disabledValue — disabled value strategy

| Value                  | Description              |
| ------------------- | ---------------- |
| `'reserve'` (default)  | Keeps the current value when disabled |
| `'delete'`             | Removes the value when disabled |

```typescript
formConfig({ disabledValue: 'delete' });
```

### transformer — value transformer

```typescript
interface FieldTransformerConfig {
  toView?: (value: any, control: AbstractControl) => any; // model → view
  toModel?: (value: any, control: AbstractControl) => any; // view → model
}
```

**toModel example:**

```typescript
formConfig({
  transformer: {
    toModel: (value: any) => parseFloat(value), // string "19.99" → number 19.99
  },
});
```

**toView example:**

```typescript
formConfig({
  transformer: {
    toView: (value: any) => value?.toFixed(2) ?? '0.00',
  },
});
```

### pipe — RxJS observable pipe

Transform the value stream with RxJS operators:

```typescript
import { debounceTime, filter, map, pipe } from 'rxjs';

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

**Available RxJS operators:**

| Operator               | Purpose | Example                    |
| ---------------------- | ---- | ------------------------- |
| `debounceTime`         | Debounce | `debounceTime(300)`        |
| `distinctUntilChanged` | Deduplicate | `distinctUntilChanged()` |
| `filter`               | Filter | `filter((v) => v !== '')`  |
| `map`                  | Transform | `map((v) => v.trim())`    |
| `sampleTime`           | Sample | `sampleTime(1000)`         |

### defaultValue — default value 🔄 parsed metadata

This field is **extracted** from the `v.default()` metadata of the schema. You can override it with `formConfig()`.

```typescript
formConfig({ defaultValue: 'Default name' });
```


### validators — synchronous validators

```typescript
import { formConfig, ValidatorFn } from '@piying/view-angular-core';

formConfig({
  validators: [
    (control) => {
      // style 1: return ValidationErrorsLegacy (backward compatible)
      if (!control.value.match(/^[A-Z]/)) {
        return { uppercaseStart: 'Must start with an uppercase letter' };
      }
      return null;
    },
    (control) => {
      // style 2: return ValidationErrors2[] (new format)
      if (control.value.length < 6) {
        return [
          {
            kind: 'minLength',
            metadata: { required: 6, actual: control.value.length },
            message: 'At least 6 characters',
          },
        ];
      }
      return undefined;
    },
  ],
});
```

**Validator function signature:**

```typescript
interface ValidatorFn {
  (control: AbstractControl):
    | ValidationErrorsLegacy // old format: { [key: string]: any }
    | ValidationErrors2[] // new format: structured error array
    | undefined;
}

// ValidationErrors2 is a union type including:
type ValidationErrors2 =
  | { kind: 'valibot'; metadata: v.BaseIssue<unknown>[] } // Valibot validation failure
  | { kind: 'error'; metadata: Error } // captured exception
  | { kind: 'descendant'; key: string | number; field: AbstractControl; metadata: ValidationErrors2[] } // child field error
  | { kind: string; metadata?: any; message?: string }; // custom error
```

**Return values:**

- Return `null` / `undefined`: validation passed
- Return `{ [errorKey]: errorValue }`: old-format error (backward compatible)
- Return `[{ kind, metadata, message? }]`: new-format error (recommended)

### asyncValidators — asynchronous validators

Async validators cover slow operations such as network requests or database queries. They may return a Promise, an Observable or a Signal:

```typescript
import { formConfig, AsyncValidatorFn } from '@piying/view-angular-core';
import { Observable } from 'rxjs';

formConfig({
  asyncValidators: [
    // style 1: Promise + old format
    async (control) => {
      const resp = await fetch(`/api/check?value=${control.value}`);
      const available = await resp.json();
      if (!available) {
        return { usernameTaken: 'This username is already taken' };
      }
      return null;
    },

    // style 2: Promise + new format
    async (control) => {
      const isUnique = await checkUniqueness(control.value);
      if (!isUnique) {
        return [
          {
            kind: 'duplicate',
            metadata: { value: control.value },
            message: 'This value already exists, please pick another one',
          },
        ];
      }
      return undefined;
    },

    // style 3: Observable
    (control) => {
      return checkValue$(control.value).pipe(
        map((isValid) => {
          if (!isValid) {
            return [{ kind: 'invalid', message: 'Validation failed' }];
          }
          return undefined;
        }),
      );
    },

    // style 4: Signal
    (control) => {
      return computed(() => {
        const result = someSignal();
        if (!result.valid) {
          return [{ kind: 'signaError', metadata: result.error }];
        }
        return undefined;
      });
    },
  ],
});
```

**Validator function signature:**

```typescript
interface AsyncValidatorFn {
  (control: AbstractControl): Promise<ValidationErrorsLegacy | ValidationErrors2[] | undefined> | Observable<ValidationErrorsLegacy | ValidationErrors2[] | undefined> | Signal<ValidationErrorsLegacy | ValidationErrors2[] | undefined>;
}
```

**Key characteristics:**

- Supports Promise, Observable and Signal return values
- Return values match the synchronous validators (old or new format)
- While an async validator runs, `control.status` becomes `PENDING`
- They can run in parallel with sync validators; errors are merged automatically

### updateOn — when updates are applied

```typescript
import { FormHooks } from '@piying/view-angular-core';

// change: update on every keystroke (default)
formConfig({ updateOn: 'change' });

// blur: update when the control loses focus
formConfig({ updateOn: 'blur' });

// submit: update on form submit
formConfig({ updateOn: 'submit' });
```

### required / undefinedable / nullable — 🔄 parsed metadata

These three fields are **extracted** from the `optional()` and `nullable()` metadata of the schema and generally **must not be set manually**.

| Configuration     | Description      | Metadata source                       |
| --------------- | -------------- | ------------------------------------- |
| `required`      | Required flag    | derived from `!undefinedable && !nullable` |
| `undefinedable` | Allow undefined  | from the schema's `optional()`        |
| `nullable`      | Allow null       | from the schema's `nullable()`        |

```typescript
// ❌ usually unnecessary, it is derived automatically
// formConfig({ required: true, undefinedable: true, nullable: false });

// ✅ defined in the schema and converted into formConfig automatically
const schema = v.object({
  field1: v.string(), // required=true, undefinedable=false, nullable=false
  field2: v.optional(v.string()), // required=false, undefinedable=true, nullable=false
  field3: v.nullable(v.string()), // required=true, undefinedable=false, nullable=true
  field4: v.optional(v.nullable(v.string())), // required=false, undefinedable=true, nullable=true
});
```

**Extraction mechanism:**

```typescript
override beforeSchemaType(schema: Schema): void {
  this.formConfig.required = !this.undefinedable && !this.nullable;
  this.formConfig.undefinedable = this.undefinedable;
  this.formConfig.nullable = this.nullable;
}
```

### emptyValue — empty value fallback

Falls back to `emptyValue` when validation fails:

```typescript
formConfig({ emptyValue: {} }); // Group
formConfig({ emptyValue: [] }); // Array
```

### deletionMode — array deletion mode

| Value                | Description                            |
| ------------------ | -------------------------------------- |
| `'shrink'` (default) | The array shrinks after deletion        |
| `'mark'`             | The slot becomes `undefined`, length unchanged |

```typescript
formConfig({ deletionMode: 'mark' });
```

### groupMode — group validation mode 🔄 parsed metadata

This field is **extracted** from the schema's type information.
| Value | Description | schema metadata source |
| ----------- | ---------------------------- | ---------------------------------------- |
| `'default'` | Standard validation: all children must pass | `v.object()` / `v.tuple()` |
| `'loose'` | Loose validation: partial failures do not affect the whole | `v.loose_object()` / `v.loose_tuple()` |
| `'strict'` | Strict validation: extra structural integrity checks | `v.strict_object()` / `v.strict_tuple()` |
| `'reset'` | Reset mode: validation resets on value change | `v.array()` / `v.rest()` |

```typescript
// ✅ automatic metadata extraction example
const schema = v.object({
  field: v.string(),
  // this object resolves to groupMode: 'default'
});

const schema2 = v.loose_object({
  field: v.string(),
  // this loose_object resolves to groupMode: 'loose'
});

const schema3 = v.array(v.string());
// this array resolves to groupMode: 'reset'

// ❌ manual override (not recommended unless you really need it)
formConfig({ groupMode: 'loose' });
```

**Extraction mechanism:**

```typescript
override objectDefault(schema: ObjectSchema): void {
  if (schema.type === 'object') {
    this.formConfig.groupMode = 'default';
  } else if (schema.type === 'loose_object') {
    this.formConfig.groupMode = 'loose';
  } else if (schema.type === 'strict_object') {
    this.formConfig.groupMode = 'strict';
  }
}

override arraySchema(schema: ArraySchema): void {
  this.formConfig.groupMode = 'reset';
}
```

### groupKeySchema / groupValueSchema — 🔄 parsed metadata

These two fields are extracted from the metadata of `v.record()` and `v.array()`.

**Extraction sources:**

- `groupKeySchema` — from the key schema of `v.record()`
- `groupValueSchema` — from the value schema of `v.record()` or the element schema of `v.array()`

```typescript
// ✅ metadata extraction example
const schema = v.object({
  // Record type — resolves both groupKeySchema and groupValueSchema
  metadata: v.record(
    v.picklist(['name', 'email', 'phone']), // ← extracted as groupKeySchema
    v.string(), // ← extracted as groupValueSchema
  ),

  // Array type — resolves groupValueSchema
  tags: v.array(v.string()), // ← extracted as groupValueSchema: v.string()
});

// ❌ manual override (not recommended)
formConfig({
  groupKeySchema: v.picklist(['name', 'email', 'phone']),
  groupValueSchema: v.pipe(v.string(), v.minLength(1)),
});
```

## Full Example

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

  // price: string ↔ number conversion + new-format validation
  price: v.pipe(
    v.string(),
    formConfig({
      transformer: {
        toModel: (value: any) => parseFloat(value),
        toView: (value: any) => value?.toFixed(2) ?? '0.00',
      },
      validators: [
        // new format: return a structured error array
        (control) => {
          const val = parseFloat(control.value);
          if (val < 0) {
            return [{ kind: 'negative', message: 'Price cannot be negative' }];
          }
          if (val > 999999) {
            return [{ kind: 'tooLarge', message: 'Price out of range' }];
          }
          return undefined;
        },
      ],
    }),
  ),

  // required field
  name: v.pipe(v.string(), formConfig({ required: true, defaultValue: '' })),

  // username: async validation + sync validation
  username: v.pipe(
    v.string(),
    formConfig({
      validators: [
        (control) => {
          // sync validation: length check
          if (control.value.length < 3) {
            return [{ kind: 'tooShort', message: 'Username must be at least 3 characters' }];
          }
          return undefined;
        },
      ],
      asyncValidators: [
        // async validation: uniqueness check
        async (control) => {
          const resp = await fetch(`/api/check-username?name=${control.value}`);
          const { available } = await resp.json();
          if (!available) {
            return [
              {
                kind: 'usernameTaken',
                metadata: { value: control.value },
                message: 'This username is already taken',
              },
            ];
          }
          return undefined;
        },
      ],
    }),
  ),

  // array + mark deletion mode
  tags: v.pipe(v.array(v.string()), formConfig({ deletionMode: 'mark', emptyValue: [] })),

  // Record + loose validation
  metadata: v.pipe(v.record(v.string(), v.string()), formConfig({ groupMode: 'loose' })),
});
```

## Next Steps

- [API: global-config](en/api/global-config/) — priority system of fieldGlobalConfig
- [Scenario: Value Transformation and Linkage](en/scenarios/value-transform/) — transformer / pipe in practice
- [Scenario: Advanced Array Usage](en/scenarios/array-advanced/) — deletionMode / groupMode in practice

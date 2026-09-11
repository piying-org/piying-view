---
title: "AbstractControl — Form Control Instance API"
---

Piying-View's Control system is the heart of the form: it manages values, tracks state, runs validation and navigates child fields. Controls are created automatically by the library while the schema is parsed and converted.

---

## ⚠️ Important: the Control lifecycle

```
Schema definition → convert() / FormBuilder → Control created automatically → field.form.control
```

- Controls are created automatically during parsing
- Access them through `field.form.control` (root control) or `field.form.root`
- A control queries other controls with `field.get(path)`

---

## Getting a Control Instance

### Automatic Creation of Controls

Once passed into the component, a control is instantiated automatically and available inside actions.

```typescript
// in the template: pass a schema, the framework generates the Control automatically
<piying-view [schema]="schema" [(model)]="formData"></piying-view>
```

### Accessing the Control in Hooks

Inside callbacks registered with `actions.hooks`, read the Control straight from the provided `field` argument:

```typescript
import * as v from 'valibot';
import { actions, formConfig } from '@piying/view-angular-core';

const schema = v.object({
  name: v.pipe(
    v.string(),
    actions.hooks.merge({
      fieldResolved(field) {
        // field.form.control — the Control of the current field (FieldControl)
        console.log(field.form.control?.value);
      },
      allFieldsResolved(field) {
        // once every field has been resolved you can reach the root control
        const rootCtrl = field.form.root;
        const nameCtrl = field.form.control;
        // get a child control by path
        const child = field.get(['childPath']);
      },
    }),
  ),
});
```

### Accessing the Control in a Custom Component

Inside a custom component rendered by Piying-View, inject `PI_VIEW_FIELD_TOKEN` to get the current field:

```typescript
import { inject } from '@angular/core';
import { PI_VIEW_FIELD_TOKEN, BaseControl } from '@piying/view-angular';

@Component({
  /* ... */
})
export class MyInputComponent extends BaseControl {
  // field is a signal; calling it returns PiResolvedViewFieldConfig
  readonly field = inject(PI_VIEW_FIELD_TOKEN);

  ngOnInit() {
    const f = this.field(); // current field configuration
    console.log(f.form.control); // Control instance
    console.log(f.parent); // parent field
    console.log(f.children!()); // list of child fields (Group)
  }
}
```

### Access Patterns at a Glance

| Scenario                     | Access method                                | Description                      |
| ------------------------ | -------------------------------------------- | ------------------------------ |
| Current field's Control in a hook | `field.form.control`                    | Control of the current field     |
| Root control in a hook       | `field.form.root`                            | Root control of the whole form   |
| Inside a custom component    | `inject(PI_VIEW_FIELD_TOKEN)().form.control` | Inject the field, then read control |
| Child control (by path)      | `root.get('child')` / `root.get(['a', 'b'])` | Returns `AbstractControl \| null` |
| Parent field                 | `field.parent` (Field level)                  | Parent Field of the current field |

### Type Hierarchy

```typescript
// inheritance chain
AbstractControl<TValue>          // abstract base class
├── FieldControl<TValue>         // leaf control (maps to primitive types)
├── FieldGroupbase               // group base
│   ├── FieldGroup               // object group
│   └── FieldArray               // array control
│       └── FieldLogicGroup      // logic group
```

---

## Value API

### Reading Values

| Property            | Type                          | Description                                      |
| ------------------- | ----------------------------- | ------------------------------------------------- |
| `control.value`     | `TValue`                      | Current value after schema validation/conversion (getter) |
| `control.value$$()` | `Signal<TValue \| undefined>` | computed signal with previous-value tracking (computedWithPrev) |

```typescript
// read the current value
console.log(control.value); // e.g. "hello"

// read through a signal (reactive)
const val = control.value$$(); // call the Signal
```

### Writing Values

#### `updateValue(value, force?)` — update the control value

Sets the control value programmatically and runs validation and conversion.

```typescript
import { firstValueFrom } from 'rxjs';

// basic usage
control.updateValue('new value');

// force the update (skip the pristine && untouched check)
control.updateValue('force update', true);

// watch value changes
control.valueChanges.subscribe((val) => {
  console.log('value changed to:', val);
});

// async/await style
let result = await firstValueFrom(control.valueChanges);
control.updateValue('111');
result = await firstValueFrom(control.valueChanges.pipe(skip(1)));
console.log(result); // '111'
```

**Update flow:**

1. `updateValue` is called → the `modelValue$` signal is set
2. `transformer.toView` conversion (when configured)
3. Valibot schema validation/conversion → `value$$` is updated
4. The `valueChanges` observable emits

#### `reset(formState?)` — reset the control

Restores the control to its initial state and marks it pristine + untouched.

```typescript
// reset to a given value
control.reset(['v3', 'v4']);

// reset to the default value (defaultValue / schema default)
control.reset();

// works on FieldControl
control.reset('default string');

// works on FieldGroup
groupControl.reset({ name: '', age: 0 });

// reset after validation
control.viewValueChange('1');
console.log(control.errors); // has errors
control.reset();
console.log(control.errors); // undefined (cleared)
```

### View Value Changes

#### `viewValueChange(value)` — value change originating from the view

Call this when the user interacts with the view component; the value flows through `pipe.toModel` → `transformer.toModel`.

```typescript
// call this when the user types in the view
control.viewValueChange('user input');

// marked as dirty
console.log(control.dirty); // true
console.log(control.pristine); // false

// used together with pipe (debounce/filter/map)
// see the pipe section of the FieldFormConfig document
```

---

## State API

### Disable / Enable

| Property/method             | Type             | Description                     |
| ------------------------- | ------------------ | ---------------------------- |
| `control.disabled`        | `boolean` (getter) | Effective disabled state (considers parents) |
| `control.enabled`         | `boolean` (getter) | Equivalent to `!disabled`      |
| `control.selfDisabled$()` | `Signal<boolean>`  | **Own** disabled state, ignoring parents |
| `control.disabled$$()`    | `Signal<boolean>`  | Effective disabled state (own or inherited) |
| `control.enabled$$()`     | `Signal<boolean>`  | Effective enabled state        |
| `control.disable()`       | `() => void`       | Disables this control          |
| `control.enable()`        | `() => void`       | Enables this control           |

```typescript
// inspect the disabled state
if (control.disabled) {
  console.log('currently disabled');
}

// disable dynamically
control.disable();

// precise control through config$
control.config$.update((c) => ({ ...c, disabled: true }));

// disabling a parent propagates to children
parentControl.disable();
console.log(childControl.disabled); // true (disabled by parent)
console.log(childControl.selfDisabled$()); // false (not disabled itself)
```

**Effect of the `disabledValue` strategy:**

- `'reserve'` (default): keeps the current value while disabled
- `'delete'`: removes the field value when disabled

### Touched / Untouched

| Property/method                    | Type             | Description                        |
| ------------------------------ | ------------------ | --------------------------------- |
| `control.touched`              | `boolean` (getter) | Whether it has been touched (read untracked) |
| `control.untouched`            | `boolean` (getter) | Whether it is untouched            |
| `control.touched$$()`          | `Signal<boolean>`  | computed; child touched state bubbles to the parent |
| `control.selfTouched$()`       | `Signal<boolean>`  | Own touched state (signal)         |
| `control.markAsTouched()`      | `() => void`       | Marks as touched                   |
| `control.markAsUntouched()`    | `() => void`       | Marks as untouched                 |
| `control.markAllAsTouched()`   | `() => void`       | Cascades to itself and all children |
| `control.markAllAsUntouched()` | `() => void`       | Clears all touched states cascadingly |

```typescript
// after the user interacts with the field
control.markAsTouched();

// check the touched state of the whole form (including children)
if (groupControl.touched) {
  // if any child is touched, the parent is marked touched too
}
```

### Dirty / Pristine

| Property/method                 | Type             | Description                  |
| ----------------------------- | ------------------ | --------------------------- |
| `control.dirty`               | `boolean` (getter) | Whether the value has changed |
| `control.pristine`            | `boolean` (getter) | Whether the value is untouched |
| `control.dirty$$()`           | `Signal<boolean>`  | computed; child dirty state bubbles up |
| `control.markAsDirty()`       | `() => void`       | Marks as dirty               |
| `control.markAsPristine()`    | `() => void`       | Marks as pristine            |
| `control.markAllAsDirty()`    | `() => void`       | Cascades to all children     |
| `control.markAllAsPristine()` | `() => void`       | Clears all dirty states cascadingly |

```typescript
// viewValueChange marks the control dirty automatically
control.viewValueChange('new value');
console.log(control.dirty); // true
console.log(control.pristine); // false

// reset marks the control pristine + untouched automatically
control.reset();
console.log(control.pristine); // true
```

## Validation API

### State Checks

| Property          | Type             | Description                  |
| ----------------- | ------------------ | -------------------- |
| `control.valid`   | `boolean` (getter) | Whether all validators pass   |
| `control.invalid` | `boolean` (getter) | Whether validation failed     |
| `control.pending` | `boolean` (getter) | Whether async validation is running |

```typescript
if (control.valid) {
  console.log('form is valid');
} else if (control.invalid) {
  console.log('form is invalid');
} else if (control.pending) {
  console.log('validating...');
}
```

### Error Details

| Property                   | Type                                       | Description                             |
| -------------------------- | ------------------------------------------ | ---------------------------------------- |
| `control.errors`           | `ValidationErrors2[] \| undefined`         | Current error list (undefined while pending) |
| `control.status$$()`       | `Signal<VALID_STATUS>`                     | 'VALID' \| 'INVALID' \| 'PENDING'        |
| `control.rawError$$()`     | `Signal<rawError \| PENDING \| undefined>` | Raw errors after merging sync + async (includes pending) |
| `control.syncError$()`     | `linkedSignal`                             | Synchronous validation errors only      |
| `control.asyncError$$()`   | `Signal`                                   | Asynchronous validation errors only     |
| `control.valueNoError$$()` | `computed`                                 | True when there are no errors           |

```typescript
// inspect the current errors
if (control.errors) {
  control.errors.forEach((err) => {
    if (err.kind === 'valibot') {
      console.log('Valibot issues:', err.metadata);
    } else if (err.kind === 'descendant') {
      console.log(`child field ${err.key} error:`, err.metadata);
    } else {
      console.log(`${err.kind}:`, err.message ?? err.metadata);
    }
  });
}

// status$$ returns string constants
const status = control.status$$(); // 'VALID' | 'INVALID' | 'PENDING'
```

**Error type system:**

```typescript
type ValidationErrors2 =
  | ValidationValibotError2 // schema validation failed { kind: 'valibot', metadata: BaseIssue[] }
  | ValidationErrorError2 // a custom validator threw { kind: 'error', metadata: Error }
  | ValidationDescendantError2 // child field error { kind: 'descendant', key: string, field: AbstractControl, metadata: ValidationCommonError2[] }
  | ValidationCommonError2; // returned by a custom validator { kind: string, metadata?, message? }
```

### Configuring Validators

Register validators through `formConfig`:

```typescript
import { formConfig, ValidatorFn, AsyncValidatorFn } from '@piying/view-angular-core';

// synchronous validator
v.pipe(
  v.string(),
  formConfig({
    validators: [
      (control) => {
        if (!control.value?.match(/^[A-Z]/)) {
          return { uppercaseStart: 'Must start with an uppercase letter' };
        }
        return undefined; // return undefined/null when validation passes
      },
    ],
  }),
);

// asynchronous validator (supports Promise / Observable / Signal)
v.pipe(
  v.string(),
  formConfig({
    asyncValidators: [
      async (control) => {
        const exists = await checkUsername(control.value);
        return exists ? { duplicate: 'Username already exists' } : undefined;
      },
    ],
  }),
);
```

---

## Change Observation Observables

### valueChanges

Emits the new value whenever `value$$()` changes (Angular signal → RxJS conversion).

```typescript
import { firstValueFrom, skip } from 'rxjs';

// subscribe style
control.valueChanges.subscribe((val) => {
  console.log('value changed to:', val);
});

// async/await style (handy in tests)
let result = await firstValueFrom(control.valueChanges);
console.log(result); // undefined (initial value)

control.updateValue('111');
result = await firstValueFrom(control.valueChanges.pipe(skip(1)));
console.log(result); // '111'
```

### statusChanges

Emits VALID / INVALID / PENDING whenever the validation state changes.

```typescript
control.statusChanges.subscribe((status) => {
  switch (status) {
    case 'VALID':
      console.log('✅ validation passed');
      break;
    case 'INVALID':
      console.log('❌ validation failed');
      break;
    case 'PENDING':
      console.log('⏳ validating...');
      break;
  }
});
```

---

## Navigation API

| Property            | Type                           | Description                      |
| ------------------- | ------------------------------ | ----------------------------- |
| `control.root`      | `AbstractControl` (getter)     | Root control                     |
| `control.parent`    | `AbstractControl \| undefined` | Parent control                   |
| `control.valuePath` | `(string \| number)[]`         | Value path (skips Logic children) |
| `control.fieldPath` | `(string \| number)[]`         | Full field path (all children)    |

```typescript
// get the root control
const rootCtrl = control.root;

// navigate up to the parent
if (control.parent) {
  console.log(control.parent.value);
}

// path tracking
console.log(control.fieldPath); // ['users', 0, 'address', 'city']
```

### FieldArray-Specific API

| Property/method                    | Type                        | Description                   |
| ------------------------------ | --------------------------- | --------------------------- |
| `array.length`                 | `number`                    | Current array length          |
| `array.controls`               | `AbstractControl[]`         | All child controls (fixed + reset) |
| `array.fixedControls$()`       | `Signal<AbstractControl[]>` | Fixed child controls          |
| `array.resetControls$()`       | `Signal<AbstractControl[]>` | Controls pending reset/creation |
| `array.clear()`                | `() => void`                | Clears all reset-state controls |
| `array.removeRestControl(key)` | `(key: number) => void`     | Removes the given rest control |

```typescript
// array operations
result.form.control!.updateValue(['v1', 'v2']);
const arrayCtrl = result.form.control!;
console.log(arrayCtrl.length); // 2
console.log(arrayCtrl.controls.length); // 2

// clear everything
arrayCtrl.clear();
console.log(arrayCtrl.controls); // []

// set / update array items
resolved.action.set('11', 1); // set index 1 to '11'
```

---

## Configuration API

### config$

```typescript
// config$ is a WritableSignal<FieldFormConfig>
// mutate it with update; deepEqual comparison avoids needless recomputation

// enable / disable
control.config$.update((c) => ({ ...c, disabled: true }));

// set the default value
control.config$.update((c) => ({ ...c, defaultValue: 'new default' }));

// add a validator
control.config$.update((c) => ({
  ...c,
  validators: [...(c.validators ?? []), myValidator],
}));

// set the update timing
control.config$.update((c) => ({ ...c, updateOn: 'blur' }));

// reset the configuration to its initial state (note: this is not reset())
```

**Complete `FieldFormConfig` field reference:**

```typescript
interface FieldFormConfig<T = any> {
  disabled?: boolean; // disable this field
  disabledValue?: 'reserve' | 'delete'; // value strategy while disabled
  transformer?: {
    toView?: (value: any, control: AbstractControl) => any; // model → view
    toModel?: (value: any, control: AbstractControl) => any; // view → model
  };
  pipe?: {
    toModel?: UnaryFunction<Observable<any>, Observable<T>>; // RxJS pipe
  };
  defaultValue?: any; // default value
  validators?: ValidatorFn[]; // synchronous validators
  asyncValidators?: AsyncValidatorFn[]; // asynchronous validators
  updateOn?: 'change' | 'blur' | 'submit'; // when updates are applied
  required?: boolean; // whether the field is required
  undefinedable?: boolean; // allow undefined
  nullable?: boolean; // allow null
  emptyValue?: any; // empty value for group/array
  deletionMode?: 'shrink' | 'mark'; // array deletion mode
  groupMode?: 'loose' | 'default' | 'strict' | 'reset'; // group mode
  groupKeySchema?: BaseSchema; // record key schema
  groupValueSchema?: BaseSchema; // group value schema
  disableOrUpdateActivate?: boolean; // LogicGroup automatic switching
}
```

---

## Other APIs

### emitSubmit()

Only fires with `updateOn: 'submit'`; it resolves pending state and marks controls touched.

```typescript
// usually called on form submit
resolved.form.control.emitSubmit();
```

### Child Signals of FieldArray (Field Level)

On `_PiResolvedCommonViewFieldConfig`, array-typed fields expose:

```typescript
// child signals on the Field object
field.fixedChildren; // Signal<Array<_PiResolvedCommonViewFieldConfig>>
field.restChildren; // Signal<Array<_PiResolvedCommonViewFieldConfig>> | undefined
```

---

## Full Examples

### Basic Form Operations

```typescript
import * as v from 'valibot';
import { convertToField } from '@piying/view-angular';
import { formConfig } from '@piying/view-angular-core';
import { firstValueFrom, debounceTime } from 'rxjs';

const schema = v.object({
  name: v.pipe(
    v.string(),
    formConfig({
      defaultValue: '',
      validators: [(c) => (c.value.length < 2 ? { short: 'At least 2 characters' } : undefined)],
    }),
  ),
  email: v.pipe(v.string(), v.email()),
  tags: v.optional(v.array(v.string()), []),
});

const resolved = convertToField(() => schema, undefined, () => ({
  /* options */
}));
const root = resolved.form.control!;

// 1. read the initial value
console.log(root.value); // { name: '', email: undefined, tags: [] }

// 2. update the value
root.updateValue({
  name: 'Test',
  email: 'test@example.com',
});

// 3. watch value changes
root.valueChanges.subscribe((val) => {
  console.log('form value:', val);
});

// 4. inspect state
console.log(root.valid); // true / false
console.log(root.errors); // undefined | ValidationErrors2[]

// 5. get a child control
const nameCtrl = root.get(['name']);
if (nameCtrl) {
  console.log(nameCtrl.value);
  console.log(nameCtrl.invalid);
  console.log(nameCtrl.errors);
}

// 6. a view change marks the dirty state
nameCtrl.viewValueChange('new input');
console.log(nameCtrl.dirty); // true

// 7. reset the form
root.reset();

// 8. disable the whole form
root.disable();
console.log(root.disabled); // true
```

### Array Control Operations

```typescript
import * as v from 'valibot';
import { convertToField } from '@piying/view-angular';
import { formConfig, isFieldArray } from '@piying/view-angular-core';

const schema = v.object({
  items: v.pipe(v.array(v.string()), formConfig({ emptyValue: [] })),
});

const resolved = convertToField(() => schema, undefined, () => ({
  /* options */
}));
const arrayCtrl = resolved.form.control!.get(['items'])!;

if (isFieldArray(arrayCtrl)) {
  // add an item
  resolved.action.set('new item', arrayCtrl.length);

  // update a value
  arrayCtrl.updateValue(['a', 'b', 'c']);
  console.log(arrayCtrl.length); // 3

  // iterate child controls
  for (const [i, child] of arrayCtrl.activatedChildren()) {
    console.log(`[${i}]`, child.value);
  }

  // clear the array
  arrayCtrl.updateValue([]);
}
```

### Value Transformers

```typescript
import * as v from 'valibot';
import { convertToField } from '@piying/view-angular';
import { formConfig } from '@piying/view-angular-core';

const schema = v.pipe(
  v.number(),
  formConfig({
    transformer: {
      toView: (value) => value?.toFixed(2) ?? '0.00', // 19.9 → "19.90"
      toModel: (value) => parseFloat(value), // "19.90" → 19.9
    },
  }),
);

const resolved = convertToField(() => schema, undefined, () => ({
  /* options */
}));
const ctrl = resolved.form.control!;

// modelValue$ holds the raw value
ctrl.updateValue(19.9);

// value$$ is the view value after toView conversion
console.log(ctrl.value); // "19.90" (a string)

// simulate a view change
ctrl.viewValueChange('25.5');
console.log(ctrl.value); // 25.5 (a number)
```

---

## Caveats

1. **Signal vs getter**: names ending in `$$` such as `value$$()` and `disabled$$()` are signals/computeds and must be called with `()`; `value` and `disabled` are getters accessed directly.

2. **Deep equal comparison**: the `config$` signal uses deepEqual from `fast-equals` to avoid repeated updates with the same value.

3. **State bubbling**: touched and dirty states bubble from children to parents (implemented with computed signals).

4. **Disabled propagation**: disabling a parent automatically disables every child, but `selfDisabled$$()` only reflects the control's own configuration.

5. **`updateOn: 'submit'`**: in submit mode, value changes are only processed when `emitSubmit()` is called.

---

## Related Documents

- [formConfig](en/api/form-config/) — detailed form configuration
- [Path Querying](en/api/path-querying/) — quick reference for keyPath and get()
- [Custom Validation](en/scenarios/custom-validation/) — validators / asyncValidators scenarios
- [Value Transformation and Linkage](en/scenarios/value-transform/) — guide to transformers

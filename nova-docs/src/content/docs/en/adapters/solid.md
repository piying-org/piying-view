---
title: "Solid Package API Reference (@piying/view-solid)"
---

This page documents the public API of the Solid package `@piying/view-solid`.

## Token

```tsx
import { PI_VIEW_FIELD_TOKEN, InjectorToken, CVA } from '@piying/view-solid';
```

| Token                 | Description                                                   |
| --------------------- | ------------------------------------------------------------- |
| `PI_VIEW_FIELD_TOKEN` | Current field configuration (Solid Context)                    |
| `InjectorToken`       | Static injector (Context)                                      |
| `CVA`                 | `Symbol.for('ControlValueAccessor')`, marks the CVA prop exposed by a component |

### Getting the Field

```tsx
import { useContext } from 'solid-js';
import { PI_VIEW_FIELD_TOKEN } from '@piying/view-solid';

const field = useContext(PI_VIEW_FIELD_TOKEN);
```

## Components

### PiyingView

Form root component:

```tsx
import { PiyingView } from '@piying/view-solid';

<PiyingView
  schema={schema}
  model={model}
  options={options}
  onModelChange={(v) => setModel(v)}
/>;
```

### PiyingFieldTemplate

Renders a field template:

```tsx
import { PiyingFieldTemplate } from '@piying/view-solid';
```

### Field

Field control binding component (binds a field as a form control):

```tsx
import { Field } from '@piying/view-solid';
```

### PiyingGroup

Field group container used to render container types such as `object` / `array` / `record`:

```tsx
import { PiyingGroup } from '@piying/view-solid';

options = {
  fieldGlobalConfig: {
    types: {
      object: { type: PiyingGroup },
      array: { type: PiyingGroup },
    },
  },
};
```

### PiyingWrapper

The Wrapper component (wrapper container).

## Utilities

### useControlValueAccessor — CVA adapter

Returns `cva` (ControlValueAccessor) and `cvaa` (the adapter):

```tsx
import { CVA, useControlValueAccessor } from '@piying/view-solid';
import { createMemo } from 'solid-js';

export function InputText(props: PiInputOptions) {
  const { cva, cvaa } = useControlValueAccessor();
  createMemo(() => props[CVA](cva));
  // render the control with cvaa
}
```

`cvaa` provides (note that in Solid the value/disabled accessors are `Accessor` functions, call `()` to read them):

| Member            | Type                 | Description                |
| ----------------- | -------------------- | ---------------- |
| `value`           | `Accessor<any>`      | Current value (accessor)    |
| `disabled`        | `Accessor<boolean>`  | Disabled state (accessor)   |
| `valueChange(v)`  | `(v) => void`        | Updates the value and emits change |
| `touchedChange()` | `() => void`         | Marks the control as touched |

### createSignalConvert — signal conversion

Converts a signal into a Solid accessor:

```tsx
import { createSignalConvert } from '@piying/view-solid';

const inputs = createSignalConvert(() => field.inputs());
```

### useEffectSync — effect synchronization

Takes only `fn`, based on `createMemo` + `createEffect`:

```tsx
import { useEffectSync } from '@piying/view-solid';

useEffectSync(() => {
  // effect initialization
  return () => {
    /* cleanup */
  };
});
```

### convertToField — schema conversion

```tsx
import { convertToField } from '@piying/view-solid';

const field = convertToField(() => schema, envInjector, () => options);
```

## use-*Model Binding Hooks

Bind native controls to `cvaa` in two directions. See [Field Model Binding](en/adapters/field-model-binding-solid/):

| Hook                    | Target control        |
| ----------------------- | ------------------- |
| `useInputTextModel`     | Text input            |
| `useInputCheckboxModel` | Checkbox              |
| `useInputNumberModel`   | Number input          |
| `useInputRadioModel`    | Radio button          |
| `useInputRangeModel`    | Range slider          |
| `useSelectModel`        | Select (single/multiple) |

## Classes and Conversion

### SolidSchemaHandle / SolidFormBuilder

```typescript
import { SolidSchemaHandle, SolidFormBuilder } from '@piying/view-solid';

// SolidSchemaHandle — Solid schema handle (extends CoreSchemaHandle)
// SolidFormBuilder — Solid FormBuilder (extends FormBuilder<SolidSchemaHandle>)
```

### PiResolvedViewFieldConfig

The Solid field configuration type:

```typescript
import { PiResolvedViewFieldConfig } from '@piying/view-solid';
```

## Full Exports

`PiyingView`, `PiyingFieldTemplate`, `Field`, `PiyingGroup`, `PiyingWrapper`, `PI_VIEW_FIELD_TOKEN`, `InjectorToken`, `CVA`, `useControlValueAccessor`, `createSignalConvert`, `useEffectSync`, the `use-*Model` family, `convertToField`, `SolidSchemaHandle`, `SolidFormBuilder`, `PiResolvedViewFieldConfig`.

## Next Steps

- [Field Model Binding](en/adapters/field-model-binding-solid/) — details on use-*Model hooks
- [Framework Differences](en/getting-started/framework-differences/) — CVA / Signal comparison across frameworks
- [Basic Field Definition](en/scenarios/basic-field/) — setComponent / formConfig

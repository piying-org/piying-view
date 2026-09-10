---
title: "React Package API Reference (@piying/view-react)"
---

This page documents the public API of the React package `@piying/view-react`.

## Token

```tsx
import { PI_VIEW_FIELD_TOKEN, InjectorToken, CVA } from '@piying/view-react';
```

| Token                 | Description                                                   |
| --------------------- | ------------------------------------------------------------- |
| `PI_VIEW_FIELD_TOKEN` | Current field configuration (React Context)                    |
| `InjectorToken`       | Static injector (Context)                                      |
| `CVA`                 | `Symbol.for('ControlValueAccessor')`, marks the CVA prop exposed by a component |

### Getting the Field

```tsx
import { useContext } from 'react';
import { PI_VIEW_FIELD_TOKEN } from '@piying/view-react';

const field = useContext(PI_VIEW_FIELD_TOKEN);
```

## Components

### PiyingView

Form root component:

```tsx
import { PiyingView } from '@piying/view-react';

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
import { PiyingFieldTemplate } from '@piying/view-react';
```

### Field

Field control binding component (binds a field as a form control):

```tsx
import { Field } from '@piying/view-react';
```

### PiyingGroup

Field group container used to render container types such as `object` / `array` / `record`:

```tsx
import { PiyingGroup } from '@piying/view-react';

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
import { CVA, useControlValueAccessor } from '@piying/view-react';
import { useImperativeHandle } from 'react';

interface PiInputOptions {
  [CVA]: React.RefObject<ControlValueAccessor>;
}

export function InputText(props: PiInputOptions) {
  const { cva, cvaa } = useControlValueAccessor();
  useImperativeHandle(props[CVA], () => cva, [cva]);
  // render the control with cvaa
}
```

`cvaa` provides:

| Member            | Type           | Description                    |
| ----------------- | -------------- | ---------------- |
| `value`           | `any`          | Current value                  |
| `disabled`        | `boolean`      | Disabled state                 |
| `valueChange(v)`  | `(v) => void`  | Updates the value and emits change |
| `touchedChange()` | `() => void`   | Marks the control as touched    |

### useSignalToRef — signal conversion

Converts a signal into a ref:

```tsx
import { useSignalToRef } from '@piying/view-react';

const inputs = useSignalToRef(props.field, (field) => field.inputs());
```

### useEffectSync — effect synchronization

Takes `(fn, deps)` and implements effect initialization and cleanup on top of `useEffect`:

```tsx
import { useEffectSync } from '@piying/view-react';

useEffectSync(
  () => {
    // effect initialization
    return () => {
      /* cleanup */
    };
  },
  [deps],
);
```

### convertToField — schema conversion

```tsx
import { convertToField } from '@piying/view-react';

const field = convertToField(() => schema, envInjector, () => options);
```

## use-*Model Binding Hooks

Bind native controls to `cvaa` in two directions. See [Field Model Binding](en/adapters/field-model-binding-react/):

| Hook                    | Target control        |
| ----------------------- | ------------------- |
| `useInputTextModel`     | Text input            |
| `useInputCheckboxModel` | Checkbox              |
| `useInputNumberModel`   | Number input          |
| `useInputRadioModel`    | Radio button          |
| `useInputRangeModel`    | Range slider          |
| `useSelectModel`        | Select (single/multiple) |

## Classes and Conversion

### ReactSchemaHandle / ReactFormBuilder

```typescript
import { ReactSchemaHandle, ReactFormBuilder } from '@piying/view-react';

// ReactSchemaHandle — React schema handle (extends CoreSchemaHandle)
// ReactFormBuilder — React FormBuilder (extends FormBuilder<ReactSchemaHandle>)
```

### PiResolvedViewFieldConfig

The React field configuration type:

```typescript
import { PiResolvedViewFieldConfig } from '@piying/view-react';
```

## Full Exports

`PiyingView`, `PiyingFieldTemplate`, `Field`, `PiyingGroup`, `PiyingWrapper`, `PI_VIEW_FIELD_TOKEN`, `InjectorToken`, `CVA`, `useControlValueAccessor`, `useSignalToRef`, `useEffectSync`, the `use-*Model` family, `convertToField`, `ReactSchemaHandle`, `ReactFormBuilder`, `PiResolvedViewFieldConfig`.

## Next Steps

- [Field Model Binding](en/adapters/field-model-binding-react/) — details on use-*Model hooks
- [Framework Differences](en/getting-started/framework-differences/) — CVA / Signal comparison across frameworks
- [Basic Field Definition](en/scenarios/basic-field/) — setComponent / formConfig

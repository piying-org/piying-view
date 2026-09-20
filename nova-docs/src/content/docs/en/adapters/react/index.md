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
  modelChange={(v) => setModel(v)}
/>;
```

### PiyingFieldTemplate

> 🧭 **Manual mode**: belongs to mode two of [Two Usage Modes](en/getting-started/two-modes/). Only the **render position** is manual; the field still renders fully automatically inside.

Renders the whole "wrapper chain + component + recursive children" tree at the chosen position:

```tsx
import { PiyingFieldTemplate } from '@piying/view-react';

<PiyingFieldTemplate field={field} path={['k2']} />;
```

| Props | Type | Description |
| --- | --- | --- |
| `field` | `PiResolvedViewFieldConfig` (required) | The field config to render |
| `path` | `KeyPath` (optional) | Locate a child field; omit it to render the whole root field |

> Full rendering pipeline, lazy loading and pitfalls: [PiyingFieldTemplate (Rendering)](en/adapters/field-template/).

### PiyingField

> 🧭 **Manual mode**: like `PiyingFieldTemplate`, this belongs to mode two (manual binding).

Control binding component: connects the field's `FieldControl` to **a control you wrote yourself**, exposing `cvaa` / `field` through a `children` render function:

```tsx
import { PiyingField } from '@piying/view-react';

<PiyingField field={field} path={['text1']}>
  {({ cvaa }) => (
    <input
      value={cvaa.value ?? ''}
      disabled={cvaa.disabled}
      onChange={(e) => cvaa.valueChange(e.target.value)}
      onBlur={cvaa.touchedChange}
    />
  )}
</PiyingField>;
```

| Props | Type | Description |
| --- | --- | --- |
| `field` | `PiResolvedViewFieldConfig` (required) | Field config |
| `path` | `KeyPath` (optional) | Locate a **leaf** child field and bind that |
| `children` | `({ cvaa, field }) => ReactNode` | Render scope; types follow the `path` |

> Full details (`cvaa` members, error codes, comparison with `PiyingFieldTemplate`): [PiyingField (Binding)](en/adapters/field/).

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

// The second argument is an optional parent Injector; the third is options as a getter function
const field = convertToField(() => schema, injector /* optional */, () => options);
```

## use-*Model Binding Hooks

Bind native controls to `cvaa` in two directions. See [Field Model Binding](en/adapters/react/field-model-binding/):

| Hook                    | Target control        |
| ----------------------- | ------------------- |
| `useInputTextModel`     | Text input            |
| `useInputCheckboxModel` | Checkbox              |
| `useInputNumberModel`   | Number input          |
| `useInputRadioModel`    | Radio button          |
| `useInputRangeModel`    | Range slider          |
| `useSelectModel`        | Select (single/multiple) |

### typedFieldComponentPipe — path + component strong typing

Write config by "path + component": `inputs` takes non-function props, `outputs` takes function props (**names kept verbatim** — `onChange` stays `onChange`). Details: [typedFieldComponentPipe (React)](en/adapters/react/typed-field-component-pipe/).

```tsx
import { typedFieldComponentPipe } from '@piying/view-react';

const merged = typedFieldComponentPipe(schema, define, (d) => [
  d(['price'], 'amount', [d.inputs.patch({ placeholder: 'Enter amount' })]),
  d(['tags'], 'tags', [d.outputs.merge({ onChange: (value) => {} })]),
]);
```

> The React version has **no `d.models`**; lazy components must be wrapped with `React.lazy()`; the class attribute is `className`.

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

`PiyingView`, `PiyingFieldTemplate`, `PiyingField`, `PiyingGroup`, `PiyingWrapper`, `PI_VIEW_FIELD_TOKEN`, `InjectorToken`, `CVA`, `useControlValueAccessor`, `useSignalToRef`, `useEffectSync`, the `use-*Model` family, `typedFieldComponentPipe`, `convertToField`, `ReactSchemaHandle`, `ReactFormBuilder`, `PiResolvedViewFieldConfig`.

## Next Steps

- [Field Model Binding](en/adapters/react/field-model-binding/) — details on use-*Model hooks
- [typedFieldComponentPipe (React)](en/adapters/react/typed-field-component-pipe/) — path + component strong typing
- [Framework Differences](en/getting-started/framework-differences/) — CVA / Signal comparison across frameworks
- [Basic Field Definition](en/scenarios/basic-field/) — setComponent / formConfig

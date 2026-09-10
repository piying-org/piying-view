---
title: "Field Component Model Binding (React)"
---

The `@piying/view-react` package provides a family of `use-*Model` hooks that bind native form controls to Piying-View's `ControlValueAccessorAdapter` (CVAA). Each hook returns a props object that can be spread directly onto the native control, removing the boilerplate of hand-written value/event bindings.

> The React version of `use-*Model` returns a plain object, so spreading it with `{...model}` is all you need. The Solid version has a different signature (it returns a `createMemo` computed signal) — see the [Solid version](en/adapters/field-model-binding-solid/).

## Prerequisite: Getting the CVAA

Every `use-*Model` hook takes a `cvaa` (ControlValueAccessorAdapter) as its first argument. Get it via `useControlValueAccessor()`:

```tsx
import { CVA, useControlValueAccessor } from '@piying/view-react';

interface PiInputOptions {
  [CVA]: React.RefObject<ControlValueAccessor>;
}

export function InputText(props: PiInputOptions) {
  const { cva, cvaa } = useControlValueAccessor();
  useImperativeHandle(props[CVA], () => cva, [cva]);
  // pass cvaa to the use-*Model hooks
}
```

## Text Input — useInputTextModel

```tsx
import { useInputTextModel } from '@piying/view-react';

const textModel = useInputTextModel(cvaa, false);
return <input type="text" {...textModel} />;
```

`useInputTextModel(cvaa, compositionMode)` takes two arguments:

| Argument          | Type      | Description                                                |
| ----------------- | --------- | ---------------------------------------------------------- |
| `cvaa`            | CVAA      | The control value accessor adapter                         |
| `compositionMode` | `boolean` | Whether IME composition mode is enabled (Chinese/Japanese input) |

Returned props: `value`, `disabled`, `onBlur`, `onInput` (plus `onCompositionStart` / `onCompositionEnd` in composition mode).

```tsx
// Enable composition mode (recommended for CJK input)
const textModel = useInputTextModel(cvaa, true);
```

## Checkbox — useInputCheckboxModel

```tsx
import { useInputCheckboxModel } from '@piying/view-react';

const checkboxModel = useInputCheckboxModel(cvaa);
return <input type="checkbox" {...checkboxModel} />;
```

Returned props: `checked`, `disabled`, `onBlur`, `onChange`.

## Number Input — useInputNumberModel

```tsx
import { useInputNumberModel } from '@piying/view-react';

const numberModel = useInputNumberModel(cvaa);
return <input type="number" {...numberModel} />;
```

Returned props: `value`, `disabled`, `onBlur`, `onInput`. Empty values become `undefined`; otherwise the value is converted with `parseFloat`.

## Radio Button — useInputRadioModel

```tsx
import { useInputRadioModel } from '@piying/view-react';

// call it once per option, passing that option's value
<input type="radio" name="r1" {...useInputRadioModel(cvaa, 'v1')} />
<input type="radio" name="r1" {...useInputRadioModel(cvaa, 'v2')} />
```

`useInputRadioModel(cvaa, value)` takes a second argument `value`, the value of the current option. Returned props: `value`, `checked` (computed from the current value), `disabled`, `onBlur`, `onChange`.

## Range Slider — useInputRangeModel

```tsx
import { useInputRangeModel } from '@piying/view-react';

const rangeModel = useInputRangeModel(cvaa);
return <input type="range" {...rangeModel} />;
```

Returned props: `value`, `disabled`, `onBlur`, `onInput`, `onChange`. Empty values become `undefined`; otherwise the value is converted with `parseFloat`.

## Select — useSelectModel

```tsx
import { useSelectModel } from '@piying/view-react';

// single selection
const selectModel = useSelectModel(cvaa, false);

// multiple selection
const multiSelectModel = useSelectModel(cvaa, true);
```

`useSelectModel(cvaa, multiple)` uses the second argument `multiple` to switch between single and multi selection:

| Argument   | Type      | Description                         |
| ---------- | --------- | -------------------------- |
| `multiple` | `boolean` | `false` for single, `true` for multiple |

In single mode `onChange` writes `selected[0]`; in multiple mode it writes the whole selected array.

## Full Example: Text Input

```tsx
import { CVA, useControlValueAccessor, useInputTextModel } from '@piying/view-react';
import { useImperativeHandle } from 'react';
import type { ControlValueAccessor } from '@piying/view-core';

interface PiInputOptions {
  [CVA]: React.RefObject<ControlValueAccessor>;
}

export function InputText(props: PiInputOptions) {
  const { cva, cvaa } = useControlValueAccessor();
  useImperativeHandle(props[CVA], () => cva, [cva]);
  const textModel = useInputTextModel(cvaa, true);
  return <input type="text" {...textModel} />;
}
```

## Hook Summary

| Hook                     | Target control         | Key returned props                  | Extra argument  |
| ------------------------ | ------------------- | ----------------------------------- | --------------- |
| `useInputTextModel`      | `<input type=text>` | `value` / `onInput` / `onBlur`      | `compositionMode` |
| `useInputCheckboxModel`  | `<input type=checkbox>` | `checked` / `onChange`          | —               |
| `useInputNumberModel`    | `<input type=number>` | `value` / `onInput`              | —               |
| `useInputRadioModel`     | `<input type=radio>`   | `value` / `checked` / `onChange`    | option `value`  |
| `useInputRangeModel`     | `<input type=range>` | `value` / `onInput` / `onChange` | —               |
| `useSelectModel`         | `<select>`          | `value` / `onChange`                | `multiple`      |

## Next Steps

- [React API](en/adapters/react/) — complete `@piying/view-react` API
- [Solid version](en/adapters/field-model-binding-solid/) — signature differences of Solid's `use-*Model`
- [Framework Differences](en/getting-started/framework-differences/) — CVA binding and signal conversion helpers per framework
- [Basic Field Definition](en/scenarios/basic-field/) — using setComponent / formConfig

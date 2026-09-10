---
title: "Field Component Model Binding (Solid)"
---

The Solid package `@piying/view-solid` provides a family of `use-*Model` hooks that bind native form controls to Piying-View's `ControlValueAccessorAdapter` (CVAA). Each hook returns a `createMemo` computed signal, so you must call `()` to unwrap the props.

> **Differences from React:** every Solid `use-*Model` returns a `createMemo` result and must be called with `()`; and `compositionMode` is a function `() => boolean`. The React version returns a plain object and takes a boolean `compositionMode` — see the [React version](en/adapters/field-model-binding-react/).

## Prerequisite: Getting the CVAA

Every `use-*Model` hook takes a `cvaa` (ControlValueAccessorAdapter) as its first argument. Get it via `useControlValueAccessor()`:

```tsx
import { CVA, useControlValueAccessor } from '@piying/view-solid';

export function InputText(props: PiInputOptions) {
  const { cvaa } = useControlValueAccessor();
  // pass cvaa to the use-*Model hooks
}
```

## Text Input — useInputTextModel

```tsx
import { useInputTextModel } from '@piying/view-solid';

const textModel = useInputTextModel(cvaa, () => false);
return <input type="text" {...textModel()} />;
```

`useInputTextModel(cvaa, compositionMode)` takes two arguments:

| Argument          | Type              | Description                                                |
| ----------------- | ----------------- | ---------------------------------------------------------- |
| `cvaa`            | CVAA              | The control value accessor adapter                         |
| `compositionMode` | `() => boolean`   | Whether IME composition mode is enabled (function form)     |

Returns a `createMemo` signal; call `()` to get the props: `value`, `disabled`, `onBlur`, `onInput` (plus `onCompositionStart` / `onCompositionEnd` in composition mode).

```tsx
// Enable composition mode (recommended for CJK input)
const textModel = useInputTextModel(cvaa, () => true);
```

## Checkbox — useInputCheckboxModel

```tsx
import { useInputCheckboxModel } from '@piying/view-solid';

const checkboxModel = useInputCheckboxModel(cvaa);
return <input type="checkbox" {...checkboxModel()} />;
```

Returned props: `checked`, `disabled`, `onBlur`, `onChange`.

## Number Input — useInputNumberModel

```tsx
import { useInputNumberModel } from '@piying/view-solid';

const numberModel = useInputNumberModel(cvaa);
return <input type="number" {...numberModel()} />;
```

Returned props: `value`, `disabled`, `onBlur`, `onInput`. Empty values become `undefined`; otherwise the value is converted with `parseFloat`.

## Radio Button — useInputRadioModel

```tsx
import { useInputRadioModel } from '@piying/view-solid';

// call it once per option, passing that option's value
<input type="radio" name="r1" {...useInputRadioModel(cvaa, 'v1')()} />
<input type="radio" name="r1" {...useInputRadioModel(cvaa, 'v2')()} />
```

`useInputRadioModel(cvaa, value)` takes a second argument `value`, the value of the current option. Returned props: `value`, `checked` (computed from the current value), `disabled`, `onBlur`, `onChange`.

## Range Slider — useInputRangeModel

```tsx
import { useInputRangeModel } from '@piying/view-solid';

const rangeModel = useInputRangeModel(cvaa);
return <input type="range" {...rangeModel()} />;
```

Returned props: `value`, `disabled`, `onBlur`, `onInput`, `onChange`. Empty values become `undefined`; otherwise the value is converted with `parseFloat`.

## Select — useSelectModel

```tsx
import { useSelectModel } from '@piying/view-solid';

// single selection
const selectModel = useSelectModel(cvaa, false);

// multiple selection
const multiSelectModel = useSelectModel(cvaa, true);
```

`useSelectModel(cvaa, multiple)` uses the second argument `multiple` to switch between single and multi selection:

| Argument   | Type      | Description                          |
| ---------- | --------- | -------------------------- |
| `multiple` | `boolean` | `false` for single, `true` for multiple |

In single mode `onChange` writes `selected[0]`; in multiple mode it writes the whole selected array.

## Full Example: Text Input

```tsx
import { CVA, useControlValueAccessor, useInputTextModel } from '@piying/view-solid';
import type { ControlValueAccessor } from '@piying/view-core';

export function InputText(props: PiInputOptions) {
  const { cva, cvaa } = useControlValueAccessor();
  createMemo(() => props[CVA](cva));
  const textModel = useInputTextModel(cvaa, () => true);
  return <input type="text" {...textModel()} />;
}
```

## Hook Summary

| Hook                     | Target control       | Key returned props                    | Extra argument  |
| ------------------------ | ------------------- | ----------------------------------- | --------------- |
| `useInputTextModel`      | `<input type=text>` | `value` / `onInput` / `onBlur`      | `compositionMode` |
| `useInputCheckboxModel`  | `<input type=checkbox>` | `checked` / `onChange`          | —               |
| `useInputNumberModel`    | `<input type=number>` | `value` / `onInput`              | —               |
| `useInputRadioModel`     | `<input type=radio>` | `value` / `checked` / `onChange`      | option `value`  |
| `useInputRangeModel`     | `<input type=range>` | `value` / `onInput` / `onChange` | —               |
| `useSelectModel`         | `<select>`          | `value` / `onChange`                | `multiple`      |

> Every Solid hook returns a `createMemo`; call `()` to get the props object.

## Next Steps

- [Solid API](en/adapters/solid/) — complete `@piying/view-solid` API
- [React version](en/adapters/field-model-binding-react/) — React's `use-*Model` signatures
- [Framework Differences](en/getting-started/framework-differences/) — CVA binding and signal conversion helpers per framework
- [Basic Field Definition](en/scenarios/basic-field/) — using setComponent / formConfig

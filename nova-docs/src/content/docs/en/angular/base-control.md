---
title: "BaseControl — Form Control Base Class"
---

A base class implementing `ControlValueAccessor`, used to write field control components (see [Quick Start](en/getting-started/quick-start/)):

```typescript
import { BaseControl } from '@piying/view-angular';

@Component({
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => InputComponent),
    multi: true,
  }],
})
export class InputComponent extends BaseControl {}
```

Provided members (all from `control.base.component.ts`):

| Member                     | Type                       | Description                     |
| ------------------------ | --------------------------- | ----------------------------- |
| `defaultValue`           | `any` (defaults to `undefined`) | Default value              |
| `value$`                 | `Signal<T>`                 | Signal holding the current value |
| `emitValue?`             | `protected (value) => void` | Internal emit callback (assigned by registerOnChange) |
| `valueChange(value, setValue?)` | `(value, boolean) => void` | Emits the change + optionally updates value$ (default true) |
| `touchedChange()`        | `() => void`                | Invokes the touched callback  |
| `valueAndTouchedChange(value, setValue?)` | `(value, boolean) => void` | Updates the value + marks touched |
| `disabled$`              | `Signal<boolean>`           | Signal holding the disabled state |
| `writeValue` / `registerOnChange` / `registerOnTouched` / `setDisabledState` | CVA interface | Called by Angular forms |

Notes:

- `valueChange(value, setValue = true)`: calls `emitValue?.(value)` to emit the change; when `setValue` is `true` it also updates `value$.set(value)`.
- `writeValue(obj)`: `value$.set(obj ?? undefined)`.
- `setDisabledState(isDisabled)`: `disabled$.set(isDisabled)`.

## Related Documents

- [Quick Start](en/getting-started/quick-start/) — full example of writing a control with BaseControl
- [Angular API Reference](en/angular/api/) — index of all public APIs

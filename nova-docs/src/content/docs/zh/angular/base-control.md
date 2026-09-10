---
title: "BaseControl — 表单控件基类"
---

实现 `ControlValueAccessor` 的基类，用于编写字段控件组件（见 [快速上手](zh/getting-started/quick-start/)）：

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

提供的成员（均来自 `control.base.component.ts`）：

| 成员                     | 类型                        | 说明                          |
| ------------------------ | --------------------------- | ----------------------------- |
| `defaultValue`           | `any`（默认 `undefined`）   | 默认值                        |
| `value$`                 | `Signal<T>`                 | 当前值信号                    |
| `emitValue?`             | `protected (value) => void` | 内部发射回调（registerOnChange 赋值） |
| `valueChange(value, setValue?)` | `(value, boolean) => void` | 发射变更 + 可选更新 value$（默认 true） |
| `touchedChange()`        | `() => void`                | 触发 touched 回调             |
| `valueAndTouchedChange(value, setValue?)` | `(value, boolean) => void` | 更新值 + 触发 touched         |
| `disabled$`              | `Signal<boolean>`           | 禁用状态信号                  |
| `writeValue` / `registerOnChange` / `registerOnTouched` / `setDisabledState` | CVA 接口 | 由 Angular 表单调用 |

说明：

- `valueChange(value, setValue = true)`：调用 `emitValue?.(value)` 发射变更，`setValue` 为 `true` 时同步更新 `value$.set(value)`。
- `writeValue(obj)`：`value$.set(obj ?? undefined)`。
- `setDisabledState(isDisabled)`：`disabled$.set(isDisabled)`。

## 相关文档

- [快速上手](zh/getting-started/quick-start/) — 使用 BaseControl 编写控件的完整示例
- [Angular API 参考](zh/angular/api/) — 全部公开 API 索引

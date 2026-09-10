---
title: "字段组件模型绑定（Solid）"
---

Solid 包 `@piying/view-solid` 提供了 `use-*Model` 系列 Hook，用于将原生表单控件与 Piying-View 的 `ControlValueAccessorAdapter`（CVAA）绑定。这些 Hook 返回 `createMemo` 计算信号，使用时需调用 `()` 展开。

> **与 React 的差异：** Solid 版本的 `use-*Model` 均返回 `createMemo` 结果，需调用 `()`；且 `compositionMode` 参数为函数 `() => boolean`。React 版本返回普通对象、`compositionMode` 为布尔值，详见 [React 版本](zh/adapters/field-model-binding-react/)。

## 前置：获取 CVAA

所有 `use-*Model` Hook 都接收一个 `cvaa`（ControlValueAccessorAdapter）作为第一个参数。通过 `useControlValueAccessor()` 获取：

```tsx
import { CVA, useControlValueAccessor } from '@piying/view-solid';

export function InputText(props: PiInputOptions) {
  const { cvaa } = useControlValueAccessor();
  // cvaa 传给 use-*Model Hook
}
```

## 文本输入 — useInputTextModel

```tsx
import { useInputTextModel } from '@piying/view-solid';

const textModel = useInputTextModel(cvaa, () => false);
return <input type="text" {...textModel()} />;
```

`useInputTextModel(cvaa, compositionMode)` 接收两个参数：

| 参数              | 类型              | 说明                                                       |
| ----------------- | ----------------- | ---------------------------------------------------------- |
| `cvaa`            | CVAA              | 控件值访问适配器                                           |
| `compositionMode` | `() => boolean`   | 是否启用输入法组合模式（函数形式）                         |

返回 `createMemo` 信号，调用 `()` 得到属性：`value`、`disabled`、`onBlur`、`onInput`（组合模式下额外提供 `onCompositionStart` / `onCompositionEnd`）。

```tsx
// 启用组合模式（推荐用于中文输入场景）
const textModel = useInputTextModel(cvaa, () => true);
```

## 复选框 — useInputCheckboxModel

```tsx
import { useInputCheckboxModel } from '@piying/view-solid';

const checkboxModel = useInputCheckboxModel(cvaa);
return <input type="checkbox" {...checkboxModel()} />;
```

返回属性：`checked`、`disabled`、`onBlur`、`onChange`。

## 数字输入 — useInputNumberModel

```tsx
import { useInputNumberModel } from '@piying/view-solid';

const numberModel = useInputNumberModel(cvaa);
return <input type="number" {...numberModel()} />;
```

返回属性：`value`、`disabled`、`onBlur`、`onInput`。空值时转换为 `undefined`，非空时 `parseFloat` 转数字。

## 单选按钮 — useInputRadioModel

```tsx
import { useInputRadioModel } from '@piying/view-solid';

// 每个选项调用一次，传入对应的 value
<input type="radio" name="r1" {...useInputRadioModel(cvaa, 'v1')()} />
<input type="radio" name="r1" {...useInputRadioModel(cvaa, 'v2')()} />
```

`useInputRadioModel(cvaa, value)` 接收第二个参数 `value`，表示当前选项的值。返回属性：`value`、`checked`（根据当前值自动判断）、`disabled`、`onBlur`、`onChange`。

## 范围滑块 — useInputRangeModel

```tsx
import { useInputRangeModel } from '@piying/view-solid';

const rangeModel = useInputRangeModel(cvaa);
return <input type="range" {...rangeModel()} />;
```

返回属性：`value`、`disabled`、`onBlur`、`onInput`、`onChange`。空值时转换为 `undefined`，非空时 `parseFloat` 转数字。

## 下拉选择 — useSelectModel

```tsx
import { useSelectModel } from '@piying/view-solid';

// 单选
const selectModel = useSelectModel(cvaa, false);

// 多选（multiple）
const multiSelectModel = useSelectModel(cvaa, true);
```

`useSelectModel(cvaa, multiple)` 接收第二个参数 `multiple` 控制单选/多选：

| 参数       | 类型      | 说明                       |
| ---------- | --------- | -------------------------- |
| `multiple` | `boolean` | `false` 单选，`true` 多选  |

单选时 `onChange` 写入 `selected[0]`，多选时写入整个选中数组。

## 完整示例：文本输入

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

## Hook 汇总

| Hook                     | 目标控件            | 关键返回属性                        | 额外参数        |
| ------------------------ | ------------------- | ----------------------------------- | --------------- |
| `useInputTextModel`      | `<input type=text>` | `value` / `onInput` / `onBlur`      | `compositionMode` |
| `useInputCheckboxModel`  | `<input type=checkbox>` | `checked` / `onChange`          | —               |
| `useInputNumberModel`    | `<input type=number>` | `value` / `onInput`              | —               |
| `useInputRadioModel`     | `<input type=radio>` | `value` / `checked` / `onChange` | 选项 `value`    |
| `useInputRangeModel`     | `<input type=range>` | `value` / `onInput` / `onChange` | —               |
| `useSelectModel`         | `<select>`          | `value` / `onChange`                | `multiple`      |

> 所有 Solid 版本的 Hook 返回 `createMemo`，需调用 `()` 获取属性对象。

## 下一步

- [Solid API](zh/adapters/solid/) — `@piying/view-solid` 完整 API
- [React 版本](zh/adapters/field-model-binding-react/) — React 的 `use-*Model` 签名
- [框架差异](zh/getting-started/framework-differences/) — 各框架的 CVA 绑定与 Signal 转换工具对比
- [基础字段定义](zh/scenarios/basic-field/) — setComponent / formConfig 用法

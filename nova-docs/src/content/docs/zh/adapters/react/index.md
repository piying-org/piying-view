---
title: "React 包 API 参考（@piying/view-react）"
---

本文介绍 React 包 `@piying/view-react` 的公开 API。

## Token

```tsx
import { PI_VIEW_FIELD_TOKEN, InjectorToken, CVA } from '@piying/view-react';
```

| Token                 | 说明                                                          |
| --------------------- | ------------------------------------------------------------- |
| `PI_VIEW_FIELD_TOKEN` | 当前字段配置（React Context）                                 |
| `InjectorToken`       | 静态注入器（Context）                                        |
| `CVA`                 | `Symbol.for('ControlValueAccessor')`，标识组件暴露的 CVA 属性 |

### 获取字段

```tsx
import { useContext } from 'react';
import { PI_VIEW_FIELD_TOKEN } from '@piying/view-react';

const field = useContext(PI_VIEW_FIELD_TOKEN);
```

## 组件

### PiyingView

表单根组件：

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

> 🧭 **手动模式**：属于 [两种使用模式](zh/getting-started/two-modes/) 中的模式二。只手动**渲染位置**，字段内部仍全自动渲染。

把「包装器链 + 组件 + 递归子字段」整棵树渲染到指定位置：

```tsx
import { PiyingFieldTemplate } from '@piying/view-react';

<PiyingFieldTemplate field={field} path={['k2']} />;
```

| Props | 类型 | 说明 |
| --- | --- | --- |
| `field` | `PiResolvedViewFieldConfig`（必填） | 要渲染的字段配置 |
| `path` | `KeyPath`（可选） | 定位子字段；不传则渲染整个根字段 |

> 完整渲染管线、懒加载与常见坑见 [PiyingFieldTemplate（字段渲染）](zh/adapters/field-template/)。

### PiyingField

> 🧭 **手动模式**：同 `PiyingFieldTemplate`，属于模式二（手动绑定）。

字段绑定：把字段的 `FieldControl` 接到**你手写的控件**上，通过 `children` 渲染函数暴露 `cvaa` / `field`：

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

| Props | 类型 | 说明 |
| --- | --- | --- |
| `field` | `PiResolvedViewFieldConfig`（必填） | 字段配置 |
| `path` | `KeyPath`（可选） | 定位**叶子**子字段再绑定 |
| `children` | `({ cvaa, field }) => ReactNode` | 渲染作用域，类型跟着 `path` 推导 |

> 完整说明（含 `cvaa` 成员、错误码、与 `PiyingFieldTemplate` 对比）见 [PiyingField（字段绑定）](zh/adapters/field/)。

### PiyingGroup

字段组容器组件，用于渲染 `object` / `array` / `record` 等容器类型：

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

Wrapper 组件（包装器容器）。

## 工具函数

### useControlValueAccessor — CVA 适配器

返回 `cva`（ControlValueAccessor）与 `cvaa`（适配器）：

```tsx
import { CVA, useControlValueAccessor } from '@piying/view-react';
import { useImperativeHandle } from 'react';

interface PiInputOptions {
  [CVA]: React.RefObject<ControlValueAccessor>;
}

export function InputText(props: PiInputOptions) {
  const { cva, cvaa } = useControlValueAccessor();
  useImperativeHandle(props[CVA], () => cva, [cva]);
  // 使用 cvaa 渲染控件
}
```

`cvaa` 提供：

| 成员              | 类型           | 说明             |
| ----------------- | -------------- | ---------------- |
| `value`           | `any`          | 当前值           |
| `disabled`        | `boolean`      | 禁用状态         |
| `valueChange(v)`  | `(v) => void`  | 更新值并触发变更 |
| `touchedChange()` | `() => void`   | 触发 touched     |

### useSignalToRef — Signal 转换

将信号转换为 ref 引用：

```tsx
import { useSignalToRef } from '@piying/view-react';

const inputs = useSignalToRef(props.field, (field) => field.inputs());
```

### useEffectSync — 副作用同步

接收 `(fn, deps)`，基于 `useEffect` 实现副作用初始化与清理：

```tsx
import { useEffectSync } from '@piying/view-react';

useEffectSync(
  () => {
    // 副作用初始化
    return () => {
      /* 清理 */
    };
  },
  [deps],
);
```

### convertToField — Schema 转换

```tsx
import { convertToField } from '@piying/view-react';

// 第二个参数为可选的父 Injector，第三个参数为取值函数形式的 options
const field = convertToField(() => schema, injector /* 可选 */, () => options);
```

## use-*Model 绑定 Hook

将原生控件与 `cvaa` 双向绑定。详见 [字段模型绑定](zh/adapters/react/field-model-binding/)：

| Hook                    | 目标控件            |
| ----------------------- | ------------------- |
| `useInputTextModel`     | 文本输入            |
| `useInputCheckboxModel` | 复选框              |
| `useInputNumberModel`   | 数字输入            |
| `useInputRadioModel`    | 单选按钮            |
| `useInputRangeModel`    | 范围滑块            |
| `useSelectModel`        | 下拉选择（单选/多选） |

### typedFieldComponentPipe — 路径 + 组件双强类型

按「路径 + 组件」写配置，`inputs` 收非函数 prop，`outputs` 收函数 prop（**名字原样**，`onChange` 就是 `onChange`）。详见 [typedFieldComponentPipe（React）](zh/adapters/react/typed-field-component-pipe/)。

```tsx
import { typedFieldComponentPipe } from '@piying/view-react';

const merged = typedFieldComponentPipe(schema, define, (d) => [
  d(['price'], 'amount', [d.inputs.patch({ placeholder: '请输入金额' })]),
  d(['tags'], 'tags', [d.outputs.merge({ onChange: (value) => {} })]),
]);
```

> React 版**没有 `d.models`**；懒加载必须用 `React.lazy()` 包一层；class 属性写 `className`。

## 类与转换

### ReactSchemaHandle / ReactFormBuilder

```typescript
import { ReactSchemaHandle, ReactFormBuilder } from '@piying/view-react';

// ReactSchemaHandle — React 的 Schema 处理句柄（继承 CoreSchemaHandle）
// ReactFormBuilder — React 的 FormBuilder（继承 FormBuilder<ReactSchemaHandle>）
```

### PiResolvedViewFieldConfig

React 的字段配置类型：

```typescript
import { PiResolvedViewFieldConfig } from '@piying/view-react';
```

## 完整导出

`PiyingView`、`PiyingFieldTemplate`、`PiyingField`、`PiyingGroup`、`PiyingWrapper`、`PI_VIEW_FIELD_TOKEN`、`InjectorToken`、`CVA`、`useControlValueAccessor`、`useSignalToRef`、`useEffectSync`、`use-*Model` 系列、`typedFieldComponentPipe`、`convertToField`、`ReactSchemaHandle`、`ReactFormBuilder`、`PiResolvedViewFieldConfig`。

## 下一步

- [字段模型绑定](zh/adapters/react/field-model-binding/) — use-*Model 详解
- [typedFieldComponentPipe（React）](zh/adapters/react/typed-field-component-pipe/) — 路径 + 组件双强类型
- [框架差异](zh/getting-started/framework-differences/) — 各框架 CVA / Signal 对比
- [基础字段定义](zh/scenarios/basic-field/) — setComponent / formConfig

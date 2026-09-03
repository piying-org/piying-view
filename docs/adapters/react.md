# React 包 API 参考（@piying/view-react）

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
  onModelChange={(v) => setModel(v)}
/>;
```

### PiyingFieldTemplate

渲染字段模板：

```tsx
import { PiyingFieldTemplate } from '@piying/view-react';
```

### Field

字段控件绑定组件（将字段绑定为表单控件）：

```tsx
import { Field } from '@piying/view-react';
```

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

const field = convertToField(() => schema, envInjector, () => options);
```

## use-*Model 绑定 Hook

将原生控件与 `cvaa` 双向绑定。详见 [字段模型绑定](field-model-binding-react.md)：

| Hook                    | 目标控件            |
| ----------------------- | ------------------- |
| `useInputTextModel`     | 文本输入            |
| `useInputCheckboxModel` | 复选框              |
| `useInputNumberModel`   | 数字输入            |
| `useInputRadioModel`    | 单选按钮            |
| `useInputRangeModel`    | 范围滑块            |
| `useSelectModel`        | 下拉选择（单选/多选） |

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

`PiyingView`、`PiyingFieldTemplate`、`Field`、`PiyingGroup`、`PiyingWrapper`、`PI_VIEW_FIELD_TOKEN`、`InjectorToken`、`CVA`、`useControlValueAccessor`、`useSignalToRef`、`useEffectSync`、`use-*Model` 系列、`convertToField`、`ReactSchemaHandle`、`ReactFormBuilder`、`PiResolvedViewFieldConfig`。

## 下一步

- [字段模型绑定](field-model-binding-react.md) — use-*Model 详解
- [框架差异](../getting-started/framework-differences.md) — 各框架 CVA / Signal 对比
- [基础字段定义](../scenarios/basic-field.md) — setComponent / formConfig

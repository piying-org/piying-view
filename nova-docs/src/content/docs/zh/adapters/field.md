---
title: "PiyingField（字段绑定）"
---

> 🧭 **手动模式**：`PiyingField` 属于 [两种使用模式](zh/getting-started/two-modes/) 中的模式二（手动绑定）。它不做自动渲染，只负责把「字段的表单控件」接到**你自己写的控件**上。
>
> 📌 本页只讲**跨框架统一的契约**（语义、Props、`cvaa`、错误码）。

`PiyingField`（字段绑定）解决一件事：**你手写一个原生控件，但要让它拥有 Piying-View 的值双向绑定、校验状态与禁用状态。**

## 各框架的导出名

| 框架 | 导出名 | 形态 |
| --- | --- | --- |
| Vue 3 | `PiyingField`（同时导出为 `PiyingFieldControlBind`） | 组件 + 默认插槽 |
| React | `PiyingField` | 组件 + `children` 渲染函数 |
| Solid | `PiyingField` | 组件 + `children` 渲染函数 |
| Svelte | `PiyingField` | 组件 + `children` snippet |

> ℹ️ Angular 不在此列：它用指令 `PiyingFieldControlBindDirective`（`selector: '[formControl]'`）借用 Angular 表单的 `NG_VALUE_ACCESSOR` 体系，详见 [Angular 指令](zh/angular/directives/)。

## Props（所有框架一致）

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `field` | `PiResolvedViewFieldConfig` | 是 | 字段配置（`convertToField` 的返回值，或任意子字段） |
| `path` | `KeyPath` | 否 | 从 `field` 定位到某个**叶子**子字段再绑定 |

## 渲染作用域

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `cvaa` | `ControlValueAccessorAdapter<值类型>` | 控件值适配器，见下表 |
| `field` | `PiFieldGet<S, P>` | `path` 指向的字段本身（可用于读 errors 等） |

类型会跟着 `path` 推导：`path={['number1']}` 时 `cvaa.value` 就是 `number`，`valueChange` 只接受 `number`。

## cvaa 成员

| 成员 | 作用 | React | Vue | Solid | Svelte |
| --- | --- | --- | --- | --- | --- |
| `value` | 当前值 | `V`（普通值） | `ShallowRef<V>`（模板需 `unref`） | `Accessor<V>`（需 `()`） | `V`（`$state` getter） |
| `disabled` | 禁用状态 | `boolean` | `Ref<boolean>` | `Accessor<boolean>` | `boolean` |
| `valueChange(v)` | 写回值并触发变更 | ✅ | ✅ | ✅ | ✅ |
| `touchedChange()` | 标记为已触碰 | ✅ | ✅ | ✅ | ✅ |

> 语义完全一致，只是**响应式外壳**不同：React 靠重渲染、Vue 用 ref、Solid 用 accessor、Svelte 用 runes。

## 内部机制

```
PiyingField
  ├── ① 解析字段：path ? field.get(path) : field
  ├── ② useControlValueAccessor() 生成一份 cva / cvaa
  ├── ③ 校验目标：必须有 form.control，且必须是叶子 FieldControl
  ├── ④ createViewControlLink(() => control, cva, injector) 建立双向链路
  └── ⑤ 组件卸载时 dispose(true) 释放链路
```

链路建立后：

- **模型 → 视图**：`control` 值变化 → `cva.writeValue` → `cvaa.value` 更新
- **视图 → 模型**：`cvaa.valueChange(v)` → `cva` 注册的 `onChange` → `control.viewValueChange(v)`（受 `updateOn` 策略影响）
- **禁用**：`control` 禁用状态 → `cva.setDisabledState` → `cvaa.disabled`

## 常见错误

| 错误信息 | 原因 | 处理 |
| --- | --- | --- |
| `📍 fieldControlBind:[a]->[b]❗` | 目标字段没有 `form.control`（被标记 `nonFieldControl`，或尚未解析完成） | 确认该字段确实参与表单；检查 `path` 是否写错 |
| `🏷️ fieldControl❗` | 目标不是叶子控件，而是 `FieldGroup` / `FieldArray` / `FieldLogicGroup` | 用 `path` 定位到叶子字段；容器场景改用 [PiyingFieldTemplate](zh/adapters/field-template/) |

## Field 与 PiyingFieldTemplate 的区别

| 维度 | `PiyingField` | `PiyingFieldTemplate` |
| --- | --- | --- |
| 渲染主体 | **你手写的控件** | Schema 元数据决定的组件 |
| 组件来源 | 你自己写在插槽里 | `setComponent` / `fieldGlobalConfig` |
| 输出 | `cvaa`（值 / 禁用 / touched） | 无（直接渲染组件树） |
| 是否套 wrapper | ❌ 不套 | ✅ 自动套 wrapper 链 |
| 是否递归子字段 | ❌ 只绑叶子 | ✅ Group 自动递归 |
| 典型场景 | 用原生 `<input>` 但保留校验/联动 | 指定摆放位置，内部全自动 |

## 下一步

- [PiyingFieldTemplate（字段渲染）](zh/adapters/field-template/) — 指定位置，内部全自动
- [适配器总览](zh/adapters/) — 适配器分层与渲染链路
- [两种使用模式](zh/getting-started/two-modes/) — 自动 vs 手动
- [字段模型绑定（React）](zh/adapters/react/field-model-binding/) — `use-*Model` 简化 `cvaa` 绑定
- [AbstractControl](zh/api/control-api/) — `field.form.control` 控件操作

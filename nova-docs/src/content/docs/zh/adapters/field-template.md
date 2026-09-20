---
title: "PiyingFieldTemplate（字段渲染）"
---

> 🧭 **手动模式**：`PiyingFieldTemplate` 属于 [两种使用模式](zh/getting-started/two-modes/) 中的模式二（手动绑定）。它只「手动」了**渲染位置**，该字段内部依旧走完整的自动渲染管线。
>
> 📌 本页只讲**跨框架统一的契约**（语义、Props、渲染管线）。

`PiyingFieldTemplate` 是适配器的**渲染出口**：给它一个字段，它就把「包装器链 + 组件 + 递归子字段」整棵树渲染在你指定的位置。`PiyingView` 内部其实就是「`convertToField` + 一个 `PiyingFieldTemplate`」。

## 各框架的导出名

| 框架 | 导出名 | 形态 |
| --- | --- | --- |
| Vue 3 | `PiyingFieldTemplate` | 组件 |
| React | `PiyingFieldTemplate` | 组件 |
| Solid | `PiyingFieldTemplate` | 组件 |
| Svelte | `PiyingFieldTemplate` | 组件 |

> ℹ️ Angular 不在此列：它用指令 `PiyingFieldTemplateDirective`（`selector: '[fieldTemplate]'`），详见 [Angular 指令](zh/angular/directives/)。

## Props（所有框架一致）

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `field` | `PiResolvedViewFieldConfig` | 是 | 要渲染的字段配置 |
| `path` | `KeyPath` | 否 | 从 `field` 定位子字段；不传则渲染整个根字段 |

## 渲染管线

```
PiyingFieldTemplate(field, path)
  ├── ① 定位字段：path ? field.get(path) : field
  ├── ② 提供字段上下文：把字段写入 PI_VIEW_FIELD_TOKEN（子组件可 inject / getContext）
  ├── ③ 组装输入：{ ...attributes(), ...inputs(), ...outputs() }
  ├── ④ 隐藏判定：renderConfig.hidden 为真 或 define?.type 缺失 → 整块不渲染
  ├── ⑤ 套包装器链：wrappers 从外到内依次包裹
  └── ⑥ 渲染 define.type 组件
        └── 若 field.form.control 存在 → 取回组件的 CVA，
            createViewControlLink(() => control, cva, injector) 建立双向链路
```

几个关键点：

- **位置手动，内部自动**：组件类型、包装器、子字段递归全部来自 Schema 元数据，与自动模式完全一致。
- **字段上下文由它提供**：子组件必须渲染在 `PiyingFieldTemplate` 内部，才能通过 `PI_VIEW_FIELD_TOKEN` 拿到当前字段。
- **CVA 只在有控件时建立**：纯展示组件（`nonFieldControl`）不会建立控件链路。

## 懒加载

| 框架 | 懒加载方式 |
| --- | --- |
| Vue | 内置支持：`isLazyMark` + `defineAsyncComponent(getLazyImport(type))` |
| Svelte | 内置支持：`{#await loading then LazyComponent}` |
| React | 需自行用 `React.lazy()` 包装组件 |
| Solid | 需自行用 `lazy()` 包装组件 |

## 常见坑

| 现象 | 原因 | 处理 |
| --- | --- | --- |
| 什么都不渲染 | `renderConfig.hidden` 为真，或该字段没有 `define.type`（没配 `setComponent` / `fieldGlobalConfig`） | 检查 `hideWhen` 与组件映射是否命中 |
| 值不更新 / 无校验 | 字段是 `nonFieldControl`，没有 `form.control` | 需要参与表单就不要标记 `nonFieldControl` |
| 子组件拿不到当前字段 | 子组件渲染在 `PiyingFieldTemplate` 之外 | 把它放进模板内部，或显式传入 `field` |
| 切换 `path` 后仍是旧内容 | `path` 传的不是可响应式引用 | 用 signal / ref / 取值函数传入，保证 `path` 变化能被追踪 |

## PiyingFieldTemplate 与 Field 的区别

| 维度 | `PiyingFieldTemplate` | [`PiyingField`](zh/adapters/field/) |
| --- | --- | --- |
| 渲染主体 | Schema 元数据决定的组件 | 你手写的控件 |
| 是否套 wrapper | ✅ 自动套整条 wrapper 链 | ❌ 不套 |
| 是否递归子字段 | ✅ Group 自动递归 | ❌ 只绑叶子 |
| 输出 | 无（直接渲染） | `cvaa`（值 / 禁用 / touched） |
| 典型场景 | 指定摆放位置，内部全自动 | 用原生控件但保留校验/联动 |

## 下一步

- [PiyingField（字段绑定）](zh/adapters/field/) — 把字段接到你手写的控件
- [适配器总览](zh/adapters/) — 适配器分层与渲染链路
- [两种使用模式](zh/getting-started/two-modes/) — 自动 vs 手动
- [Wrappers 包装器](zh/api/wrappers/) — 包装器链机制
- [指令（Angular）](zh/angular/directives/) — `PiyingFieldTemplateDirective` 完整参考

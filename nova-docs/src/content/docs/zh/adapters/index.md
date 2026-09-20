---
title: "适配器总览（Adapter）"
---

本文讲清楚 **适配器（Adapter）** 这一层：它是什么、为什么需要它、一个适配器必须提供哪些能力，以及如何自己动手写一个新框架的适配器。

> 💡 只想看「各框架哪里不一样」，直接去 [框架差异](zh/getting-started/framework-differences/)。本文讲的是「差异背后的统一契约」。

## 为什么需要适配器

Piying-View 的核心逻辑（Schema 解析、字段树构建、值/校验/联动）**与框架无关**：它只依赖 Angular 风格的 Signal 与 [static-injector](https://github.com/wszgrcy/static-injector) 静态注入器。

但「把字段变成真实 DOM」必须用到各框架自己的组件系统、上下文机制与控件绑定方式。于是拆成两层：

```
@piying/view-core            ← 框架无关：Schema 解析 / FormBuilder / FieldControl / Action / createViewControlLink
        ▲
@piying/view-<framework>     ← 适配器：Token / CVA 桥接 / 渲染组件 / 响应式转换
        ▲
你的应用
```

**结论**：Schema、Action、字段配置、路径查询、校验——所有框架完全一致；只有「渲染与绑定」这一层由适配器实现。

## 包一览

| 包 | 角色 |
| --- | --- |
| `@piying/view-core` | 框架无关核心（解析链、字段树、Action、控件模型） |
| `@piying/view-angular-core` | Angular 侧核心（复用 `@angular/core` 的 Signal / DI） |
| `@piying/view-angular` | Angular 适配（组件、指令、`NG_VALUE_ACCESSOR` 桥接） |
| `@piying/view-vue` | Vue 3 适配 |
| `@piying/view-vue2-legacy` | Vue 2 适配（API 结构一致，细节有差异） |
| `@piying/view-react` | React 适配 |
| `@piying/view-solid` | Solid 适配 |
| `@piying/view-svelte` | Svelte 5（runes）适配 |

## 一个适配器必须提供的能力

每个 `@piying/view-<framework>` 都必须实现下面 8 项，缺一项就跑不起来：

| # | 能力 | 说明 | Angular | Vue | React | Solid | Svelte |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | **SchemaHandle** | 继承 `CoreSchemaHandle`，承载框架侧的解析扩展点 | `NgSchemaHandle` | `VueSchemaHandle` | `ReactSchemaHandle` | `SolidSchemaHandle` | `SvelteSchemaHandle` |
| 2 | **FormBuilder** | 继承 `FormBuilder<XxxSchemaHandle>`，产出已解析字段 | `AngularFormBuilder` | `VueFormBuilder` | `ReactFormBuilder` | `SolidFormBuilder` | `SvelteFormBuilder` |
| 3 | **convertToField** | `createConvertToField({ builder, handle }, rootInjector)` 的实例 | ✅ | ✅ | ✅ | ✅ | ✅ |
| 4 | **Token** | 字段上下文 `PI_VIEW_FIELD_TOKEN` 与注入器 `InjectorToken` | DI Token | `InjectionKey` | Context | Context | `Symbol` + context |
| 5 | **CVA 适配** | `useControlValueAccessor()` → `{ cva, cvaa }` | `BaseControl` + `NG_VALUE_ACCESSOR` | `defineExpose({ cva })` | `useImperativeHandle` | `createMemo` | `export { cva }` |
| 6 | **响应式转换** | 把核心 Signal 转成框架响应式 | —（原生支持） | `signalToRef` | `useSignalToRef` | `createSignalConvert` | `signalToState` |
| 7 | **渲染组件** | `PiyingView` / `PiyingFieldTemplate` / `PiyingField` / Group / Wrapper | 组件 + 指令 | SFC | 函数组件 | 函数组件 | Svelte 组件 |
| 8 | **typedFieldComponentPipe** | 「路径 + 组件」双强类型（可选但强烈建议） | ✅ | ✅ | ✅ | ✅ | ✅ |

> 📌 第 7 项里的 `PiyingFieldTemplate` 与 `PiyingField` 是适配器的**两个核心渲染出口**，分别有独立文档：
>
> - [PiyingFieldTemplate（字段渲染）](zh/adapters/field-template/)
> - [PiyingField（字段绑定）](zh/adapters/field/)

## 渲染链路

```
convertToField(schema, injector, options)
        │
        ▼
   field（PiResolvedViewFieldConfig，整棵已解析字段树）
        │
        ├── PiyingView ────────── 自动模式入口（内部自动调用 convertToField）
        │        │
        │        ▼
        │   PiyingFieldTemplate ─ 渲染「一个字段」
        │        │   ① hidden 判定  ② 套 wrapper 链  ③ 渲染 define.type 组件
        │        │   ④ 若 field.form.control 存在 → 建立 CVA 双向链路
        │        │
        │        └── 容器组件（Group）→ 对每个子字段再走一遍 PiyingFieldTemplate（递归）
        │
        └── Field（FieldControlBind）─ 手动模式出口
                不渲染 define.type，而是把 control 通过 cvaa 交给「你手写的控件」
```

两条链路的共同点：最终都调用核心包的 `createViewControlLink(() => control, cva, injector)` 来打通「表单控件 ↔ 视图控件」的值、touched、disabled 同步。区别只在于 **CVA 由谁提供**：

| 出口 | CVA 由谁提供 | 组件由谁决定 |
| --- | --- | --- |
| `PiyingFieldTemplate` | 适配器内部（从渲染出的组件上取回 CVA） | Schema 元数据（`setComponent` / `fieldGlobalConfig`） |
| `PiyingField` | 适配器内部创建，通过 `cvaa` 交给你 | **你手写的控件** |

## 如何新增一个适配器

按下面清单逐项实现即可（以 `@piying/view-foo` 为例）：

1. **建包**，依赖 `@piying/view-core` 与 `static-injector`。
2. **SchemaHandle**：`class FooSchemaHandle extends CoreSchemaHandle<FooSchemaHandle, () => PiResolvedViewFieldConfig>`。
3. **FormBuilder**：`class FooFormBuilder extends FormBuilder<FooSchemaHandle> {}`。
4. **convertToField**：`createConvertToField({ builder: FooFormBuilder, handle: FooSchemaHandle }, rootInjector)`，其中 `rootInjector` 需提供 `ChangeDetectionScheduler`。
5. **Token**：定义 `PI_VIEW_FIELD_TOKEN`、`InjectorToken`，并保证「provide / inject」语义在框架内可用。
6. **CVA 适配**：实现 `useControlValueAccessor()`，返回 `cva`（`writeValue` / `registerOnChange` / `registerOnTouched` / `setDisabledState`）与 `cvaa`（`value` / `disabled` / `valueChange` / `touchedChange`）。
7. **响应式转换**：实现 `signalConvert(() => signal)`，把核心 Signal 变成框架可追踪的响应式值。
8. **渲染组件**：实现 `PiyingView`、`PiyingFieldTemplate`、`PiyingField`、Group、Wrapper 五个组件，遵循上文「渲染链路」的顺序。
9. **typedFieldComponentPipe**（可选）：提供「路径 + 组件」双强类型。
10. **对齐测试**：与现有适配包跑同一组用例（值双向、touched、disabled、懒加载、销毁、wrapper、group 递归）。

> ⚠️ 实现时最容易踩的三个点：
>
> 1. **销毁必须 dispose**：`createViewControlLink` 返回的 `dispose` 必须在组件卸载时调用（建议 `dispose(true)`），否则会残留监听。
> 2. **Token 作用域**：`PiyingFieldTemplate` 必须先 provide 字段上下文，再渲染子组件，否则子组件 `inject` 不到当前字段。
> 3. **hidden 与无组件**：`renderConfig.hidden` 为真或 `define?.type` 缺失时，整块必须不渲染（而不是渲染空壳）。

## 下一步

- [PiyingField（字段绑定）](zh/adapters/field/) — 手动把字段接到你手写的控件
- [PiyingFieldTemplate（字段渲染）](zh/adapters/field-template/) — 指定位置，内部全自动渲染
- [框架差异](zh/getting-started/framework-differences/) — Token / CVA / Signal 逐项对照
- [两种使用模式](zh/getting-started/two-modes/) — 自动模式 vs 手动模式
- [核心概念](zh/getting-started/core-concept/) — Schema → Field → Component 解析链

# Piying-View 文档

Piying-View 是一个开源的 TypeScript 表单库，它将 [Valibot](https://github.com/fabian-hiller/valibot) 验证 Schema 转换为 UI 视图定义。你只需要定义一个 Schema，Piying-View 就能自动渲染出完整的表单界面，并提供双向数据绑定、动态控制、自定义组件等丰富能力。

**核心特性：**

- **Schema 驱动**：使用 Valibot 类型安全的 Schema 定义表单结构
- **多框架支持**：Angular（主力）、Vue、React、Solid、Svelte
- **灵活的组件映射**：通过 `setComponent` 自由指定每个字段的渲染组件
- **动态控制**：`hideWhen` / `disableWhen` / `valueChange` 实现字段联动
- **包装器系统**：用户自定义 Wrapper 包裹任意字段，支持 V1/V2 两种模板语法
- **全局配置体系**：`fieldGlobalConfig` 统一管理默认类型、包装器和 Actions

---

## 目录结构

### 🚀 入门使用 (Getting Started)

从零开始了解 Piying-View，帮助你快速上手。

| 文档                                              | 说明                                                                                |
| ------------------------------------------------- | ----------------------------------------------------------------------------------- |
| [5分钟快速上手](getting-started/quick-start.md)   | 安装 → 定义 Schema → 渲染表单，5 分钟完成第一个表单                                 |
| [核心概念](getting-started/core-concept.md)       | Schema → CoreSchemaHandle → Field Control → View Component 的完整转换链             |
| [Options 配置](getting-started/options-config.md) | PiyingView 组件的 `options` 属性详解：context / fieldGlobalConfig / builder |
| [框架差异](getting-started/framework-differences.md) | Angular/Vue/React/Solid/Svelte 各框架的使用差异说明 |
| [JSON Schema 支持](getting-started/jsonschema.md) | JSON Schema 转换为 Valibot Schema 的方法和使用限制 |

### 📖 业务场景 (Scenarios)

按常见业务场景组织，每个场景都有经过验证的完整示例。

| 文档                                                          | 说明                                                                     |
| ------------------------------------------------------------- | ------------------------------------------------------------------------ |
| [基础字段定义](scenarios/basic-field.md)                      | `setComponent`、`formConfig`（必填 / 默认值 / nullable / undefinedable） |
| [复杂 Schema 结构](scenarios/complex-schema.md)               | nesting / object / array / tuple / record / intersect / union            |
| [asControl / asVirtualGroup](scenarios/as-control-group.md)   | Group 视为独立控件、Intersect 子级作为虚拟 group                         |
| [动态字段控制](scenarios/dynamic-fields.md)                   | hideWhen / disableWhen / valueChange                                     |
| [值转换与联动](scenarios/value-transform.md)                  | transformer(toModel / toView)                                            |
| [自定义验证](scenarios/custom-validation.md)                  | validators / asyncValidators                                             |
| [数组高级用法](scenarios/array-advanced.md)                   | 增删改、deletionMode(shrink / mark)、groupMode(loose / default / strict) |
| [Record Schema 动态对象组](scenarios/record-dynamic-group.md) | Record 类型的动态键值对表单                                              |
| [综合示例：完整业务表单](scenarios/complete-example.md)       | 结合实际业务场景的综合示例                                               |

### 🔧 API 参考 (API Reference)

所有 Actions、配置项和工具函数的详细参考文档。

> **注意**：Actions 的逻辑定义（Schema 层面）在所有框架中相同，只有组件渲染部分因框架而异。以下 API 参考以 Angular 为主，其他框架作为补充说明。

| 文档                                                        | 说明                                                                               |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| [setComponent](api/setComponent.md)                         | 组件设置：字符串引用 vs 直接传组件类                                               |
| [inputs](api/inputs.md)                                       | Inputs 设置（set / patch / remove）                                              |
| [outputs](api/outputs.md)                                     | Outputs 设置（set / patch / remove / patchAsync）                                |
| [events](api/events.md)                                       | DOM 事件处理                                                                     |
| [attributes](api/attributes.md)                               | HTML Attributes 设置（set / patch / remove / patchAsync）                        |
| [CSS class](api/css-class.md)                                 | CSS Class 设置（topClass / bottomClass）                                         |
| [Layout metadata](api/layout.md)                            | keyPath (fullPath / keyPath / @alias / ..) + priority                              |
| [hideWhen / disableWhen / valueChange](api/hide-disable.md) | 动态控制字段可见性、可用性和值变化                                                 |
| [Wrappers 包装器](api/wrappers.md)                          | Wrappers 设置（set / remove / patchAsync）+ Wrapper 编写指南 |
| [路径查询](api/path-querying.md)                            | KeyPath 类型定义、field.get() 用法、查询表达式速查（`#` `..` `@alias`）              |
| [FieldFormConfig](api/field-config.md)                      | disabled / disabledValue / pipe / updateOn / emptyValue 等配置详解                 |
| [Control API](api/control-api.md)                           | FieldControl / AbstractControl 完整参考：值管理、状态、验证、导航、配置             |
| [fieldGlobalConfig](api/global-config.md)                   | types / wrappers / actions 全局默认值 + 优先级体系                                 |

---

## 快速导航

| 主题       | 链接                                            |
| ---------- | ----------------------------------------------- |
| 安装使用   | [5分钟快速上手](getting-started/quick-start.md) |
| 理解原理   | [核心概念](getting-started/core-concept.md)     |
| 基本字段   | [基础字段定义](scenarios/basic-field.md)        |
| 动态控制   | [动态字段控制](scenarios/dynamic-fields.md)     |
| 自定义组件 | [setComponent](api/setComponent.md)             |
| 包装器     | [Wrappers 包装器](api/wrappers.md)              |
| 全局配置   | [fieldGlobalConfig](api/global-config.md)       |

## 环境要求

| 项目                   | 版本     |
| ---------------------- | -------- |
| Node.js                | >= 18    |
| Valibot                | v1.x     |
| Angular (view-angular) | v20+     |
| pnpm                   | 推荐使用 |

## 包列表

| 包名                        | 用途                            |
| --------------------------- | ------------------------------- |
| `@piying/view-angular`      | Angular 适配器（主力维护）      |
| `@piying/view-angular-core` | 核心字段模型、Builder、转换系统 |
| `@piying/view-react`        | React 渲染器                    |
| `@piying/view-vue`          | Vue 3 渲染器                    |
| `@piying/view-vue2-legacy`  | Vue 2 兼容层                    |
| `@piying/view-solid`        | Solid.js 渲染器                 |
| `@piying/view-svelte`       | Svelte 渲染器                   |

## 源码地址

- GitHub: https://github.com/piying-org/piying-view

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

| 文档                                                 | 说明                                                                                                      |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| [5分钟快速上手](getting-started/quick-start.md)      | 安装 → 定义 Schema → 注册组件 → 渲染表单，含自定义 CVA 组件编写方法                                       |
| [核心概念](getting-started/core-concept.md)          | Valibot Schema → CoreSchemaHandle → FormBuilder → Component Tree 的三阶段解析链与数据流（toView/toModel） |
| [Options 配置](getting-started/options-config.md)    | PiyingView 组件 `options` 属性详解：context 上下文、fieldGlobalConfig 全局类型/包装器映射、自定义 Builder |
| [框架差异](getting-started/framework-differences.md) | Angular/Vue/React/Solid/Svelte 各框架的 Field Token 获取、CVA 绑定、Signal 转换工具对比                   |
| [JSON Schema 支持](getting-started/jsonschema.md)    | `jsonSchemaToValibot()` 自动转换函数，支持 Draft-04/07/2020-12，含类型映射表和限制说明                    |

### 📖 业务场景 (Scenarios)

按常见业务场景组织，每个场景都有经过验证的完整示例。

| 文档                                                          | 说明                                                                                                            |
| ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| [基础字段定义](scenarios/basic-field.md)                      | `setComponent`（字符串引用 vs 直接传组件类）、`formConfig` 完整字段表、Valibot 元数据自动推导、自定义验证器     |
| [复杂 Schema 结构](scenarios/complex-schema.md)               | v.object()→FieldGroup / v.array()→FieldArray / v.record()/intersect()/union() 的映射及 layout priority 排序     |
| [asControl / asVirtualGroup](scenarios/as-control-group.md)   | `asControl()` 将嵌套对象整体作为独立控件、`asVirtualGroup()` 让 Intersect 子级作为普通 Group，含三大使用场景    |
| [动态字段控制](scenarios/dynamic-fields.md)                   | hideWhen（条件隐藏）、disableWhen（条件禁用）、valueChange（值监听无副作用），含支付方式切换/级联联动示例       |
| [值转换与联动](scenarios/value-transform.md)                  | formConfig.transformer(toView/toModel)、pipe（RxJS Observable 管道）、Valibot v.transform() 对比 + 完整数据流图 |
| [自定义验证](scenarios/custom-validation.md)                  | validators/asyncValidators（Promise/Observable/Signal 四种写法）、新旧格式错误处理、字段对比验证/条件验证示例   |
| [数组高级用法](scenarios/array-advanced.md)                   | FieldArray API（set/remove/updateValue/clear/reset）、deletionMode(shrink/mark)、groupMode、TupleWithRest       |
| [Record Schema 动态对象组](scenarios/record-dynamic-group.md) | v.record() 特殊 Group 处理：`groupKeySchema`/`groupValueSchema` 约束，含标签编辑/配置映射/多语言翻译三大场景    |
| [综合示例：完整业务表单](scenarios/complete-example.md)       | 用户注册表单实战：基本信息+密码+隐私+动态标签+自我介绍，整合验证/hideWhen/disableWhen/组件注册 + API 总结表     |

### 🔧 API 参考 (API Reference)

所有 Actions、配置项和工具函数的详细参考文档。

> **注意**：Actions 的逻辑定义（Schema 层面）在所有框架中相同，只有组件渲染部分因框架而异。以下 API 参考以 Angular 为主，其他框架作为补充说明。

| 文档                                                        | 说明                                                                                                                                                                                |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [setComponent](api/setComponent.md)                         | `setComponent` Action 完整 API：字符串引用（通过 fieldGlobalConfig.types）vs 直接传组件类，含内置类型名 key 映射表                                                                  |
| [inputs](api/inputs.md)                                     | `actions.inputs` 组件输入属性设置：set（覆盖）、patch（合并）、remove（移除），为字段组件传递 @Input() 值                                                                           |
| [outputs](api/outputs.md)                                   | `actions.outputs` 组件输出事件设置：set/patch/remove/patchAsync（动态创建），绑定自定义事件处理器到字段                                                                             |
| [events](api/events.md)                                     | `actions.events.patchAsync` 原生 DOM 事件声明式绑定，click/keydown 等事件处理                                                                                                       |
| [attributes](api/attributes.md)                             | `actions.attributes` HTML 原生属性设置：set/patch/remove/patchAsync，含 attributes vs inputs 区别表、ARIA/data-\* 属性                                                              |
| [CSS class](api/css-class.md)                               | `actions.class` CSS Class 设置：topClass（最外层容器）/ bottomClass（底部错误信息等区域）                                                                                           |
| [Layout metadata](api/layout.md)                            | `layout` Action：priority 排序权重 + keyPath 查询表达式（'#'/'..'/'@alias'），Intersect + Layout 配合改变字段排列                                                                   |
| [hideWhen / disableWhen / valueChange](api/hide-disable.md) | hideWhen/disableWhen/valueChange/outputChange 完整 API 签名、listenFields 数组机制、skipInitValue、生命周期时机说明                                                                 |
| [Wrappers 包装器](api/wrappers.md)                          | `actions.wrappers` set/patchAsync/remove + Wrapper 组件编写指南（V1/V2 模板对比、InsertFieldDirective 用法）                                                                        |
| [路径查询](api/path-querying.md)                            | KeyPath 类型定义、field.get() 用法：`['..']`(父级开始)/`'#'`(根字段开始)/`'@alias'`(别名定位)、命名冲突处理规则                                                                     |
| [FieldFormConfig](api/field-config.md)                      | `FieldFormConfig` 完整字段参考：renderConfig vs hideWhen、transformer/pipe/validators/updateOn/deletionMode/rawConfig                                                               |
| [Control API](api/control-api.md)                           | FieldControl/AbstractControl 完整参考：获取 Control、值 API(updateValue/reset/viewValueChange)、状态 API(disabled/touched/dirty)、FieldArray API(length/controls/removeRestControl) |
| [fieldGlobalConfig](api/global-config.md)                   | `fieldGlobalConfig` types/wrappers 全局配置结构 + Actions 合并规则（全局在前）+ Component Type 查找优先级体系                                                                       |
| [Hooks 生命周期](api/hooks.md)                              | `actions.hooks` Hook 生命周期管理：merge(依次执行多个)/patch(覆盖同名)/remove/set，Hook 注册与执行顺序详解                                                                          |
| [Providers 服务注入](api/providers.md)                      | `actions.providers` 将业务服务注入字段组件 Injector：set(覆盖)/patch(追加)/change(函数式变换)，含 inject() 使用示例                                                                 |
| [Props 通用属性](api/props.md)                              | `actions.props` 通用属性键配置：set(覆盖)/patch(合并)/mapAsync(动态映射)，组件通过 field.props() 访问，vs Attributes/Inputs/Outputs 语义区分                                        |

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

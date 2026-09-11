---
title: "Piying-View 文档"
---

Piying-View 是一个开源的 TypeScript 表单库，它将 [Valibot](https://github.com/fabian-hiller/valibot) 验证 Schema 转换为 UI 视图定义。你只需要定义一个 Schema，并为其注册对应的渲染组件，Piying-View 就能自动渲染出完整的表单界面，并提供双向数据绑定、动态控制、自定义组件等丰富能力。

**核心特性：**

- **Schema 驱动**：使用 Valibot 类型安全的 Schema 定义表单结构
- **多框架支持**：Angular（主力）、Vue、React、Solid、Svelte
- **灵活的组件映射**：通过 `setComponent` 自由指定每个字段的渲染组件
- **动态控制**：`hideWhen` / `disableWhen` / `valueChange` 实现字段联动
- **包装器系统**：用户自定义 Wrapper 包裹任意字段，支持 V1/V2 两种模板语法
- **全局配置体系**：`fieldGlobalConfig` 统一管理默认类型、包装器和 Actions

> 💡 **框架专属提示**：本文档按「通用」与「框架专属」划分。**通用文档**（入门使用、业务场景、API 参考）中的 Actions 逻辑在所有框架中一致；**Angular 专属**目录则仅针对 Angular 框架特有的 API 与指令。

---

## 目录结构

### 🚀 入门使用 (Getting Started)

从零开始了解 Piying-View，帮助你快速上手。以下文档的 Actions 逻辑在所有框架中一致，仅以 Angular 为例展示。

| 文档                                                 | 说明                                                                                                      |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| [5分钟快速上手](zh/getting-started/quick-start/)      | 安装（含各框架安装命令）→ 定义 Schema → 注册组件 → 渲染表单，含自定义 CVA 组件编写方法                       |
| [两种使用模式](zh/getting-started/two-modes/)          | 自动模式（`<piying-view>` 全自动渲染）vs 手动模式（`convertToField` + `[formControl]`/`[fieldTemplate]` 绑定），边界划分与代码解析 |
| [核心概念](zh/getting-started/core-concept/)          | Valibot Schema → CoreSchemaHandle → FormBuilder → Component Tree 的三阶段解析链与数据流（toView/toModel） |
| [Options 配置](zh/getting-started/options-config/)    | PiyingView 组件 `options` 属性详解：context 上下文、fieldGlobalConfig 全局类型/包装器映射、自定义 Builder |
| [框架差异](zh/getting-started/framework-differences/) | Angular/Vue/React/Solid/Svelte 各框架的 Field Token 获取、CVA 绑定、Signal 转换工具对比                   |
| [JSON Schema 支持](zh/getting-started/jsonschema/)    | `jsonSchemaToValibot()` 自动转换函数，支持 Draft-04/07/2020-12，含类型映射表和限制说明                    |

### 📖 业务场景 (Scenarios)

按常见业务场景组织，每个场景都有经过验证的完整示例（Actions 逻辑通用，跨框架一致）。

| 文档                                                          | 说明                                                                                                            |
| ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| [基础字段定义](zh/scenarios/basic-field/)                      | `setComponent`（字符串引用 vs 直接传组件类）、`formConfig` 完整字段表、Valibot 元数据自动推导、自定义验证器     |
| [类型映射（定义即表单）](zh/scenarios/type-mapping/) | Valibot 类型→表单控件/表单组/表单数组的自动映射：string/number/boolean/picklist/object/record/tuple/array 等，含默认值与嵌套定义 |
| [表单使用](zh/scenarios/form-use/) | 表单使用总览：值监听/布局移动/分区禁用/字段分组/级联/验证/过滤组/滚动组 |
| [组件使用](zh/scenarios/component-use/) | 组件类型、非表单控件（NFCSchema）、属性操作与事件输出、上下文、rawConfig 高级自定义、无标签组件（selectorless） |
| [复杂 Schema 结构](zh/scenarios/complex-schema/)               | v.object()→FieldGroup / v.array()→FieldArray / v.record()/intersect()/union() 的映射及 layout priority 排序     |
| [asControl / asVirtualGroup](zh/scenarios/as-control-group/)   | `asControl()` 将嵌套对象整体作为独立控件、`asVirtualGroup()` 让 Intersect 子级作为普通 Group，含三大使用场景    |
| [动态字段控制](zh/scenarios/dynamic-fields/)                   | hideWhen（条件隐藏）、disableWhen（条件禁用）、valueChange（值监听无副作用），含支付方式切换/级联联动示例       |
| [值转换与联动](zh/scenarios/value-transform/)                  | formConfig.transformer(toView/toModel)、pipe（RxJS Observable 管道）、Valibot v.transform() 对比 + 完整数据流图 |
| [自定义验证](zh/scenarios/custom-validation/)                  | validators/asyncValidators（Promise/Observable/Signal 四种写法）、新旧格式错误处理、字段对比验证/条件验证示例   |
| [数组高级用法](zh/scenarios/array-advanced/)                   | FieldArray API（set/remove/updateValue/clear/reset）、deletionMode(shrink/mark)、groupMode、TupleWithRest       |
| [对象组高级用法](zh/scenarios/object-group-advanced/)       | groupMode(default/loose/strict/reset) 对多余键的处理、手动指定 groupMode、groupKeySchema 限制新增键、emptyValue 空值输出 |
| [Record Schema 动态对象组](zh/scenarios/record-dynamic-group/) | v.record() 特殊 Group 处理：`groupKeySchema`/`groupValueSchema` 约束，含标签编辑/配置映射/多语言翻译三大场景    |
| [综合示例：完整业务表单](zh/scenarios/complete-example/)       | 用户注册表单实战：基本信息+密码+隐私+动态标签+自我介绍，整合验证/hideWhen/disableWhen/组件注册     |

### 🔧 API 参考 (API Reference)

所有 Actions、配置项和工具函数的详细参考文档，逻辑定义在所有框架中相同。其中 Wrappers、Control API、Providers 等均为通用能力，其他框架可用对应机制（如 `static-injector`）。

**框架包 API：**

| 文档                                  | 说明                                                                                                      |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| [Vue](zh/adapters/vue/)                | `@piying/view-vue` + `@piying/view-vue2-legacy` 适配包 API：PiyingView/Field/useControlValueAccessor/signalToRef/typedComponent/VueSchemaHandle |
| [React](zh/adapters/react/)            | `@piying/view-react` 适配包 API：Token/useControlValueAccessor/useSignalToRef/useEffectSync/use-*Model/ReactSchemaHandle |
| [Solid](zh/adapters/solid/)            | `@piying/view-solid` 适配包 API：Token/useControlValueAccessor/createSignalConvert/useEffectSync/use-*Model/SolidSchemaHandle |
| [Svelte](zh/adapters/svelte/)          | `@piying/view-svelte` 适配包 API：PiyingView/Field/signalToState/useControlValueAccessor/SvelteSchemaHandle |

| 文档                                                        | 说明                                                                                                                                                                                |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [setComponent](zh/api/setcomponent/)                         | `setComponent` Action 完整 API：字符串引用（通过 fieldGlobalConfig.types）vs 直接传组件类，含内置类型名 key 映射表                                                                  |
| [inputs](zh/api/inputs/)                                     | `actions.inputs` 组件输入属性设置：set（覆盖）、patch（合并）、remove（移除），为字段组件传递 @Input() 值                                                                           |
| [outputs](zh/api/outputs/)                                   | `actions.outputs` 组件输出事件设置：set/patch/remove/patchAsync（动态创建），绑定自定义事件处理器到字段                                                                             |
| [models](zh/api/models/)                                     | `actions.models` 双向绑定模型设置：set/patch/remove/patchAsync/mapAsync，将外部 Signal 绑定到组件 model 输入/输出对                                                                 |
| [events](zh/api/events/)                                     | `actions.events.patchAsync` 原生 DOM 事件声明式绑定，click/keydown 等事件处理                                                                                                       |
| [attributes](zh/api/attributes/)                             | `actions.attributes` HTML 原生属性设置：set/patch/remove/patchAsync，含 attributes vs inputs 区别表、ARIA/data-\* 属性                                                              |
| [CSS class](zh/api/css-class/)                               | `actions.class` CSS Class 设置：top（最外层 wrapper）/ bottom・component（字段组件本身）/ asyncTop・asyncBottom                                                                                           |
| [Layout metadata](zh/api/layout/)                            | `layout` Action：priority 排序权重 + keyPath 查询表达式（'#'/'..'/'@alias'），Intersect + Layout 配合改变字段排列                                                                   |
| [hideWhen / disableWhen / valueChange](zh/api/hide-disable/) | hideWhen/disableWhen/valueChange/outputChange 完整 API 签名、listenFields 数组机制、skipInitValue、生命周期时机说明                                                                 |
| [路径查询](zh/api/path-querying/)                            | KeyPath 类型定义、field.get() 用法：`['..']`(父级开始)/`'#'`(根字段开始)/`'@alias'`(别名定位)、命名冲突处理规则                                                                     |
| [formConfig](zh/api/form-config/)                          | `FieldFormConfig` 字段表：禁用 / 值转换 / 校验 / 更新时机 / 数组与表单组行为                                                     |
| [renderConfig](zh/api/render-config/)                      | `hidden` 配置：字段是否渲染，与 hideWhen 的区别                                                                                  |
| [rawConfig](zh/api/raw-config/)                            | 直接读写字段配置对象（inputs / attributes / props 等），现成 Action 覆盖不到时使用                                                |
| [fieldGlobalConfig](zh/api/global-config/)                   | `fieldGlobalConfig` types/wrappers 全局配置结构 + Actions 合并规则（全局在前）+ Component Type 查找优先级体系                                                                       |
| [Hooks 生命周期](zh/api/hooks/)                              | `actions.hooks` Hook 生命周期管理：merge(依次执行多个)/patch(覆盖同名)/remove/set，Hook 注册与执行顺序详解                                                                          |
| [Props 通用属性](zh/api/props/)                              | `actions.props` 通用属性键配置：set(覆盖)/patch(合并)/patchAsync(异步)/remove(移除)/mapAsync(动态映射)，组件通过 field.props() 访问，vs Attributes/Inputs/Outputs 语义区分        |
| [核心工具函数](zh/api/core-utils/)                            | `combineSignal`/`observableSignal`/`asyncObjectSignal` 等核心信号工具函数                                                                                                         |
| [Wrappers 包装器](zh/api/wrappers/)                          | `actions.wrappers` set/patch/patchAsync/remove/changeAsync + Wrapper 组件编写指南（V1/V2 模板对比、InsertFieldDirective 用法），各框架通用                                                             |
| [AbstractControl](zh/api/control-api/)                           | AbstractControl 及其子类完整参考：获取控件、值 API(updateValue/reset/viewValueChange)、状态 API(disabled/touched/dirty)、FieldArray API(length/controls/removeRestControl) |
| [Providers 服务注入](zh/api/providers/)                      | `actions.providers` 将业务服务注入字段组件 Injector：set(覆盖)/patch(追加)/change(函数式变换)，Angular 用 inject()、其他框架用 static-injector                                          |

### 🅰️ Angular 专属

以下文档仅针对 **Angular 框架**（`@piying/view-angular`）特有的 API 与指令，其他框架无对应机制。

| 文档                                                        | 说明                                                                                                                                                                                |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [API 索引](zh/angular/api/)                                  | `@piying/view-angular` 公开 API 索引，链接到各组件 / 指令 / Token / 工具函数独立文档                                                                                                |
| [组件](zh/angular/components/)                               | PiyingView 根组件、PiyingViewGroup 组容器、PiyingViewGroupBase 基类                                                                                                                 |
| [指令](zh/angular/directives/)                               | InsertFieldDirective、PiyingFieldTemplateDirective、PiyingFieldControlBindDirective、AttributesDirective / EventsDirective                                                            |
| [字段指令配置](zh/angular/field-directives/)              | Angular 指令配置（`actions.directives`）：指令实例稳定（输入跟随变化）、运行时动态 add/clean 指令                                             |
| [Token](zh/angular/tokens/)                                  | PI_VIEW_FIELD_TOKEN、PI_VIEW_FIELD_TEMPLATE_REF_TOKEN、PI_COMPONENT_REF_TOKEN 等注入标记                                                                                             |
| [工具函数](zh/angular/tools/)                                | typedComponent / nfcComponent、convertToField、NgSchemaHandle / AngularFormBuilder、actions.directives                                                                                |
| [BaseControl](zh/angular/base-control/)                       | 实现 ControlValueAccessor 的字段控件基类                                                                                                                                             |

---

## 快速导航

| 主题       | 链接                                            |
| ---------- | ----------------------------------------------- |
| 安装使用   | [5分钟快速上手](zh/getting-started/quick-start/) |
| 两种模式   | [两种使用模式](zh/getting-started/two-modes/)     |
| 理解原理   | [核心概念](zh/getting-started/core-concept/)     |
| 基本字段   | [基础字段定义](zh/scenarios/basic-field/)        |
| 动态控制   | [动态字段控制](zh/scenarios/dynamic-fields/)     |
| 自定义组件 | [setComponent](zh/api/setcomponent/)             |
| 包装器     | [Wrappers 包装器](zh/api/wrappers/)              |
| 全局配置   | [fieldGlobalConfig](zh/api/global-config/)       |

# 核心概念：从 Schema 到 View

本文介绍 Piying-View 的核心工作流程，帮助你理解数据如何从 Valibot Schema 转换为 UI 视图。

## 架构概述

### Schema → Field → Component 三阶段解析链

Piying-View 的运行时流程可抽象为三个阶段的流水线：

```
Valibot Schema ──(解析)──► Field Config ──(渲染)──► Component Tree
```

1. **Schema 定义**：开发者使用 Valibot API 构建结构化的类型定义
2. **Field 解析**：Piying-View 遍历 Schema，将每个节点解析为包含组件属性、事件监听、包装器链、子级字段等配置的 Field 配置对象
3. **Component 渲染**：根据 Field 配置动态实例化对应的 UI 组件，组装为完整的组件树

### 视图与逻辑完全分离

Piying-View 将表单的运行时行为拆分为两个正交维度：

| 维度                    | 职责                                                             |
| ----------------------- | ---------------------------------------------------------------- |
| **结构层（Schema）**    | 定义字段类型、默认值、验证规则、组件映射、包装器配置等静态元数据 |
| **渲染层（Component）** | 根据解析后的 Field 配置，动态渲染对应的 UI 组件树                |

两个维度通过统一的**输入/输出契约**（Attributes / Events / Inputs / Outputs）进行通信。这意味着只要替换实现层的组件，Schema 定义无需任何修改——这正是跨框架兼容的基础。

---

## 转换流程总览

```
Valibot Schema (v.object / v.pipe)
    │
    ▼
CoreSchemaHandle（核心处理句柄）
    │  - 解析所有 Actions（setComponent、inputs、outputs 等）
    │  - 收集元信息（priority、keyPath、alias 等）
    │  - 标记是否为非字段控制（nonFieldControl / NonFieldControlAction）
    ▼
FormBuilder（构建器）
    │  - buildRoot() / buildControl() / #buildField()
    │  - 遍历所有 CoreSchemaHandle，创建 PiResolvedViewFieldConfig
    │  - 有关键路径（keyPath）→ 创建 FieldControl（关联表单控件）
    │  - 无关键路径（nonFieldControl）→ 仅作为普通视图组件渲染
    │  - 递归处理 group / array / logicGroup 的子字段
    │  - 管理注入器、销毁生命周期、作用域映射
    ▼
Resolved Field Tree（已解析字段树）
    │  - FieldControl：单个值控件，关联 Form Control，持有 value/errors/validators
    │  - FieldGroup：对象控件组，包含多个子控件的 record
    │  - FieldArray：数组控件，支持增删改操作
    │  - FieldLogicGroup：intersect/union 逻辑分组
    │  - 普通组件：无表单关联，仅作为视图组件渲染（通过 setComponent 定义）
    ▼
View Component（视图组件）
    │  - Angular: PiyingView / 自定义组件
    │  - Vue / React / Solid / Svelte
    ▼
UI 渲染
```

## 1. Valibot Schema

Piying-View 基于 [Valibot](https://github.com/fabian-hiller/valibot)。Schema 定义了：

- **字段结构**：哪些字段、嵌套关系
- **验证规则**：必填、长度、范围等
- **转换逻辑**：transform / transformAsync
- **视图配置**：通过 `v.pipe()` 链式附加 Actions

```typescript
import * as v from 'valibot';

const schema = v.object({
  name: v.pipe(
    v.string(), // 类型定义
    v.minLength(2), // 验证规则
    setComponent('my-input'), // 视图配置：使用哪个组件渲染
    formConfig({ required: true }), // 表单配置
  ),
});
```

## 2. CoreSchemaHandle（核心处理句柄）

Schema 被传入 `convert()` 函数后，Piying-View 遍历 Schema 树，为每个节点创建 `CoreSchemaHandle`。此句柄负责：

- **解析 Actions**：将 `setComponent`、`inputs`、`outputs`、`attributes`、`wrappers` 等 Action 转换为内部数据
- **收集元信息**：优先级（priority）、路径（keyPath/fullPath）、别名（alias）
- **应用 Hook**：处理 `mergeHooks`、`patchHooks` 等生命周期回调

```typescript
import { convert } from '@piying/view-angular-core';

const handle = convert(schema, {
  injector,
  fieldGlobalConfig: { types, wrappers },
  context: myContext,
});
```

### Action 解析过程

每个 `v.pipe()` 中的 Action 按顺序执行：

```typescript
v.pipe(
  v.string(),
  actions.inputs.set({ placeholder: '请输入' }), // 1. 设置输入属性
  setComponent('my-input'), // 2. 设置组件类型
  actions.outputs.set({ change: handleChange }), // 3. 设置输出事件
);
// → CoreSchemaHandle: {
//     type: 'my-input',
//     inputs: { placeholder: '请输入' },
//     outputs: { change: handleChange },
//     attributes: {},
//     wrappers: []
//   }
```

### 字段控制 vs 非字段控制

CoreSchemaHandle 通过 `nonFieldControl` 标记区分两种用途：

- **有表单控制的字段**（默认）：有关键路径 `keyPath`，会创建 `FieldControl`/`FieldGroup`/`FieldArray`，参与表单值管理和验证
- **无表单控制的字段**（`nonFieldControl = true` 或通过 `NonFieldControlAction` 定义）：没有关键路径，FormBuilder 不会为其创建 Form Control，仅作为普通视图组件渲染

```typescript
// 示例：一个不关联表单的纯展示组件
v.pipe(
  v.string(),
  setComponent('user-avatar'), // 视图组件
  nonFieldControl(), // 标记为非表单字段，不生成 Form Control
);
```

## 3. FormBuilder（构建器）— Schema Handle → Resolved Field

`CoreSchemaHandle` 本身只是原始数据结构，需要通过 **FormBuilder** 转换为 `PiResolvedViewFieldConfig`（已解析字段）。

`FormBuilder` 是整个转换流程的核心引擎：

- **`buildRoot()`**：从根节点开始构建
- **`buildControl()`**：遍历每个 CoreSchemaHandle，执行以下逻辑：
  1. 查找组件定义（通过 `setComponent` 注册的 type）
  2. 创建注入器（为字段提供 DI 能力）
  3. 如果有关键路径 → 调用 `createField()` 创建 Form Control（`FieldControl`/`FieldGroup`/`FieldArray`）
  4. 构建 `PiResolvedViewFieldConfig` 对象，包含：inputs、outputs、attributes、slots、wrappers 等
  5. 如果 `nonFieldControl = true` → 跳过 Form Control 创建，仅保留组件渲染配置
- **`#buildField()`**：递归处理 group/array/logicGroup 的子字段
- **作用域管理**：通过 `PI_FORM_BUILDER_ALIAS_MAP` 管理字段别名映射
- **生命周期管理**：注入器销毁、`allFieldsResolved` hook 批量调用

```typescript
// convert() 函数内部的调用链
const injector = Injector.create({
  providers: [
    { provide: PI_FORM_BUILDER_OPTIONS_TOKEN, useValue: buildOptions },
    builder, // FormBuilder 实例
  ],
});

convertCore(obj, (item) => {
  injector.get(builder).buildRoot({ field: item });
  return buildOptions.resolvedField$();
});
//                          │
//                          ▼
//           buildRoot → buildControl → #buildField（递归）
```

## 4. Field Control Tree & Resolved Field（字段控制树与已解析字段）

`FormBuilder` 输出的是 `PiResolvedViewFieldConfig`，它包含两类产物：

| 类型                | 说明                                                       |
| ------------------- | ---------------------------------------------------------- |
| **FieldControl**    | 单值控件，关联 Form Control，持有 value/errors/validators  |
| **FieldGroup**      | 对象控件组，包含多个子控件的 record                        |
| **FieldArray**      | 数组控件，支持增删改操作                                   |
| **FieldLogicGroup** | intersect/union 逻辑分组                                   |
| **普通组件**        | 无表单关联，仅作为视图组件渲染（通过 `setComponent` 定义） |

每个 Field Control 内部使用 Angular Signal 管理状态（与普通组件并行存在）：

```typescript
class FieldControl<TValue> {
  // 值相关
  value$$: Signal<TValue>;
  originValue$$: Signal<TValue | undefined>;

  // 状态
  errors: any;
  dirty: Signal<boolean>;
  touched: Signal<boolean>;
  pristine: Signal<boolean>;

  // 配置
  formConfig: WritableSignal<FieldFormConfig>;
  renderConfig: WritableSignal<RenderConfig>;

  // 方法
  viewValueChange(value: any): void; // 视图层值变化
  updateValue(value: any): void; // 模型层值变化
}
```

## 5. View Component（视图组件）

Field Control 树构建完成后，Piying-View 根据 `type` 映射动态渲染组件：

### Angular 中的渲染过程

1. **PiyingView** 接收 `schema`、`model`、`options`
2. 调用 `convert()` 构建 Field Control 树
3. **InsertFieldDirective** 遍历 Field Control，为每个控件创建组件实例
4. 使用 `NgComponentOutlet` 动态挂载用户注册的组件

```typescript
// PiyingView 内部流程
@Component({
  selector: 'piying-view',
  template: `
    <ng-container *ngFor="let field of fields">
      <ng-container insertField [insertFieldSlots]="field.slots" [insertFieldAttributes]="field.attributes"></ng-container>
    </ng-container>
  `,
})
export class PiyingView {
  @Input() schema!: BaseSchema;
  @Input() model!: Signal<any>;
  @Input() options!: NgConvertOptions;
  @Output() modelChange = new EventEmitter();
}
```

## 组件分类

Piying-View 将可复用单元划分为三种职责单一的组件类型：

#### 控件（Control）

实现 CVA 契约的原子化 UI 组件，负责单一值的输入/输出与验证。例如 `<input>`、`<select>` 等表单原生的包装器。

#### 包装器（Wrapper）

为非包装器组件附加通用能力的装饰性组件，如标签渲染、验证消息展示、前后缀图标等。多个包装器可自由组合，支持以下操作：

- `actions.wrappers.set` — 全量替换包装器链
- `actions.wrappers.patch` — 增量追加包装器
- `actions.wrappers.remove` — 移除指定包装器

#### 分组（Group）

处理包含子级字段的 Schema 类型（如 `v.object()`、`v.array()`、`v.tuple()` 等）。分组组件可自定义布局与样式，例如卡片容器、标签页、手风琴折叠面板等。Piying-View 为所有框架提供了基础的 `PiyingViewGroupBase` 基类，开发者可按需扩展。

---

### Wrapper 包装机制

每个字段可以包裹多个 Wrapper，渲染时从外到内依次包裹：

```
[Wrapper3] → [Wrapper2] → [Wrapper1] → [Field Component]
```

Wrapper 组件需要注入 `InsertFieldDirective` 来渲染内部字段。

## 6. 数据流

### 模型 → 视图（toView）

```
model value → transformer.toView → view value
```

### 视图 → 模型（toModel）

```
view value → pipe(toModel) → transformer.toModel → originValue$$ → v.transformer → model value
```

### 双向绑定

```typescript
// PiyingView 模板中的双向绑定
<piying-view
  [(model)]="model"
  (modelChange)="onModelChange($event)"
></piying-view>
```

## 下一步

- [Options 配置](options-config.md) — context / fieldGlobalConfig / builder 入门讲解
- [fieldGlobalConfig API](../api/global-config.md) — types/wrappers 优先级体系完整参考
- [基础字段定义](../scenarios/basic-field.md) — 实战：使用 setComponent / formConfig

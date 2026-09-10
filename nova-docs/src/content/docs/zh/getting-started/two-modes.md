---
title: "皮影表单的两种使用模式"
---

> ⚠️ **新手必读**：Piying-View 提供**两种使用模式**，它们都基于 Valibot Schema 和 `convertToField`，但**边界完全不同**。请务必先分清你使用的是哪一种，避免混淆。

| 对比维度     | 模式一：自动模式（全自动渲染）                      | 模式二：手动模式（手动绑定）                                                              |
| ------------ | --------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| **入口**     | 组件 `<piying-view>`                                 | 函数 `convertToField()`                                                                   |
| **渲染方式** | 完全由库根据元数据自动渲染整棵组件树                 | 你拿到 `field` 后**手动**绑定到原生控件 / 手动指定模板插入位置                              |
| **Schema 定义** | 通过 `setComponent` / `fieldGlobalConfig` 等元数据声明组件 | 同一套 Schema，但**渲染位置由你决定**                                                    |
| **典型场景** | 标准表单、快速开发、字段完全跟随 Schema 定义         | 自定义布局、混合原生控件、局部插入字段、精细控制渲染位置                                  |
| **谁调用 convertToField** | 库内部自动调用（你不需要手动调用）             | 你自己调用，并持有返回的 `field`                                                          |

- **模式一**：把决定权完全交给 `<piying-view>` 组件，你只提供 Schema。
- **模式二**：你亲手调用 `convertToField()`，拿到 `field` 后，用指令把它**绑到某个控件**或**插入到某个模板位置**。

---

## 模式一：自动模式（Schema 驱动 / 全元数据渲染）

这是最常用、最省心的模式。你只需要在模板里放一个 `<piying-view>` 组件，传入 `schema`、`model`、`options`，其余全部交给库自动完成。

### 基本用法

```html
<piying-view
  [schema]="schema"
  [(model)]="model"
  [options]="options"
></piying-view>
```

```typescript
import { Component, signal } from '@angular/core';
import { PiyingView, PiyingViewGroup } from '@piying/view-angular';
import * as v from 'valibot';

@Component({
  standalone: true,
  imports: [PiyingView],
  template: `<piying-view [schema]="schema" [(model)]="model" [options]="options"></piying-view>`,
})
export class ExampleComponent {
  model = signal({ name: '', age: 0 });

  options = {
    fieldGlobalConfig: {
      types: {
        string: { type: TextInputComponent },
        number: { type: NumberInputComponent },
        object: { type: PiyingViewGroup },
      },
    },
  };

  schema = v.object({
    name: v.pipe(v.string(), v.minLength(2, '名称至少 2 个字符')),
    age: v.pipe(v.number(), v.minValue(18, '必须年满 18 岁')),
    email: v.optional(v.string()),
  });
}
```

> **关键点**：在自动模式里，你**不需要手动调用 `convertToField`**，直接用 `<piying-view>` 传 `schema` / `model` / `options` 即可。

### 自动模式的特性

- **全元数据驱动**：组件类型、输入、输出、包装器、隐藏/禁用、验证等全部由 Schema 中的 Actions（`setComponent` / `inputs` / `outputs` / `wrappers` / `hideWhen` 等）声明。
- **自动双向绑定**：`[(model)]="model"` 自动同步数据。
- **自动递归**：Group / Array 的子字段自动递归渲染，无需手动写循环。
- **自动套包装器**：`actions.wrappers` 定义的包装器自动包裹每个字段。

### `selectorless` — 无选择器模式

`<piying-view>` 还有一个 `selectorless` 输入（默认 `false`）。开启后组件自身**不渲染任何 DOM**，仅作为转换/状态宿主，方便你完全自定义外层布局，内部字段仍由你通过模板指令（模式二）来安放。

---

## 模式二：手动模式（convertToField + 手动绑定）

当你需要**自定义布局**、**混用原生控件**、或**把字段插入到特定位置**时，使用手动模式。

### 第一步：手动调用 convertToField 拿到 field

```typescript
import { Component, computed, inject, Injector, untracked } from '@angular/core';
import { convertToField } from '@piying/view-angular';
import * as v from 'valibot';

@Component({ ... })
export class CustomFormComponent {
  injector = inject(Injector);

  bind = computed(() =>
    untracked(() =>
      convertToField(this.schema, this.injector, this.options),
    ),
  );

  schema = v.object({
    k1: v.pipe(v.string(), setComponent('input')),
    k2: v.pipe(v.string(), setComponent('input')),
  });
}
```

`convertToField()` 返回一个 `PiResolvedViewFieldConfig`（`field`），它包含整棵字段树：表单控件（`form.control`）、子字段、组件定义、包装器、输入输出等。你拿到 `field` 后，有两种手动绑定方式。

> **关键点**：`convertToField` 只负责**解析**，它本身**不渲染任何东西**。渲染位置完全由你通过指令决定。

### 手动绑定方式 A：绑定原生控件 — `[formControl]` 指令

`PiyingFieldControlBindDirective`，选择器 `[formControl]`：

- 输入：`formControl`（必填，`PiResolvedViewFieldConfig`）、`path`（可选 `KeyPath`）
- 把字段的 `FieldControl` 暴露给原生表单控件，从而获得**值双向绑定、验证、禁用状态**。

> ⚠️ **被绑定的目标必须是 Angular 表单控件（带 `NG_VALUE_ACCESSOR`）**：
> - **基础原生元素**（`<input>`、`<select>`、`<textarea>` 等）：Angular 官方自带这些基础绑定指令，只需导入 `FormsModule`（或 `ReactiveFormsModule`）即可，无需额外定义。
> - **自定义组件**：必须自己实现 `ControlValueAccessor` 并在 providers 中注册 `NG_VALUE_ACCESSOR`，否则 `[formControl]` 无法识别。

```typescript
import { FormsModule } from '@angular/forms';
import { PiyingFieldControlBindDirective } from '@piying/view-angular';

@Component({
  imports: [FormsModule, PiyingFieldControlBindDirective], // 基础元素需导入 FormsModule
  template: `<input type="text" [formControl]="field$$()" />`,
})
export class MyComponent {}
```

自定义组件需自带 CVA 注册：

```typescript
import { Component, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

@Component({
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MyInputComponent),
      multi: true,
    },
  ],
})
export class MyInputComponent implements ControlValueAccessor {
  // 实现 writeValue / registerOnChange / registerOnTouched / setDisabledState
}
```

```html
<!-- 把整个根字段绑定到一个原生 input -->
<input type="text" [formControl]="field$$()" />

<!-- 通过 path 定位到某个子字段 k1 再绑定 -->
<input type="text" [formControl]="field$$()" [path]="['k1']" />
```

`exportAs: 'formControl'` 让你可以用模板引用变量拿到该 `NgControl` 做进一步操作：

```html
<input
  type="text"
  [formControl]="field$$()"
  [path]="['k1']"
  #formControl="formControl"
/>
```

> **注意**：`[formControl]` 绑定的是**叶子控件**（`FieldControl`），所以如果目标字段是 Group/Array，会抛出 `🏷️ fieldControl❗` 错误。要绑定容器内部的某个叶子字段，用 `path` 定位。

### 手动绑定方式 B：插入模板位置 — `[fieldTemplate]` 指令

`PiyingFieldTemplateDirective`，选择器 `[fieldTemplate]`：

- 输入：`fieldTemplate`（必填，`PiResolvedViewFieldConfig`）、`path`（可选 `KeyPath`）
- 把该字段的整棵组件树（组件 + 包装器 + 递归子字段）**像自动模式一样**渲染在当前位置。

```html
<!-- 把整个根字段的组件树渲染到这里 -->
<ng-container [fieldTemplate]="field$$()"></ng-container>

<!-- 渲染某个子字段 k2 的组件树 -->
<ng-container [fieldTemplate]="field$$()" [path]="['k2']"></ng-container>
```

**「模板内是自动的」**：`[fieldTemplate]` 只负责**决定渲染位置**，一旦指定了位置，该字段内部仍然走完整的自动渲染管线——组件的类型来自 Schema 元数据、包装器自动套用、Group 自动递归子字段。也就是说，手动模式只「手动」了**外层位置**，**内层依旧全自动**。

### 两种绑定方式的对比

| 方式 | 指令 | 渲染主体 | 适用场景 |
| ---- | ---- | -------- | -------- |
| **A. 控件绑定** | `[formControl]` | 你写的**原生控件**（`<input>` 等） | 想用原生控件、完全自定义控件外观，但仍要获得值/验证/禁用能力 |
| **B. 模板插入** | `[fieldTemplate]` | 库根据元数据**自动渲染的组件** | 想指定字段的摆放位置，但字段组件本身仍由 Schema 决定 |

---

## 混合模式：两种模式互相嵌套

> 💡 两种模式**并非互斥**，可以在同一页面互相嵌套。核心规律：
> - **自动中用手动**：在自动模式渲染的组件内部，用 `[formControl]` **手动绑定**字段到原生控件。
> - **手动中用自动**：手动拿到 `field` 后，用 `[fieldTemplate]` 绑定一个位置，该字段内部仍**自动渲染**。

### 自动中用手动 — 在自动渲染的组件内手动绑定字段

当你通过 `setComponent` 在 Schema 中注册一个自定义组件（**自动模式**），该组件内部依然可以用 `[formControl]` 手动绑定子字段、或用 `[fieldTemplate]` 摆放其他字段。

组件内通过 `inject(PI_VIEW_FIELD_TOKEN)` 获取当前字段：

```typescript
import { Component, inject } from '@angular/core';
import {
  PiyingFieldControlBindDirective,
  PiyingFieldTemplateDirective,
} from '@piying/view-angular';
import { PI_VIEW_FIELD_TOKEN } from '@piying/view-angular-core';

@Component({
  imports: [PiyingFieldControlBindDirective, PiyingFieldTemplateDirective],
})
export class MyComponent {
  field$$ = inject(PI_VIEW_FIELD_TOKEN); // 当前字段配置
}
```

在 Schema 中把它注册为根组件（自动模式）：

```typescript
import { setComponent } from '@piying/view-angular-core';

const schema = v.pipe(
  v.object({
    k1: v.pipe(v.string(), setComponent('input')),
    k2: v.pipe(v.string(), setComponent('input')),
  }),
  setComponent(MyComponent), // 自动模式：由 Schema 决定渲染该组件
);
```

组件模板内**手动绑定**子字段 `k1`，并用 `[fieldTemplate]` **自动渲染** `k2`：

```html
<input type="text" [formControl]="field$$()!" [path]="['k1']" />
<div class="k2-wrapper">
  <ng-container [fieldTemplate]="field$$()" [path]="['k2']"></ng-container>
</div>
```

这里 `k1` 是「自动中用手动」（在自动渲染的组件里，把字段手动绑到原生 input），`k2` 是「自动中套自动」（用 `fieldTemplate` 摆放位置，内部仍自动渲染）。

### 手动中用自动 — 手动模式下用 fieldTemplate 自动渲染

在手动调用 `convertToField` 拿到 `field` 后，用 `[fieldTemplate]` 绑定一个插入位置，该字段内部（组件、包装器、递归子字段）全部走自动渲染：

```html
<!-- component.html -->
<ng-container [fieldTemplate]="bind()"></ng-container>
```

```typescript
// component.ts
import { convertToField } from '@piying/view-angular';

bind = computed(() =>
  untracked(() => convertToField(this.schema, this.injector, this.options)),
);
```

`fieldTemplate` 的渲染管线和自动模式完全相同——你只负责**位置**，剩下的交给元数据。

### 混合模式速查

| 场景 | 入口 | 内部手段 | 效果 |
| ---- | ---- | -------- | ---- |
| 自动中用手动 | 自动模式组件内 | `[formControl]` 手动绑定字段 | 在自动渲染的组件里自定义原生控件 |
| 自动中套自动 | 自动模式组件内 | `[fieldTemplate]` 摆放字段 | 指定位置，内部自动渲染 |
| 手动中用自动 | `convertToField` 后 | `[fieldTemplate]` 自动渲染 | 手动定位置，内层全自动 |
| 手动中用手动 | `convertToField` 后 | `[formControl]` 绑定原生控件 | 完全手写控件但保留验证/值/禁用 |

---

## 什么时候用哪种模式？

| 场景                                             | 推荐模式 |
| ------------------------------------------------ | -------- |
| 标准表单、快速原型、字段完全跟随 Schema          | **模式一（自动）** |
| 需要完全自定义页面布局、混用原生控件             | **模式二（手动）** |
| 只想把「某个字段」安放到特定位置，其余跟随 Schema | **模式二 B（fieldTemplate）** |
| 只想用原生 `<input>`，但仍要验证/禁用/双向绑定   | **模式二 A（formControl）** |

> 💡 **核心记忆**：
> - 自动模式 = `<piying-view>` 全自动渲染，你**不碰** `convertToField`。
> - 手动模式 = 你**手动**调 `convertToField` 拿 `field`，再用 `[formControl]` 或 `[fieldTemplate]` **决定渲染位置**。
> - **两种模式可以混合**：自动组件内部可用 `[formControl]` 手动绑定（自动中用手动）；手动拿到 `field` 后可用 `[fieldTemplate]` 自动渲染（手动中用自动）。
> - 无论哪种模式，Schema 解析链完全一致，元数据驱动的能力（组件映射、包装器、动态控制、验证）都可用。

## 下一步

- [快速上手](zh/getting-started/quick-start/) — 自动模式完整示例
- [核心概念](zh/getting-started/core-concept/) — Schema → Field → Component 解析链
- [Angular API 参考](zh/angular/api/) — `PiyingView` / `PiyingFieldControlBindDirective` / `PiyingFieldTemplateDirective` / `convertToField`
- [Control API](zh/api/control-api/) — `field.form.control` 控件操作

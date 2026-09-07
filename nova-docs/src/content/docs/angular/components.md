---
title: "组件 — PiyingView / PiyingViewGroup"
---

本文介绍 `@piying/view-angular` 提供的组件：表单根组件 `PiyingView` 与字段组容器组件 `PiyingViewGroup` 及其基类。

## PiyingView

表单根组件，`selector: 'piying-view'`，`standalone`，`OnPush` 变更检测。接收 `schema` / `model` / `options` 并全自动渲染整棵表单。

```html
<piying-view [schema]="schema" [(model)]="model" [options]="options"></piying-view>
```

| 输入/输出        | 类型                                                             | 说明                                |
| ---------------- | ---------------------------------------------------------------- | ----------------------------------- |
| `schema`         | `v.BaseSchema<any, any, any>`（必填）                            | Valibot Schema                      |
| `model`          | `any`（可选）                                                    | 双向绑定的模型数据                  |
| `modelChange`    | `output<any>()`                                                  | 模型变更事件                        |
| `options`        | `NgConvertOptions`（省略 builder/handle，可含 fieldGlobalConfig） | 转换选项（context / builder 等）     |
| `selectorless`   | `boolean`（可选，默认 `false`）                                   | 是否使用无选择器模式                |
| `form$$()`       | `Signal<FieldControl \| FieldGroup \| FieldArray \| undefined>` | 当前根表单控件（computed，可能未定义） |

`form$$` 通过 `resolvedField$()?.form.control` 计算得出，字段尚未解析完成时为 `undefined`。

## PiyingViewGroup

字段组容器组件，`selector: 'piying-view-group'`，继承 `PiyingViewGroupBase`，用于渲染 `object` / `array` / `record` 等容器类型：

```typescript
import { PiyingViewGroup } from '@piying/view-angular';

options = {
  fieldGlobalConfig: {
    types: {
      object: { type: PiyingViewGroup },
      array: { type: PiyingViewGroup },
    },
  },
};
```

它内部持有 `templateRef = viewChild.required('templateRef')`，并标记 `static __version = 2`（用于 V2 组件版本判断）。

## PiyingViewGroupBase

Group 组件的基类，`@Directive()`。标记为指令仅为满足 Angular 依赖注入（在构造时通过 `inject()` 注入字段信号），**实际继承它的通常是组件**（内置的 `PiyingViewGroup` 即 `@Component`）。自定义 Group 时继承它并写自己的组件：

```typescript
import { Component } from '@angular/core';
import { PiyingViewGroupBase } from '@piying/view-angular';

@Component({
  selector: 'my-group',
  standalone: true,
  templateUrl: './my-group.component.html',
})
export class MyGroupComponent extends PiyingViewGroupBase {
  // 继承提供的成员（构造时注入）：
  // field$$()            — 当前字段配置（PI_VIEW_FIELD_TOKEN）
  // props$$()            — 字段 props
  // children$$()         — 子字段列表
  // fixedChildren$$() / restChildren$$() — 数组固定/可变子级
  // fieldTemplateRef     — 字段模板引用（PI_VIEW_FIELD_TEMPLATE_REF_TOKEN，可选）
  // injector             — Injector
}
```

提供的成员（均在构造时注入）：

| 成员                     | 来源                                          | 说明                                    |
| ------------------------ | --------------------------------------------- | --------------------------------------- |
| `field$$`                | `inject(PI_VIEW_FIELD_TOKEN)`                 | 当前字段配置                            |
| `props$$()`              | `computed(() => this.field$$().props())`      | 字段 props                              |
| `children$$()`           | `computed(() => this.field$$().children!())`  | 子字段列表                              |
| `fixedChildren$$()`      | `computed(() => this.field$$().fixedChildren?.() ?? [])` | 数组固定子级（无则 `[]`）   |
| `restChildren$$()`       | `computed(() => this.field$$().restChildren?.() ?? [])` | 数组可变子级（无则 `[]`）    |
| `fieldTemplateRef`       | `inject(PI_VIEW_FIELD_TEMPLATE_REF_TOKEN, { optional: true })` | 字段模板引用（可选）         |
| `injector`               | `inject(Injector)`                            | Injector                              |

## 相关文档

- [指令](angular/directives/) — 字段模板、控件绑定等指令
- [Angular API 参考](angular/api/) — 全部公开 API 索引

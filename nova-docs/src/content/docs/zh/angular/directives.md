---
title: "指令 — 字段模板 / 控件绑定等"
---

本文介绍 `@piying/view-angular` 提供的指令：`InsertFieldDirective`、`PiyingFieldTemplateDirective`、`PiyingFieldControlBindDirective`、`AttributesDirective` / `EventsDirective`。

> ⚠️ 这里是指**库内置暴露给用户**的指令。若你关心如何通过 `actions.directives` 把**自定义指令**附加到字段，请见 [字段指令配置](zh/angular/field-directives/)。

## InsertFieldDirective

Wrapper 的字段插入点指令，`selector: '[insertField]'`，`exportAs: 'insertField'`，继承 `BaseComponent`。在 Wrapper 模板中声明插入位置：

```html
<!-- wrapper.component.html -->
<ng-container insertField></ng-container>
```

```typescript
import { InsertFieldDirective } from '@piying/view-angular';

@Component({
  standalone: true,
  imports: [InsertFieldDirective], // 必须导入
  templateUrl: './wrapper.component.html',
})
export class MyWrapperComponent {}
```

输入：

| 输入                     | 类型                          | 说明                                       |
| ------------------------ | ----------------------------- | ------------------------------------------ |
| `insertFieldSlots`       | `Record<string, TemplateRef>` | 传入的插槽模板，会合并进字段 `slots`       |
| `insertFieldAttributes`  | `Record<string, any>`         | 传入的属性，会合并进字段 `inputs`          |

## PiyingFieldTemplateDirective

渲染字段模板的指令，`selector: '[fieldTemplate]'`，`standalone`，`exportAs: 'fieldTemplate'`，继承 `DynamicCreateDirective`：

```html
<ng-container [fieldTemplate]="field" [path]="keyPath"></ng-container>
```

| 输入            | 类型                             | 说明                         |
| --------------- | -------------------------------- | ---------------------------- |
| `fieldTemplate` | `PiResolvedViewFieldConfig`（必填） | 要渲染的字段配置             |
| `path`          | `KeyPath`（可选）                 | 通过路径定位子字段           |
| `onInit`        | `(field) => void`（可选）         | 字段首次初始化时执行一次的回调 |

`field$$` 根据 `path` 计算：有 `path` 时取 `fieldTemplate().get(keyPath)`，否则取 `fieldTemplate()`。

### onInit

`onInit` 在字段首次完成解析并生成时执行**一次**，之后字段更新不会再触发（内部以 `#initialized` 标记保证只调用一次）：

```html
<ng-container [fieldTemplate]="bind()" [onInit]="onInit()"></ng-container>
```

```typescript
import { PiResolvedViewFieldConfig } from '@piying/view-angular';

onInit = input<(field: PiResolvedViewFieldConfig) => void>((field) => {
  console.log('字段已初始化', field);
});
```

同时提供 `summaryList$$` / `valibotIssueSummary$$` 用于错误摘要（基于 `errorSummary`）。

## PiyingFieldControlBindDirective

将字段绑定为表单控件（`NgControl`），`selector: '[formControl]'`，`standalone`，`exportAs: 'formControl'`，继承 `FieldControlBase`。可在自定义模板中手动绑定字段：

```html
<input [formControl]="bind1()" [path]="['k1']" />
```

```typescript
import { PiyingFieldControlBindDirective } from '@piying/view-angular';
// 在 standalone 组件的 imports 中引入
```

输入：

| 输入          | 类型                                  | 说明                       |
| ------------- | ------------------------------------- | -------------------------- |
| `formControl` | `_PiResolvedCommonViewFieldConfig`（必填） | 要绑定的字段配置           |
| `path`        | `KeyPath`（可选）                     | 通过路径定位子字段         |

`fieldControl$$` 校验：若目标不是叶子控件会抛错 `🏷️ fieldControl❗`。它通过 `formControlBinding` Provider 提供 `NgControl`，模拟动态绑定。

## AttributesDirective / EventsDirective

内部指令，`standalone`，分别将 `actions.attributes` / `actions.events` 绑定到组件 DOM：

- `AttributesDirective`：`selector: '[attributes]'`，输入 `attributes`（必填）、`excludes`（排除的属性键）。变更时用 `Renderer2.setAttribute` 设置、移除已删除属性。
- `EventsDirective`：`selector: '[events]'`，输入 `events`（必填，`Record<string, (event) => any>`）。变更时重新监听事件，销毁时解绑。

```typescript
import { AttributesDirective, EventsDirective } from '@piying/view-angular';
```

## 相关文档

- [组件](zh/angular/components/) — PiyingView / PiyingViewGroup
- [Angular API 参考](zh/angular/api/) — 全部公开 API 索引

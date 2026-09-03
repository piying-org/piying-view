# Angular 包 API 参考（@piying/view-angular）

本文介绍 Angular 包 `@piying/view-angular` 的公开 API，包括组件、指令、Token、工具函数等。

## 组件

### PiyingView

表单根组件，接收 `schema` / `model` / `options`：

```html
<piying-view [schema]="schema" [(model)]="model" [options]="options"></piying-view>
```

| 输入/输出        | 类型                                             | 说明                          |
| ---------------- | ------------------------------------------------ | ----------------------------- |
| `schema`         | `v.BaseSchema`                                   | Valibot Schema                |
| `model`          | `any`                                            | 双向绑定的模型数据            |
| `modelChange`    | `EventEmitter`                                   | 模型变更事件                  |
| `options`        | `NgConvertOptions`                               | 转换选项（context / builder 等） |
| `selectorless`   | `boolean`                                        | 是否使用无选择器模式          |
| `form$$()`       | `Signal<FieldControl \| FieldGroup \| FieldArray>` | 当前根表单控件（computed）  |

### PiyingViewGroup

字段组容器组件，继承 `PiyingViewGroupBase`，用于渲染 `object` / `array` / `record` 等容器类型：

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

### PiyingViewGroupBase

Group 组件的基类，提供字段访问。它标记为 `@Directive()` 仅为满足 Angular 依赖注入（在构造时通过 `inject()` 注入字段信号），**实际继承它的通常是组件**（内置的 `PiyingViewGroup` 即 `@Component`）。自定义 Group 时继承它并写自己的组件：

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

## 指令（Directives）

### InsertFieldDirective

Wrapper 的字段插入点指令，`selector: '[insertField]'`：

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

### PiyingFieldTemplateDirective

渲染字段模板的指令，`selector: '[fieldTemplate]'`：

```html
<ng-container [fieldTemplate]="field" [path]="keyPath"></ng-container>
```

| 输入            | 类型                             | 说明                         |
| --------------- | -------------------------------- | ---------------------------- |
| `fieldTemplate` | `PiResolvedViewFieldConfig`      | 要渲染的字段配置             |
| `path`          | `KeyPath`                        | 可选，通过路径定位子字段     |

### PiyingFieldControlBindDirective

将字段绑定为表单控件（`NgControl`），`selector: '[formControl]'`，`exportAs: 'formControl'`，可在自定义模板中手动绑定字段：

```html
<input [formControl]="bind1()" [path]="['k1']" />
```

```typescript
import { PiyingFieldControlBindDirective } from '@piying/view-angular';
// 在 standalone 组件的 imports 中引入
```

### AttributesDirective / EventsDirective

内部指令，分别将 `actions.attributes` / `actions.events` 绑定到组件 DOM：

```typescript
import { AttributesDirective, EventsDirective } from '@piying/view-angular';
```

## Token

```typescript
import {
  PI_VIEW_FIELD_TOKEN,          // 当前字段配置（Signal）
  PI_VIEW_FIELD_TEMPLATE_REF_TOKEN, // 字段模板引用（TemplateRef）
  PI_COMPONENT_LIST,            // @internal
  PI_COMPONENT_INDEX,           // @internal
  PI_COMPONENT_LIST_LISTEN,     // @internal
} from '@piying/view-angular';
```

自定义字段组件中注入 `PI_VIEW_FIELD_TOKEN` 获取当前字段：

```typescript
import { inject } from '@angular/core';
import { PI_VIEW_FIELD_TOKEN } from '@piying/view-angular';

@Component({ ... })
export class MyInputComponent {
  readonly field = inject(PI_VIEW_FIELD_TOKEN);
}
```

## BaseControl

实现 `ControlValueAccessor` 的基类，用于编写字段控件组件（见 [快速上手](../getting-started/quick-start.md)）：

```typescript
import { BaseControl } from '@piying/view-angular';

@Component({
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => InputComponent),
    multi: true,
  }],
})
export class InputComponent extends BaseControl {}
```

提供的成员：

| 成员                     | 类型                       | 说明                          |
| ------------------------ | -------------------------- | ----------------------------- |
| `value$`                 | `Signal<T>`                | 当前值信号                    |
| `disabled$`              | `Signal<boolean>`          | 禁用状态信号                  |
| `valueChange(value, set?)` | `(value, boolean) => void` | 更新值并触发变更              |
| `touchedChange()`        | `() => void`               | 触发 touched 回调             |
| `valueAndTouchedChange(value)` | `(value) => void`    | 更新值 + 触发 touched         |
| `writeValue` / `registerOnChange` / `registerOnTouched` / `setDisabledState` | CVA 接口 | 由 Angular 表单调用 |

## 工具函数

### typedComponent — 强类型 setComponent

基于组件 `@Input()` / `@Output()` 推导 `inputs` / `outputs` 类型：

```typescript
import { typedComponent } from '@piying/view-angular';
import { MyInputComponent } from './my-input.component';

const typeDefine = typedComponent({
  types: {
    string: { type: MyInputComponent },
  },
});

const schema = v.object({
  name: typeDefine.setComponent('string', (actions) => [
    actions.inputs.patch({ placeholder: '请输入' }),
    actions.outputs.set({ change: handleChange }),
  ]),
});
```

也提供 `nfcComponent` 用于创建非表单控件。

### convertToField — 转换 Schema

将 Valibot Schema 转换为已解析的字段配置：

```typescript
import { convertToField } from '@piying/view-angular';

const field = convertToField(schema, envInjector, options);
```

### NgSchemaHandle / AngularFormBuilder

```typescript
import { NgSchemaHandle, AngularFormBuilder } from '@piying/view-angular';

// NgSchemaHandle — Angular 的 Schema 处理句柄
// AngularFormBuilder — Angular 的 FormBuilder（继承 FormBuilder<NgSchemaHandle>）
```

## actions.directives — Angular 指令 Actions

`actions.directives` 为字段附加 Angular 指令：

```typescript
import { actions } from '@piying/view-angular';
import { MyDirective } from './my.directive';

const schema = v.pipe(
  v.string(),
  actions.directives.set([
    { type: MyDirective, inputs: { color: 'red' } },
  ]),
);

// 可用操作：set / patch / patchAsync / remove
```

## 完整组件导出

`@piying/view-angular` 还导出：

| 导出                          | 说明                            |
| ----------------------------- | ------------------------------- |
| `PiyingFieldTemplateDirective` | 字段模板指令                  |
| `PiyingFieldControlBindDirective` | 字段控件绑定指令          |
| `convertToField`              | Schema 转换函数                |
| `typedComponent`              | 强类型 setComponent            |
| `NgSchemaHandle` / `AngularFormBuilder` | Schema 句柄 / 构建器 |

## 下一步

- [快速上手](../getting-started/quick-start.md) — BaseControl 控件编写
- [Wrappers 包装器](wrappers.md) — InsertFieldDirective 用法
- [框架差异](../getting-started/framework-differences.md) — 各框架 Field Token 对比

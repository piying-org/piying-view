# 快速上手

> **提示**：Actions（`setComponent`、`formConfig` 等）的逻辑定义在所有框架中是相同的。以下各框架的包名和安装命令如下：

| 框架    | 安装命令                                                                        |
| ------- | ------------------------------------------------------------------------------- |
| Angular | `pnpm add valibot @piying/view-angular @piying/view-angular-core @angular/core` |
| Vue     | `pnpm add valibot @piying/view-vue`                                             |
| React   | `pnpm add valibot @piying/view-react`                                           |
| Svelte  | `pnpm add valibot @piying/view-svelte`                                          |
| Solid   | `pnpm add valibot @piying/view-solid`                                           |

> **提示**：本文以 Angular 为例，其他框架的用法类似，仅在组件注册方式上有差异。

## 模板实例

如果您有相关开发经验，可以先拉取相关模板查看源码：

| 框架    | 模板仓库                                                   |
| ------- | ---------------------------------------------------------- |
| Angular | https://github.com/piying-org/piying-view-angular-template |
| Vue     | https://github.com/piying-org/piying-view-vue-template     |
| React   | https://github.com/piying-org/piying-view-react-template   |
| Svelte  | https://github.com/piying-org/piying-view-svelte-template  |
| Solid   | https://github.com/piying-org/piying-view-solid-template   |

## Angular 示例

本指南介绍如何在 Angular 项目中安装并使用 Piying-View 渲染第一个表单。

## 安装

```bash
pnpm add valibot @piying/view-angular @piying/view-angular-core @angular/core
```

## 第一步：定义 Schema

使用 Valibot 定义表单字段的验证 Schema：

```typescript
import * as v from 'valibot';

const formSchema = v.object({
  name: v.pipe(v.string(), v.minLength(2, '名称至少 2 个字符')),
  age: v.pipe(v.number(), v.minValue(18, '必须年满 18 岁')),
  email: v.optional(v.string()),
});
```

## 第二步：注册组件类型

在 Angular 组件中，通过 `fieldGlobalConfig.types` 将类型名映射到具体组件：

```typescript
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PiyingView, BaseControl, PiyingViewGroup } from '@piying/view-angular';

// === 输入框（string / number 通用）===
import { forwardRef } from '@angular/core';
@Component({
  selector: 'app-input',
  standalone: true,
  imports: [FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
  template: `<input [(ngModel)]="value$" [disabled]="disabled$()" />`,
})
class InputComponent extends BaseControl {}

// === 示例组件（注册并渲染表单）===
@Component({
  selector: 'app-example',
  standalone: true,
  imports: [PiyingView],
  template: `<piying-view [schema]="schema" [(model)]="model" [options]="options"></piying-view>`,
})
export class ExampleComponent {
  // 双向绑定的模型数据
  model = signal({ name: '', age: 0 });

  // Options 配置
  options = {
    fieldGlobalConfig: {
      types: {
        string: { type: InputComponent },
        number: { type: InputComponent },
        object: { type: PiyingViewGroup },
      },
    },
  };

  // Schema
  schema = v.object({
    name: v.pipe(v.string(), v.minLength(2, '名称至少 2 个字符')),
    age: v.pipe(v.number(), v.minValue(18, '必须年满 18 岁')),
    email: v.optional(v.string()),
  });
}
```

### 在模板中使用

`<piying-view>` 接收三个属性：

| 属性        | 说明                                 |
| ----------- | ------------------------------------ |
| `schema`    | Valibot Schema，定义字段和验证规则   |
| `[(model)]` | 双向绑定，同步表单数据               |
| `options`   | Options 配置（fieldGlobalConfig 等） |

### 如何编写字段组件

这些本质上就是 **Angular 自定义表单控件**。你只需要注册 `NG_VALUE_ACCESSOR` 实现双向绑定即可。为了简化写法，Piying-View 提供了 `BaseControl` 基类——它已经内置了 `ControlValueAccessor` 的实现

前面示例中 `InputComponent` 的完整写法如下：

```typescript
// input.component.ts
import { Component, forwardRef } from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { BaseControl } from '@piying/view-angular';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
  template: `<input [(ngModel)]="value$" [disabled]="disabled$()" />`,
})
export class InputComponent extends BaseControl {}
```

核心要点：

- **注册 `NG_VALUE_ACCESSOR`** — Angular 表单双向绑定的标准方式，Piying-View 借此与组件通信
- **继承 `BaseControl`** — 它帮你省略了手写 `ControlValueAccessor` 的样板代码，提供 `value$`（当前值）和 `disabled$`（禁用状态）两个信号
- `[(ngModel)]="value$"` — 双向绑定，Piying-View 通过 `NG_VALUE_ACCESSOR` 自动设置值并监听变更
- `disabled$()` — 读取禁用状态

> **提示**：`setComponent`、`formConfig` 等 Actions 的用法详见 [基础字段定义](../scenarios/basic-field.md)；[API: setComponent](../api/setComponent.md) — 包含字符串引用与直接传组件类的完整对比。

运行 `ng serve`，打开浏览器访问页面，你会看到一个包含 name、age、email 三个字段的表单。输入数据时，`model` signal 的值会同步更新；

## 关键点回顾

| 步骤         | 说明                                                      |
| ------------ | --------------------------------------------------------- |
| 定义 Schema  | 使用 Valibot `v.object()` / `v.pipe()` 定义字段和验证规则 |
| 注册类型     | `fieldGlobalConfig.types` 将类型名映射到组件              |
| 传入 options | `schema` + `model` + `options` 三个核心参数               |
| 双向绑定     | `[(model)]="model"` 实现数据同步                          |

## 下一步

- 了解 [核心概念](core-concept.md) — Schema 是如何转换为视图的
- 查看 [基础字段定义](../scenarios/basic-field.md) — setComponent / formConfig 的详细用法
- 了解 [Options 配置](options-config.md) — context / fieldGlobalConfig / builder 入门讲解
- 查看 [fieldGlobalConfig API](../api/global-config.md) — types/wrappers 优先级体系完整参考

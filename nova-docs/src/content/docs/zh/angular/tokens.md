---
title: "Token — 依赖注入标记"
---

本文介绍 `@piying/view-angular` 提供的 `InjectionToken`。这些 Token 用于在字段组件 / 指令 / Wrapper 中注入已解析的字段配置与组件引用。

```typescript
import {
  PI_VIEW_FIELD_TOKEN,               // 当前字段配置（Signal）
  PI_VIEW_FIELD_TEMPLATE_REF_TOKEN,  // 字段模板引用（TemplateRef）
  PI_COMPONENT_REF_TOKEN,            // 字段渲染组件的 ComponentRef
  PI_COMPONENT_LIST,                 // @internal
  PI_COMPONENT_INDEX,                // @internal
  PI_COMPONENT_LIST_LISTEN,          // @internal
  PI_INPUT_OPTIONS_TOKEN,            // 来自 core 的输入选项
  PI_INPUT_SCHEMA_TOKEN,             // 来自 core 的输入 Schema
} from '@piying/view-angular';
```

## PI_VIEW_FIELD_TOKEN

当前字段配置（`Signal<PiResolvedViewFieldConfig>`），是 `@piying/view-angular-core` 的 `PI_VIEW_FIELD_TOKEN` 的重导出。自定义字段组件中注入获取当前字段：

```typescript
import { inject } from '@angular/core';
import { PI_VIEW_FIELD_TOKEN } from '@piying/view-angular';

@Component({ ... })
export class MyInputComponent {
  readonly field = inject(PI_VIEW_FIELD_TOKEN);
}
```

## PI_VIEW_FIELD_TEMPLATE_REF_TOKEN

字段模板引用（`TemplateRef`）。在 `PiyingView` / `PiyingViewGroupBase` 中提供/注入，用于渲染字段模板。

## PI_COMPONENT_REF_TOKEN

字段**实际渲染组件**的 `ComponentRef`。一般用在附加到字段的指令中，用于获取该指令所附加字段的组件引用。

```typescript
import { inject } from '@angular/core';
import { PI_COMPONENT_REF_TOKEN } from '@piying/view-angular';

@Directive({ selector: '[myDirective]', standalone: true })
export class MyDirective {
  injector = inject(Injector);
  componentRef = injector.get(PI_COMPONENT_REF_TOKEN);
  // componentRef.instance — 字段组件实例
}
```

关键特性：

- **即使套了 Wrapper 也能解析到最内层组件**，始终拿到字段真正渲染的那个组件实例
- 常用于指令需要访问字段组件方法 / 属性（如触发组件内部刷新、读取组件状态）的场景

```typescript
const componentRef = directive.injector.get(PI_COMPONENT_REF_TOKEN);
expect(componentRef.instance).toBeInstanceOf(Test1Component); // ✅
```

> 该 Token 的指令配置使用场景见 [字段指令配置](zh/angular/field-directives/)。

## 内部 Token（@internal）

以下 Token 用于库内部传参，一般无需直接使用：

| Token                      | 类型                                    | 说明                     |
| -------------------------- | --------------------------------------- | ------------------------ |
| `PI_COMPONENT_LIST`        | `InjectionToken<DynamicComponentConfig[]>` | 组件配置列表             |
| `PI_COMPONENT_INDEX`       | `InjectionToken<number>`                | 组件索引（从 1 开始）    |
| `PI_COMPONENT_LIST_LISTEN` | `InjectionToken<EventEmitter<...>>`     | 组件列表变更事件         |

## 相关文档

- [组件](zh/angular/components/) — 组件如何注入字段配置
- [指令](zh/angular/directives/) — 指令如何获取组件引用
- [Angular API 参考](zh/angular/api/) — 全部公开 API 索引

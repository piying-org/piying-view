---
title: "Angular 包 API 参考（@piying/view-angular）"
---

本文是 `@piying/view-angular` 公开 API 的**索引**。各组件 / 指令 / Token / 工具函数已拆分为独立文档，点击对应链接查看详细说明。

## 组件

| 文档                       | 说明                                                 |
| -------------------------- | ---------------------------------------------------- |
| [组件](/angular/components/) | `PiyingView` 根组件、`PiyingViewGroup` 组容器、`PiyingViewGroupBase` 基类 |

## 指令

| 文档                       | 说明                                                               |
| -------------------------- | ------------------------------------------------------------------ |
| [指令](/angular/directives/) | `InsertFieldDirective`、`PiyingFieldTemplateDirective`、`PiyingFieldControlBindDirective`、`AttributesDirective` / `EventsDirective` |
| [字段指令配置](/angular/field-directives/) | 通过 `actions.directives` 附加自定义指令的行为（实例稳定、动态增删） |

## Token

| 文档                   | 说明                                                         |
| ---------------------- | ------------------------------------------------------------ |
| [Token](/angular/tokens/) | `PI_VIEW_FIELD_TOKEN`、`PI_VIEW_FIELD_TEMPLATE_REF_TOKEN`、`PI_COMPONENT_REF_TOKEN` 等注入标记 |

## 工具函数

| 文档                     | 说明                                                           |
| ------------------------ | -------------------------------------------------------------- |
| [工具函数](/angular/tools/) | `typedComponent` / `nfcComponent`、`convertToField`、`NgSchemaHandle` / `AngularFormBuilder`、`actions.directives` |

## 基类

| 文档                         | 说明                                   |
| ---------------------------- | -------------------------------------- |
| [BaseControl](/angular/base-control/) | 实现 `ControlValueAccessor` 的字段控件基类 |

## 下一步

- [快速上手](/getting-started/quick-start/) — BaseControl 控件编写
- [Wrappers 包装器](/api/wrappers/) — InsertFieldDirective 用法
- [框架差异](/getting-started/framework-differences/) — 各框架 Field Token 对比

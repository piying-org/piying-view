# 基础字段定义

本文介绍如何使用 `setComponent` 和 `formConfig` 定义基础表单字段。

## 组件类型概览

Piying-View 将可复用单元划分为三种职责单一的组件类型：

### 普通组件

- 应该设计为原子化组件，减少外部依赖
- 可以使用服务获得外部数据
- **没有类型映射**，需要指定 `setComponent`（字符串引用或直接传组件类）
- 对于存在 `ng-content` / `slot` 等投影/插槽的组件，需要重新设计代码

### 控件（Control）

- 在普通组件基础上适配 `ControlValueAccessor` (CVA)
- 支持表单控件的输入/输出、验证、数据转换等逻辑
- **有自动类型映射** — string、number 等基础类型会按 `fieldGlobalConfig.types` 默认映射到已注册的控件

#### CVA / CVAA 机制

| 名称 | 说明 |
|------|------|
| `CVA` (ControlValueAccessor) | 导出自动注册，开发者按固定代码导出即可 |
| `CVAA` (ControlValueAccessorAdapter) | 注册组件，将值和事件绑定到组件上 |

> CVA 来源于 Angular，目前各框架均有不同实现，但原理相同。接口定义：
> ```typescript
> interface ControlValueAccessor {
>   writeValue(obj: any): void;
>   registerOnChange(fn: any): void;
>   registerOnTouched(fn: any): void;
>   setDisabledState?(isDisabled: boolean): void;
> }
> ```

## setComponent — 设置组件类型

`setComponent` 指定字段渲染时使用的组件。支持两种用法：

### 字符串引用（推荐）

通过 `fieldGlobalConfig.types` 中的 key 引用已注册的组件：

```typescript
import * as v from 'valibot';
import { setComponent } from '@piying/view-angular-core';

const schema = v.object({
  name: v.pipe(
    v.string(),
    setComponent('my-input'), // 引用 fieldGlobalConfig.types['my-input']
  ),
});
```

对应的 options 配置：

```typescript
options = {
  fieldGlobalConfig: {
    types: {
      'my-input': { type: MyInputComponent },
    },
  },
};
```

### 直接传组件类

直接将组件构造函数传入：

```typescript
import { setComponent } from '@piying/view-angular-core';

const schema = v.object({
  name: v.pipe(
    v.string(),
    setComponent(MyInputComponent), // 直接引用组件
  ),
});
```

> **提示**：字符串引用方式更灵活，便于在 `fieldGlobalConfig` 中统一管理类型映射。

## formConfig — 表单配置

`formConfig` 设置字段的表单级行为，包括必填、默认值、验证器等。

### 基本用法

```typescript
import * as v from 'valibot';
import { formConfig } from '@piying/view-angular-core';

const schema = v.object({
  name: v.pipe(
    v.string(),
    formConfig({
      required: true, // 标记为必填
      defaultValue: '无名', // 默认值
    }),
  ),
});
```

### FieldFormConfig 完整字段

以下字段分为**手动配置**和**自动赋值**两类：

#### 手动配置

| 字段              | 类型                                          | 说明                            |
| ----------------- | --------------------------------------------- | ------------------------------- |
| `disabled`        | `boolean`                                     | 禁用此字段                      |
| `disabledValue`   | `'reserve' \| 'delete'`                       | 禁用时 value 的处理策略         |
| `emptyValue`      | `any`                                         | group/array 的初始空值          |
| `deletionMode`    | `'shrink' \| 'mark'`                          | 数组删除模式                    |
| `validators`      | `ValidatorFn[]`                               | 自定义同步验证器                |
| `asyncValidators` | `AsyncValidatorFn[]`                          | 自定义异步验证器                |
| `updateOn`        | `'change' \| 'blur' \| 'submit'`              | 更新触发时机                    |
| `transformer`     | `{ toView?, toModel? }`                       | 值转换器                        |

#### 自动赋值（根据 Valibot Schema 推断）

以下字段由 `CoreSchemaHandle` 根据 Valibot schema 类型自动计算，通常无需手动设置：

| 字段              | 来源                                          | 说明                                |
| ----------------- | --------------------------------------------- | ----------------------------------- |
| `required`        | `!this.undefinedable && !this.nullable`       | 非 optional 且非 nullable 时为 true  |
| `undefinedable`   | `v.optional()`                                | 使用 `v.optional()` 时自动为 true    |
| `nullable`        | `v.nullable()`                                | 使用 `v.nullable()` 时自动为 true    |
| `defaultValue`    | Valibot optional 默认值 / null → `null`       | 无显式默认值时，nullable→null, 否则 undefined |
| `groupMode`       | Schema 类型自动推断                           | tuple→'default', loose_tuple→'loose', strict_tuple→'strict', object→'default', array/reset→'reset' |

> **提示**：手动设置会覆盖自动推断的值，用于特殊场景下的覆盖调整。

### defaultValue — 默认值

优先使用 Valibot 内置的默认值机制：

```typescript
// Valibot optional 自带默认值
const schema = v.object({
  name: v.optional(v.string(), '默认名称'), // defaultValue = '默认名称'
});
```

也可以通过 `formConfig` 显式设置：

```typescript
const schema = v.object({
  age: v.pipe(v.number(), formConfig({ defaultValue: 18 })),
});
```

### nullable / undefinedable

控制字段是否接受 null 或 undefined：

```typescript
const schema = v.object({
  // nullable 允许值为 null
  name: v.nullable(v.string()),

  // undefinedable 允许值为 undefined
  email: v.pipe(v.optional(v.string()), formConfig({ undefinedable: true })),
});
```

> **提示**：`v.nullable()` 和 `v.optional()` 会自动设置对应标志，通常无需手动配置。

### required — 必填标记

Valibot 的 `v.string()`（无 optional）默认为必填：

```typescript
const schema = v.object({
  name: v.pipe(v.string()), // required = true（默认）
  email: v.optional(v.string()), // required = false
});
```

手动覆盖：

```typescript
const schema = v.object({
  tags: v.pipe(
    v.array(v.string()),
    formConfig({ required: true }), // 即使 optional，也标记为必填
  ),
});
```

### disabled — 禁用字段

```typescript
const schema = v.object({
  readonlyField: v.pipe(v.string(), formConfig({ disabled: true })),
});
```

结合动态控制（见 [动态字段控制场景](dynamic-fields.md) / [API 参考](../api/hide-disable.md)）：

```typescript
import { disableWhen } from '@piying/view-angular-core';

const schema = v.object({
  isActive: v.boolean(),
  name: v.pipe(
    v.string(),
    disableWhen({
      listen: (fn) => fn({ list: [['..', 'isActive']].pipe(map((item) => !item.list[0][0])) }),
    }),
  ),
});
```

## 自定义验证器

通过 `formConfig.validators` 添加自定义同步验证：

```typescript
import { formConfig } from '@piying/view-angular-core';

const schema = v.object({
  password: v.pipe(
    v.string(),
    formConfig({
      validators: [
        (control) => {
          if (control.value.includes('123')) {
            return { weakPassword: '密码不能包含连续数字' };
          }
          return null;
        },
      ],
    }),
  ),
});
```

## 完整示例

```typescript
import { Component, signal } from '@angular/core';
import { PiyingView } from '@piying/view-angular';
import * as v from 'valibot';
import { formConfig, setComponent } from '@piying/view-angular-core';

@Component({
  standalone: true,
  imports: [PiyingView],
  templateUrl: './basic-field-example.component.html',
})
export class BasicFieldExampleComponent {
  model = signal({
    name: '张三',
    age: 25,
    email: '',
    bio: '',
  });

  options = {
    fieldGlobalConfig: {
      types: {
        string: { type: TextInputComponent },
        number: { type: NumberInputComponent },
      },
    },
  };

  schema = v.object({
    name: v.pipe(v.string(), formConfig({ required: true, defaultValue: '无名' })),
    age: v.pipe(v.number(), formConfig({ defaultValue: 18 })),
    email: v.optional(v.string()), // optional → required = false
    bio: v.pipe(
      v.nullable(v.string()), // nullable → nullable = true
      formConfig({ disabled: true }), // 只读字段
    ),
  });
}
```

## 下一步

- [复杂 Schema 结构](complex-schema.md) — object / array / tuple / record / intersect / union
- [动态字段控制](dynamic-fields.md) — hideWhen / disableWhen / valueChange 实战场景
- [API: formConfig 配置详解](../api/field-config.md)

---
title: "formConfig — 表单配置"
---

```typescript
import * as v from 'valibot';
import { formConfig } from '@piying/view-angular-core';

const schema = v.object({
  // 禁用
  a: v.pipe(v.string(), formConfig({ disabled: true })),
  // 失焦才更新模型
  b: v.pipe(v.string(), formConfig({ updateOn: 'blur' })),
  // 空数组输出 []
  c: v.pipe(v.array(v.string()), formConfig({ emptyValue: [] })),
});
```

## 类型签名

```typescript
interface FieldFormConfig<T = any> {
  // 通用
  disabled?: boolean; // 禁用此字段
  disabledValue?: 'reserve' | 'delete'; // 禁用时 value 的处理策略
  transformer?: FieldTransformerConfig; // 值转换器（toModel / toView）
  pipe?: { toModel?: UnaryFunction<Observable<any>, Observable<T>> }; // 值流管道
  defaultValue?: any; // 默认值
  validators?: ValidatorFn[]; // 同步验证器
  asyncValidators?: AsyncValidatorFn[]; // 异步验证器
  updateOn?: 'change' | 'blur' | 'submit'; // 值更新时机

  // 由 schema 写法推导
  required?: boolean;
  undefinedable?: boolean;
  nullable?: boolean;

  // array / group / logic group
  emptyValue?: any;

  // array
  deletionMode?: 'shrink' | 'mark';

  // group / array
  groupMode?: 'loose' | 'default' | 'strict' | 'reset';
  groupKeySchema?: BaseSchema<any, any, any>;
  groupValueSchema?: BaseSchema<any, any, any>;

  // logic group
  disableOrUpdateActivate?: boolean;
}
```

## 禁用

| 字段            | 说明                                          |
| --------------- | --------------------------------------------- |
| `disabled`      | 禁用此字段                                    |
| `disabledValue` | `'reserve'`（默认）保留值；`'delete'` 不输出值 |

```typescript
formConfig({ disabled: true });
formConfig({ disabled: true, disabledValue: 'delete' });
```

需要跟随其他字段的值动态禁用时，用 [`disableWhen`](zh/api/hide-disable/)。

## 值转换

`transformer` 做同步的值转换，两个方向都可以配置；`pipe` 对值流套一层 RxJS 管道（去抖、过滤等），目前只支持 `toModel` 方向：

```typescript
interface FieldTransformerConfig {
  toModel?: (value: any, control: AbstractControl) => any; // 视图 → 模型
  toView?: (value: any, control: AbstractControl) => any; // 模型 → 视图
}
```

```typescript
import { pipe, debounceTime, filter, map } from 'rxjs';

const schema = v.object({
  // toModel：去空格 + 转大写
  code: v.pipe(
    v.string(),
    formConfig({
      transformer: {
        toModel: (value) => value?.replace(/\s/g, '').toUpperCase() ?? '',
      },
    }),
  ),

  // toView：统一以小写展示
  name: v.pipe(
    v.string(),
    formConfig({
      transformer: {
        toView: (value) => value?.toLowerCase() ?? '',
      },
    }),
  ),
});

// 去抖 + 过滤 + 转换
formConfig({
  pipe: {
    toModel: pipe(
      debounceTime(300),
      filter((v) => v.trim().length > 0),
      map((v) => v.toLowerCase()),
    ),
  },
});
```

## 校验

`validators` / `asyncValidators` 接受验证函数数组，签名如下：

```typescript
interface ValidatorFn {
  (control: AbstractControl):
    ValidationErrorsLegacy | ValidationErrors2[] | undefined;
}

interface AsyncValidatorFn {
  (control: AbstractControl):
    | Promise<ValidationErrorsLegacy | ValidationErrors2[] | undefined>
    | Observable<ValidationErrorsLegacy | ValidationErrors2[] | undefined>
    | Signal<ValidationErrorsLegacy | ValidationErrors2[] | undefined>;
}
```

通过时返回 `undefined`；需要报错时返回两种格式之一：

```typescript
type ValidationErrorsLegacy = { [key: string]: any };

type ValidationErrors2 =
  | { kind: 'valibot'; metadata: [v.BaseIssue<unknown>, ...v.BaseIssue<unknown>[]] }
  | { kind: 'error'; metadata: Error }
  | { kind: 'descendant'; key: string | number; field: AbstractControl; metadata: ValidationCommonError2[] }
  | { kind: string; metadata?: any; message?: string };
```

```typescript
formConfig({
  validators: [
    (control) => {
      if (control.value.length < 6) {
        return [
          {
            kind: 'minLength',
            metadata: { required: 6, actual: control.value.length },
            message: '最少 6 个字符',
          },
        ];
      }
      return undefined;
    },
  ],
  asyncValidators: [
    async (control) => {
      const { available } = await fetch(`/api/check?value=${control.value}`).then((r) => r.json());
      if (!available) {
        return [{ kind: 'duplicate', metadata: { value: control.value }, message: '该值已存在' }];
      }
      return undefined;
    },
  ],
});
```

异步验证器可返回 `Promise` / `Observable` / `Signal`，与同步验证器并行执行，错误自动合并；验证期间控件状态为 `PENDING`。

> 更多校验写法见 [自定义验证](zh/scenarios/custom-validation/)。

## 更新时机

```typescript
formConfig({ updateOn: 'change' }); // 默认，输入即更新
formConfig({ updateOn: 'blur' }); // 失焦更新
formConfig({ updateOn: 'submit' }); // 提交时更新
```

## 数组与表单组

| 字段               | 适用           | 说明                                                          |
| ------------------ | -------------- | ------------------------------------------------------------- |
| `emptyValue`       | array / group / logic group | 聚合结果为空（空数组、空对象、无匹配分支）时，最终值取 `emptyValue` |
| `deletionMode`     | array          | `'shrink'`（默认）删除后缩短；`'mark'` 该位置置 `undefined`，长度不变 |
| `groupMode`        | group / array  | 多余键值 / 超出项的处理方式，见下表                           |
| `groupKeySchema`   | group（record）| 键的类型约束                                                  |
| `groupValueSchema` | group / array  | 值 / 元素的类型约束                                           |

```typescript
formConfig({ emptyValue: [] }); // 数组为空时输出 []
formConfig({ deletionMode: 'mark' });
```

## 逻辑组

`v.intersect()` / `v.union()` 解析出的逻辑组，在 `or` 类型下更新值时会自动激活第一个匹配的分支。设为 `true` 可关闭这一自动激活：

```typescript
formConfig({ disableOrUpdateActivate: true });
```

## 由 schema 写法推导的配置项

下列字段一般**不需要手动设置**，写好 schema 即自动得出；手动写入的值会覆盖推导结果。

| 字段               | 来源                                                              |
| ------------------ | ----------------------------------------------------------------- |
| `undefinedable`    | `v.optional()` / `v.undefinedable()`                              |
| `nullable`         | `v.nullable()` / `v.nullish()`                                    |
| `required`         | `!undefinedable && !nullable`                                     |
| `defaultValue`     | `v.optional(schema, 默认值)` 的第二个参数                         |
| `groupMode`        | `v.object()` → `default`；`v.looseObject()` → `loose`；`v.strictObject()` → `strict`；`v.array()` / rest 部分 → `reset` |
| `groupKeySchema`   | `v.record()` 的键 schema                                          |
| `groupValueSchema` | `v.record()` 的值 schema / `v.array()` 的元素 schema              |

```typescript
const schema = v.object({
  a: v.string(), // required: true
  b: v.optional(v.string()), // required: false, undefinedable: true, groupMode: 'default'
  c: v.optional(v.nullable(v.string()), '默认值'), // nullable: true, defaultValue: '默认值'
  d: v.looseObject({ x: v.string() }), // groupMode: 'loose'
});
```

## 完整示例

```typescript
import * as v from 'valibot';
import { formConfig } from '@piying/view-angular-core';
import { debounceTime, filter, map, pipe } from 'rxjs';

const schema = v.object({
  // 搜索框：去抖 + 过滤 + 转换
  search: v.pipe(
    v.string(),
    formConfig({
      updateOn: 'change',
      pipe: {
        toModel: pipe(
          debounceTime(300),
          filter((v) => v.trim().length > 0),
          map((v) => v.toLowerCase()),
        ),
      },
    }),
  ),

  // 价格：去空格 + 结构化校验
  price: v.pipe(
    v.string(),
    formConfig({
      transformer: {
        toModel: (value) => value?.trim() ?? '',
      },
      validators: [
        (control) => {
          const val = parseFloat(control.value);
          if (val < 0) {
            return [{ kind: 'negative', message: '价格不能为负' }];
          }
          if (val > 999999) {
            return [{ kind: 'tooLarge', message: '价格超出范围' }];
          }
          return undefined;
        },
      ],
    }),
  ),

  // 用户名：同步长度校验 + 异步唯一性校验
  username: v.pipe(
    v.string(),
    formConfig({
      validators: [
        (control) =>
          control.value.length < 3
            ? [{ kind: 'tooShort', message: '用户名至少 3 个字符' }]
            : undefined,
      ],
      asyncValidators: [
        async (control) => {
          const { available } = await fetch(
            `/api/check-username?name=${control.value}`,
          ).then((r) => r.json());
          return available
            ? undefined
            : [
                {
                  kind: 'usernameTaken',
                  metadata: { value: control.value },
                  message: '该用户名已被占用',
                },
              ];
        },
      ],
    }),
  ),

  // 数组：mark 删除模式 + 空值回退
  tags: v.pipe(
    v.array(v.string()),
    formConfig({ deletionMode: 'mark', emptyValue: [] }),
  ),
});
```

## 下一步

- [隐藏与禁用](zh/api/hide-disable/) — hideWhen / disableWhen
- [渲染配置 renderConfig](zh/api/render-config/) — 是否渲染字段
- [全局配置](zh/api/global-config/) — fieldGlobalConfig 的优先级体系
- [值转换与联动](zh/scenarios/value-transform/) — transformer / pipe 实战
- [数组高级用法](zh/scenarios/array-advanced/) — deletionMode / groupMode 实战
- [自定义验证](zh/scenarios/custom-validation/) — 验证器与分组验证

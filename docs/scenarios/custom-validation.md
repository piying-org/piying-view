# 自定义验证

本文介绍如何在 Piying-View 中使用自定义验证器，包括同步和异步验证。

## formConfig.validators — 同步验证器

`validators` 接受一个验证函数数组，每个验证函数接收 `AbstractControl` 并返回错误或 `null`/`undefined`：

```typescript
import * as v from 'valibot';
import { formConfig } from '@piying/view-angular-core';

const schema = v.object({
  password: v.pipe(
    v.string(),
    formConfig({
      validators: [
        (control) => {
          // 新格式：返回结构化错误
          if (control.value.includes('123')) {
            return [
              {
                kind: 'weakPassword',
                message: '密码不能包含连续数字',
              },
            ];
          }
          return undefined;
        },
        (control) => {
          // 也可以使用旧格式（向后兼容）
          if (control.value.length < 8) {
            return { tooShort: '密码至少 8 个字符' };
          }
          return null;
        },
      ],
    }),
  ),
});
```

## 验证器函数签名

```typescript
interface ValidatorFn {
  (control: AbstractControl): 
    | ValidationErrorsLegacy      // 旧格式：{ [key: string]: any }
    | ValidationErrors2[]          // 新格式：结构化错误数组
    | null
    | undefined;
}

// ValidationErrors2 是一个联合类型，包括：
type ValidationErrors2 =
  | { kind: 'valibot'; metadata: v.BaseIssue<unknown>[] }  // Valibot 校验失败
  | { kind: 'error'; metadata: Error }                      // 异常捕获
  | { kind: string; metadata?: any; message?: string };     // 自定义错误
```

**返回值说明：**

- 返回 `null` / `undefined`：验证通过
- 返回 `{ [errorKey]: errorValue }`：旧格式错误（向后兼容）
- 返回 `[{ kind, metadata, message? }]`：新格式错误（推荐）

## formConfig.asyncValidators — 异步验证器

`asyncValidators` 接受异步验证函数数组，用于网络请求等耗时操作，支持 Promise/Observable/Signal：

```typescript
import * as v from 'valibot';
import { formConfig } from '@piying/view-angular-core';

const schema = v.object({
  username: v.pipe(
    v.string(),
    formConfig({
      asyncValidators: [
        async (control) => {
          const response = await fetch(`/api/check-username?name=${control.value}`);
          const available = await response.json();
          if (!available) {
            return [
              {
                kind: 'usernameTaken',
                metadata: { value: control.value },
                message: '用户名已被占用',
              },
            ];
          }
          return undefined;
        },
      ],
    }),
  ),
});
```

## 验证器与 Valibot 验证的组合

Piying-View 同时支持 Valibot 内置验证和自定义验证器，两者**并行执行**：

```typescript
const schema = v.object({
  email: v.pipe(
    v.string(),                                    // Valibot: 类型检查
    v.email('邮箱格式不正确'),                    // Valibot: 邮箱格式验证
    formConfig({
      validators: [
        (control) => {
          if (control.value.endsWith('.test')) {
            return [
              {
                kind: 'testDomain',
                message: '不能使用测试域名',
              },
            ];
          }
          return undefined;
        },
      ],
    }),
  ),
});
```

Valibot 验证和自定义验证器的错误会合并到 `control.errors` 中：

```typescript
// 输入 "test@test.test"
control.errors = [
  { kind: 'valibot', metadata: [...] },           // Valibot 验证失败
  { kind: 'testDomain', message: '...' },        // 自定义验证器失败
];
```

## 常见验证场景

### 字段对比验证

比较两个字段是否相等（如密码确认）：

```typescript
import * as v from 'valibot';
import { formConfig } from '@piying/view-angular-core';

const schema = v.object({
  password: v.pipe(v.string()),
  confirmPassword: v.pipe(
    v.string(),
    formConfig({
      validators: [
        (control) => {
          const parent = control.root;
          if (parent.value?.password !== control.value) {
            return [
              {
                kind: 'passwordsNotMatch',
                message: '两次密码不一致',
              },
            ];
          }
          return undefined;
        },
      ],
    }),
  ),
});
```

### 条件验证（基于其他字段）

```typescript
const schema = v.object({
  hasAddress: v.boolean(),
  address: v.pipe(
    v.string(),
    formConfig({
      validators: [
        (control) => {
          const parent = control.root;
          if (parent.value?.hasAddress && !control.value) {
            return [
              {
                kind: 'conditionalRequired',
                message: '需要填写地址',
              },
            ];
          }
          return undefined;
        },
      ],
    }),
  ),
});
```

### 动态错误信息

```typescript
const schema = v.object({
  age: v.pipe(
    v.number(),
    formConfig({
      validators: [
        (control) => {
          if (control.value < 0) {
            return [
              {
                kind: 'negative',
                metadata: { value: control.value },
                message: `年龄不能为负数（当前: ${control.value}）`,
              },
            ];
          }
          if (control.value > 150) {
            return [
              {
                kind: 'tooOld',
                metadata: { value: control.value },
                message: `年龄不合理（当前: ${control.value}）`,
              },
            ];
          }
          return undefined;
        },
      ],
    }),
  ),
});
```

## 验证错误处理

Piying-View 的 FieldControl 提供标准接口访问验证状态：

| 属性               | 类型                                       | 说明                             |
| ------------------ | ------------------------------------------ | -------------------------------- |
| `control.errors`   | `ValidationErrors2[] \| null`              | 当前所有错误（Valibot + 自定义） |
| `control.valid`    | `boolean`                                  | 是否所有验证都通过               |
| `control.status`   | `'VALID' \| 'INVALID' \| 'PENDING'`        | 验证状态（包括异步验证中）       |
| `control.dirty`    | `boolean`                                  | 值是否被修改过                   |
| `control.touched`  | `boolean`                                  | 是否被聚焦过                     |
| `control.pristine` | `boolean`                                  | 是否未被修改过                   |

**新格式错误访问示例：**

```typescript
if (control.errors) {
  for (const error of control.errors) {
    if (error.kind === 'usernameTaken') {
      console.log('用户名已占用:', error.metadata?.value);
    } else if (error.kind === 'valibot') {
      // Valibot 验证失败
      const issues = error.metadata;
    }
  }
}

## 下一步

- [数组高级用法](array-advanced.md) — deletionMode / groupMode
- [API: FieldFormConfig](../api/field-config.md) — validators / asyncValidators 配置详解
- [综合示例：完整业务表单](complete-example.md)

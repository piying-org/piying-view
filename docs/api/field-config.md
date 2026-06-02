# FieldFormConfig — 字段表单配置

`FieldFormConfig` 是 `formConfig()` Action 接受的配置对象，控制字段的表单级行为。

> 💡 **提示：** 标有 🔄 的字段会从 schema 元数据中**解析提取**而来，不需要手动配置。

## rawConfig — 直接访问字段配置

`rawConfig` 允许在 Schema 管道中直接读取和修改 `FieldConfig`，适用于自定义 Action 封装。它接收一个回调函数，参数为当前字段的配置对象：

```typescript
import { rawConfig } from '@piying/view-angular-core';

const schema = v.pipe(
  v.string(),
  rawConfig((item) => {
    // 直接修改 inputs
    item.inputs = { ...item.inputs, type: 'date' };
    // 直接修改 attributes
    item.attributes.placeholder = '请输入日期';
    return item;
  }),
);
```

> **注意**：`rawConfig` 绕过了类型安全，仅在需要精细控制时使用。大多数场景应使用已有的 Actions（如 `actions.inputs.set`、`actions.attributes.patch`）。

---

## renderConfig — 渲染配置

`renderConfig` 用于在 Schema 级别控制组件的渲染行为：

| 参数     | 说明             |
| -------- | ---------------- |
| `hidden` | 控制组件是否隐藏 |

```typescript
import { renderConfig } from '@piying/view-angular-core';

const schema = v.object({
  field1: v.pipe(v.string(), renderConfig({ hidden: true })),
  field2: v.pipe(v.string(), renderConfig({ hidden: false })),
});
```

> **与 `hideWhen` 的区别**：`renderConfig({ hidden })` 设置静态的隐藏状态；`hideWhen` 通过监听函数实现动态条件隐藏。需要动态控制时优先使用 `hideWhen`。

---

## 类型签名

```typescript
interface FieldFormConfig<T = any> {
  disabled?: boolean; // 禁用此字段
  disabledValue?: DisabledValueStrategy; // 禁用时 value 处理策略
  transformer?: FieldTransformerConfig; // 值转换器（toModel / toView）
  pipe?: { toModel?: UnaryFunction<Observable<any>, Observable<T>> }; // RxJS 管道
  defaultValue?: any; // 🔄 元数据解析 | 默认值（从 schema 的 default 提取）
  validators?: ValidatorFn[]; // 自定义同步验证器
  asyncValidators?: AsyncValidatorFn[]; // 自定义异步验证器
  updateOn?: FormHooks; // 更新触发时机
  required?: boolean; // 🔄 元数据解析 | 标记必填（由 undefinedable/nullable 推导）
  undefinedable?: boolean; // 🔄 元数据解析 | 允许 undefined
  nullable?: boolean; // 🔄 元数据解析 | 允许 null
  emptyValue?: any; // group/array 的空值回退
  deletionMode?: ArrayDeletionMode; // 数组删除模式
  groupMode?: 'loose' | 'default' | 'strict' | 'reset'; // 🔄 元数据解析 | 组验证模式（由 schema 类型提取）
  groupKeySchema?: BaseSchema<any, any, any>; // 🔄 元数据解析 | Record 的键类型约束
  groupValueSchema?: BaseSchema<any, any, any>; // 🔄 元数据解析 | Record/Array 的值类型约束
  disableOrUpdateActivate?: boolean; // LogicGroup or 切换时自动激活
}
```

## 字段详解

### disabled — 禁用

```typescript
formConfig({ disabled: true });
```

禁用后字段不可编辑，值不会被提交。可结合 `disableWhen` 动态控制。

### disabledValue — 禁用值策略

| 值                  | 说明             |
| ------------------- | ---------------- |
| `'reserve'`（默认） | 禁用时保留当前值 |
| `'delete'`          | 禁用时将值删除   |

```typescript
formConfig({ disabledValue: 'delete' });
```

### transformer — 值转换器

```typescript
interface FieldTransformerConfig {
  toView?: (value: any, control: AbstractControl) => any; // 模型 → 视图
  toModel?: (value: any, control: AbstractControl) => any; // 视图 → 模型
}
```

**toModel 示例：**

```typescript
formConfig({
  transformer: {
    toModel: (value: any) => parseFloat(value), // 字符串 "19.99" → 数字 19.99
  },
});
```

**toView 示例：**

```typescript
formConfig({
  transformer: {
    toView: (value: any) => value?.toFixed(2) ?? '0.00',
  },
});
```

### pipe — RxJS Observable 管道

使用 RxJS 操作符对值流进行转换：

```typescript
import { debounceTime, filter, map, pipe } from 'rxjs';

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

**可用的 RxJS 操作符：**

| 操作符                 | 用途 | 示例                      |
| ---------------------- | ---- | ------------------------- |
| `debounceTime`         | 去抖 | `debounceTime(300)`       |
| `distinctUntilChanged` | 去重 | `distinctUntilChanged()`  |
| `filter`               | 过滤 | `filter((v) => v !== '')` |
| `map`                  | 转换 | `map((v) => v.trim())`    |
| `sampleTime`           | 采样 | `sampleTime(1000)`        |

### defaultValue — 默认值 🔄 元数据解析

此字段会从 schema 的 `v.default()` 元数据中**提取**而来。你可以通过 `formConfig()` 覆盖。

```typescript
formConfig({ defaultValue: '默认名称' });
```


### validators — 同步验证器

```typescript
import { formConfig, ValidatorFn } from '@piying/view-angular-core';

formConfig({
  validators: [
    (control) => {
      // 方式1：返回 ValidationErrorsLegacy（向后兼容）
      if (!control.value.match(/^[A-Z]/)) {
        return { uppercaseStart: '必须以大写字母开头' };
      }
      return null;
    },
    (control) => {
      // 方式2：返回 ValidationErrors2[]（新格式）
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
});
```

**验证函数签名：**

```typescript
interface ValidatorFn {
  (control: AbstractControl):
    | ValidationErrorsLegacy // 旧格式：{ [key: string]: any }
    | ValidationErrors2[] // 新格式：具结构化错误数组
    | undefined;
}

// ValidationErrors2 是一个联合类型，包括：
type ValidationErrors2 =
  | { kind: 'valibot'; metadata: v.BaseIssue<unknown>[] } // Valibot 校验失败
  | { kind: 'error'; metadata: Error } // 异常捕获
  | { kind: 'descendant'; key: string | number; field: AbstractControl; metadata: ValidationErrors2[] } // 子字段错误
  | { kind: string; metadata?: any; message?: string }; // 自定义错误
```

**返回值说明：**

- 返回 `null` / `undefined`：验证通过
- 返回 `{ [errorKey]: errorValue }`：旧格式错误（向后兼容）
- 返回 `[{ kind, metadata, message? }]`：新格式错误（推荐）

### asyncValidators — 异步验证器

异步验证器用于需要网络请求、数据库查询等耗时操作的场景。可返回 Promise、Observable 或 Signal：

```typescript
import { formConfig, AsyncValidatorFn } from '@piying/view-angular-core';
import { Observable } from 'rxjs';

formConfig({
  asyncValidators: [
    // 方式1：Promise + 旧格式
    async (control) => {
      const resp = await fetch(`/api/check?value=${control.value}`);
      const available = await resp.json();
      if (!available) {
        return { usernameTaken: '该用户名已被占用' };
      }
      return null;
    },

    // 方式2：Promise + 新格式
    async (control) => {
      const isUnique = await checkUniqueness(control.value);
      if (!isUnique) {
        return [
          {
            kind: 'duplicate',
            metadata: { value: control.value },
            message: '该值已存在，请选择其他值',
          },
        ];
      }
      return undefined;
    },

    // 方式3：Observable
    (control) => {
      return checkValue$(control.value).pipe(
        map((isValid) => {
          if (!isValid) {
            return [{ kind: 'invalid', message: '校验失败' }];
          }
          return undefined;
        }),
      );
    },

    // 方式4：Signal
    (control) => {
      return computed(() => {
        const result = someSignal();
        if (!result.valid) {
          return [{ kind: 'signaError', metadata: result.error }];
        }
        return undefined;
      });
    },
  ],
});
```

**验证函数签名：**

```typescript
interface AsyncValidatorFn {
  (control: AbstractControl): Promise<ValidationErrorsLegacy | ValidationErrors2[] | undefined> | Observable<ValidationErrorsLegacy | ValidationErrors2[] | undefined> | Signal<ValidationErrorsLegacy | ValidationErrors2[] | undefined>;
}
```

**关键特点：**

- 支持 Promise、Observable、Signal 三种异步返回方式
- 返回值与同步验证器相同（旧格式或新格式）
- 异步验证期间，`control.status` 会变为 `PENDING`
- 可与同步验证器并行执行，错误会自动合并

### updateOn — 更新时机

```typescript
import { FormHooks } from '@piying/view-angular-core';

// change: 输入时实时更新（默认）
formConfig({ updateOn: 'change' });

// blur: 失去焦点时更新
formConfig({ updateOn: 'blur' });

// submit: 表单提交时更新
formConfig({ updateOn: 'submit' });
```

### required / undefinedable / nullable — 🔄 元数据解析

这三个字段会从 schema 的 `optional()` 和 `nullable()` 元数据中**提取**而来，一般**不需要手动设置**。

| 配置            | 说明           | 元数据来源                            |
| --------------- | -------------- | ------------------------------------- |
| `required`      | 标记必填       | 由 `!undefinedable && !nullable` 推导 |
| `undefinedable` | 允许 undefined | 来自 schema 的 `optional()`           |
| `nullable`      | 允许 null      | 来自 schema 的 `nullable()`           |

```typescript
// ❌ 通常不需要手动设置，会自动推导
// formConfig({ required: true, undefinedable: true, nullable: false });

// ✅ 在 schema 中定义，自动转换为 formConfig
const schema = v.object({
  field1: v.string(), // required=true, undefinedable=false, nullable=false
  field2: v.optional(v.string()), // required=false, undefinedable=true, nullable=false
  field3: v.nullable(v.string()), // required=true, undefinedable=false, nullable=true
  field4: v.optional(v.nullable(v.string())), // required=false, undefinedable=true, nullable=true
});
```

**提取机制：**

```typescript
override beforeSchemaType(schema: Schema): void {
  this.formConfig.required = !this.undefinedable && !this.nullable;
  this.formConfig.undefinedable = this.undefinedable;
  this.formConfig.nullable = this.nullable;
}
```

### emptyValue — 空值回退

验证失败时回退到 `emptyValue`：

```typescript
formConfig({ emptyValue: {} }); // Group
formConfig({ emptyValue: [] }); // Array
```

### deletionMode — 数组删除模式

| 值                 | 说明                                   |
| ------------------ | -------------------------------------- |
| `'shrink'`（默认） | 删除后数组长度缩短                     |
| `'mark'`           | 删除后该位置设为 `undefined`，长度不变 |

```typescript
formConfig({ deletionMode: 'mark' });
```

### groupMode — 组验证模式 🔄 元数据解析

此字段会从 schema 的类型信息中**提取**。
| 值 | 说明 | schema 元数据来源 |
| ----------- | ---------------------------- | ---------------------------------------- |
| `'default'` | 标准验证：所有子字段通过 | `v.object()` / `v.tuple()` |
| `'loose'` | 宽松验证：部分失败不影响整体 | `v.loose_object()` / `v.loose_tuple()` |
| `'strict'` | 严格验证：额外检查结构完整性 | `v.strict_object()` / `v.strict_tuple()` |
| `'reset'` | 重置模式：值变更时重置验证 | `v.array()` / `v.rest()` |

```typescript
// ✅ 元数据自动提取示例
const schema = v.object({
  field: v.string(),
  // 此 object 会解析出 groupMode: 'default'
});

const schema2 = v.loose_object({
  field: v.string(),
  // 此 loose_object 会解析出 groupMode: 'loose'
});

const schema3 = v.array(v.string());
// 此 array 会解析出 groupMode: 'reset'

// ❌ 手动覆盖（不推荐，除非有特殊需求）
formConfig({ groupMode: 'loose' });
```

**提取机制：**

```typescript
override objectDefault(schema: ObjectSchema): void {
  if (schema.type === 'object') {
    this.formConfig.groupMode = 'default';
  } else if (schema.type === 'loose_object') {
    this.formConfig.groupMode = 'loose';
  } else if (schema.type === 'strict_object') {
    this.formConfig.groupMode = 'strict';
  }
}

override arraySchema(schema: ArraySchema): void {
  this.formConfig.groupMode = 'reset';
}
```

### groupKeySchema / groupValueSchema — 🔄 元数据解析

这两个字段会从 `v.record()` 和 `v.array()` 的元数据中提取。

**提取来源：**

- `groupKeySchema` - 从 `v.record()` 的键 schema 提取
- `groupValueSchema` - 从 `v.record()` 的值 schema 或 `v.array()` 的元素 schema 提取

```typescript
// ✅ 元数据提取示例
const schema = v.object({
  // Record 类型 - 会解析出 groupKeySchema 和 groupValueSchema
  metadata: v.record(
    v.picklist(['name', 'email', 'phone']), // ← 提取为 groupKeySchema
    v.string(), // ← 提取为 groupValueSchema
  ),

  // Array 类型 - 会解析出 groupValueSchema
  tags: v.array(v.string()), // ← 提取 groupValueSchema: v.string()
});

// ❌ 手动覆盖（不推荐）
formConfig({
  groupKeySchema: v.picklist(['name', 'email', 'phone']),
  groupValueSchema: v.pipe(v.string(), v.minLength(1)),
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

  // 价格：字符串 ↔ 数字转换 + 新格式验证
  price: v.pipe(
    v.string(),
    formConfig({
      transformer: {
        toModel: (value: any) => parseFloat(value),
        toView: (value: any) => value?.toFixed(2) ?? '0.00',
      },
      validators: [
        // 新格式：返回结构化错误数组
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

  // 必填字段
  name: v.pipe(v.string(), formConfig({ required: true, defaultValue: '' })),

  // 用户名：异步验证 + 同步验证
  username: v.pipe(
    v.string(),
    formConfig({
      validators: [
        (control) => {
          // 同步验证：长度检查
          if (control.value.length < 3) {
            return [{ kind: 'tooShort', message: '用户名至少 3 个字符' }];
          }
          return undefined;
        },
      ],
      asyncValidators: [
        // 异步验证：检查唯一性
        async (control) => {
          const resp = await fetch(`/api/check-username?name=${control.value}`);
          const { available } = await resp.json();
          if (!available) {
            return [
              {
                kind: 'usernameTaken',
                metadata: { value: control.value },
                message: '该用户名已被占用',
              },
            ];
          }
          return undefined;
        },
      ],
    }),
  ),

  // 数组 + mark 删除模式
  tags: v.pipe(v.array(v.string()), formConfig({ deletionMode: 'mark', emptyValue: [] })),

  // Record + 宽松验证
  metadata: v.pipe(v.record(v.string(), v.string()), formConfig({ groupMode: 'loose' })),
});
```

## 下一步

- [API: global-config](global-config.md) — fieldGlobalConfig 全局配置优先级体系
- [场景: 值转换与联动](../scenarios/value-transform.md) — transformer / pipe 实战
- [场景: 数组高级用法](../scenarios/array-advanced.md) — deletionMode / groupMode 实战

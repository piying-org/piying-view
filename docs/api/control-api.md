# Control API — 表单控件完整参考

Piying-View 的 Control 系统是整个表单的核心，负责值管理、状态跟踪、验证和子字段导航。Control 是在 Schema 解析/转换过程中由库自动生成的。

---

## ⚠️ 重要：Control 的生命周期

```
Schema 定义 → convert() / FormBuilder → Control 自动创建 → field.form.control
```

- Control 在解析时自动生成
- 通过 `field.form.control`（根控件）或 `field.form.root` 访问
- 控件通过 `field.get(path)` 查询其他控件

---

## 获取 Control 实例

### Control 的自动创建

传入组件后,会自动实例化,并且可以在actions中获取到

```typescript
// 模板中：传递 schema，框架自动生成 Control
<piying-view [schema]="schema" [(model)]="formData"></piying-view>
```

### 在 Hooks 中访问 Control

通过 `actions.hooks` 注册的回调函数中，可以直接从传入的 `field` 参数获取 Control：

```typescript
import * as v from 'valibot';
import { actions, formConfig } from '@piying/view-angular-core';

const schema = v.object({
  name: v.pipe(
    v.string(),
    actions.hooks.merge({
      fieldResolved(field) {
        // field.form.control — 当前字段的 Control（FieldControl）
        console.log(field.form.control?.value);
      },
      allFieldsResolved(field) {
        // 所有字段解析完成后，可以访问根控件
        const rootCtrl = field.form.root;
        const nameCtrl = field.form.control;
        // 通过路径获取子控件
        const child = field.get(['childPath']);
      },
    }),
  ),
});
```

### 在自定义组件中访问 Control

在由 Piying-View 渲染的自定义组件内，注入 `PI_VIEW_FIELD_TOKEN` 获取当前字段：

```typescript
import { inject } from '@angular/core';
import { PI_VIEW_FIELD_TOKEN, BaseControl } from '@piying/view-angular';

@Component({
  /* ... */
})
export class MyInputComponent extends BaseControl {
  // field 是 signal，调用后返回 PiResolvedViewFieldConfig
  readonly field = inject(PI_VIEW_FIELD_TOKEN);

  ngOnInit() {
    const f = this.field(); // 当前字段配置
    console.log(f.form.control); // Control 实例
    console.log(f.parent); // 父字段
    console.log(f.children!()); // 子字段列表（Group）
  }
}
```

### 访问模式速查

| 场景                     | 访问方式                                     | 说明                           |
| ------------------------ | -------------------------------------------- | ------------------------------ |
| Hooks 中当前字段 Control | `field.form.control`                         | 当前字段的 Control             |
| Hooks 中根控件           | `field.form.root`                            | 整个表单的根 Control           |
| 自定义组件中             | `inject(PI_VIEW_FIELD_TOKEN)().form.control` | 注入 field 后访问 control      |
| 子控件（通过 path）      | `root.get('child')` / `root.get(['a', 'b'])` | 返回 `AbstractControl \| null` |
| 父字段                   | `field.parent` (Field 层面)                  | 当前字段的父级 Field           |

### 类型体系

```typescript
// 继承关系
AbstractControl<TValue>          // 抽象基类
├── FieldControl<TValue>         // 叶子节点控件（对应基础类型）
├── FieldGroupbase               // 组基类
│   ├── FieldGroup               // 对象组
│   └── FieldArray               // 数组控件
│       └── FieldLogicGroup      // 逻辑组
```

---

## 值 API

### 读取值

| 属性                | 类型                          | 说明                                              |
| ------------------- | ----------------------------- | ------------------------------------------------- |
| `control.value`     | `TValue`                      | 经过 schema 验证/转换后的当前值（getter）         |
| `control.value$$()` | `Signal<TValue \| undefined>` | computed signal，包含前值追踪（computedWithPrev） |

```typescript
// 读取当前值
console.log(control.value); // 示例: "hello"

// 通过 signal 读取（响应式）
const val = control.value$$(); // Signal 调用方式
```

### 写入值

#### `updateValue(value, force?)` — 更新控件值

以编程方式设置控件值，触发验证和转换流程。

```typescript
import { firstValueFrom } from 'rxjs';

// 基础用法
control.updateValue('new value');

// 强制更新（跳过 pristine && untouched 检查）
control.updateValue('force update', true);

// 监听值变更
control.valueChanges.subscribe((val) => {
  console.log('value changed to:', val);
});

// async/await 模式
let result = await firstValueFrom(control.valueChanges);
control.updateValue('111');
result = await firstValueFrom(control.valueChanges.pipe(skip(1)));
console.log(result); // '111'
```

**更新流程：**

1. 触发 `updateValue` → 设置 `modelValue$` signal
2. 通过 `transformer.toView` 转换（如果配置）
3. 通过 Valibot schema 验证/转换 → 更新 `value$$`
4. 触发 `valueChanges` observable

#### `reset(formState?)` — 重置控件

将控件恢复到初始状态，标记为 pristine + untouched。

```typescript
// 重置到给定值
control.reset(['v3', 'v4']);

// 重置到默认值（defaultValue / schema default）
control.reset();

// 适用于 FieldControl
control.reset('default string');

// 适用于 FieldGroup
groupControl.reset({ name: '', age: 0 });

// 验证后 reset
control.viewValueChange('1');
console.log(control.errors); // 有错误
control.reset();
console.log(control.errors); // undefined（已清除）
```

### 视图值变更

#### `viewValueChange(value)` — 视图触发值变更

当视图组件发生用户交互时调用，值会经过 `pipe.toModel` → `transformer.toModel` 流程。

```typescript
// 视图中用户输入时调用
control.viewValueChange('user input');

// 标记为 dirty
console.log(control.dirty); // true
console.log(control.pristine); // false

// 配合 pipe 使用（debounce/filter/map）
// 见 FieldFormConfig 文档中的 pipe 部分
```

---

## 状态 API

### 禁用/启用

| 属性/方法                 | 类型               | 说明                         |
| ------------------------- | ------------------ | ---------------------------- |
| `control.disabled`        | `boolean` (getter) | 最终禁用状态（考虑父级）     |
| `control.enabled`         | `boolean` (getter) | 等效于 `!disabled`           |
| `control.selfDisabled$()` | `Signal<boolean>`  | **自身**禁用状态，不考虑父级 |
| `control.disabled$$()`    | `Signal<boolean>`  | 最终禁用状态(自身 或父级)    |
| `control.enabled$$()`     | `Signal<boolean>`  | 最终启用状态                 |
| `control.disable()`       | `() => void`       | 禁用此控件                   |
| `control.enable()`        | `() => void`       | 启用此控件                   |

```typescript
// 查看禁用状态
if (control.disabled) {
  console.log('当前被禁用');
}

// 动态禁用
control.disable();

// 通过 config$ 精确控制
control.config$.update((c) => ({ ...c, disabled: true }));

// 父级禁用会传导到子级
parentControl.disable();
console.log(childControl.disabled); // true（被父级禁用）
console.log(childControl.selfDisabled$()); // false（自身未禁用）
```

**`disabledValue` 策略影响：**

- `'reserve'`（默认）：禁用时保留当前值
- `'delete'`：禁用时移除该字段值

### Touched / Untouched

| 属性/方法                      | 类型               | 说明                              |
| ------------------------------ | ------------------ | --------------------------------- |
| `control.touched`              | `boolean` (getter) | 是否已触碰（调用 untracked 读取） |
| `control.untouched`            | `boolean` (getter) | 是否未触碰                        |
| `control.touched$$()`          | `Signal<boolean>`  | computed，子级触碰会冒泡到父级    |
| `control.selfTouched$()`       | `Signal<boolean>`  | 自身 touched 状态（signal）       |
| `control.markAsTouched()`      | `() => void`       | 标记为已触碰                      |
| `control.markAsUntouched()`    | `() => void`       | 标记为未触碰                      |
| `control.markAllAsTouched()`   | `() => void`       | 级联标记自身及所有子级            |
| `control.markAllAsUntouched()` | `() => void`       | 级联清除所有 touched 状态         |

```typescript
// 用户与字段交互后
control.markAsTouched();

// 检查表单整体 touched 状态（包含子级）
if (groupControl.touched) {
  // 任一子级被触碰，父级也会标记为 touched
}
```

### Dirty / Pristine

| 属性/方法                     | 类型               | 说明                        |
| ----------------------------- | ------------------ | --------------------------- |
| `control.dirty`               | `boolean` (getter) | 值是否被修改过              |
| `control.pristine`            | `boolean` (getter) | 值是否为原始状态（未修改）  |
| `control.dirty$$()`           | `Signal<boolean>`  | computed，子级 dirty 会冒泡 |
| `control.selfDirty$()`        | `Signal<boolean>`  | 自身 dirty 状态（signal）   |
| `control.markAsDirty()`       | `() => void`       | 标记为已修改                |
| `control.markAsPristine()`    | `() => void`       | 标记为未修改                |
| `control.markAllAsDirty()`    | `() => void`       | 级联标记所有子级            |
| `control.markAllAsPristine()` | `() => void`       | 级联清除所有 dirty 状态     |

```typescript
// viewValueChange 会自动标记为 dirty
control.viewValueChange('new value');
console.log(control.dirty); // true
console.log(control.pristine); // false

// reset 会自动标记为 pristine + untouched
control.reset();
console.log(control.pristine); // true
```

## 验证 API

### 状态检查

| 属性              | 类型               | 说明                 |
| ----------------- | ------------------ | -------------------- |
| `control.valid`   | `boolean` (getter) | 是否通过所有验证     |
| `control.invalid` | `boolean` (getter) | 是否未通过验证       |
| `control.pending` | `boolean` (getter) | 是否正在进行异步验证 |

```typescript
if (control.valid) {
  console.log('表单有效');
} else if (control.invalid) {
  console.log('表单无效');
} else if (control.pending) {
  console.log('正在验证中...');
}
```

### 错误详情

| 属性                       | 类型                                       | 说明                                     |
| -------------------------- | ------------------------------------------ | ---------------------------------------- |
| `control.errors`           | `ValidationErrors2[] \| undefined`         | 当前错误列表（pending 时返回 undefined） |
| `control.status$$()`       | `Signal<VALID_STATUS>`                     | 'VALID' \| 'INVALID' \| 'PENDING'        |
| `control.rawError$$()`     | `Signal<rawError \| PENDING \| undefined>` | 同步+异步合并后的原始错误（含 pending）  |
| `control.syncError$()`     | `linkedSignal`                             | 仅同步验证错误                           |
| `control.asyncError$$()`   | `Signal`                                   | 仅异步验证错误                           |
| `control.valueNoError$$()` | `computed`                                 | 无错误时为 true                          |

```typescript
// 查看当前错误
if (control.errors) {
  control.errors.forEach((err) => {
    if (err.kind === 'valibot') {
      console.log('Valibot 验证问题:', err.metadata);
    } else if (err.kind === 'descendant') {
      console.log(`子字段 ${err.key} 错误:`, err.metadata);
    } else {
      console.log(`${err.kind}:`, err.message ?? err.metadata);
    }
  });
}

// status$$ 返回字符串常量
const status = control.status$$(); // 'VALID' | 'INVALID' | 'PENDING'
```

**错误类型系统：**

```typescript
type ValidationErrors2 =
  | ValidationValibotError2 // schema 验证失败 { kind: 'valibot', metadata: BaseIssue[] }
  | ValidationErrorError2 // 自定义验证器抛出异常 { kind: 'error', metadata: Error }
  | ValidationDescendantError2 // 子字段错误 { kind: 'descendant', key: string, field: AbstractControl, metadata: ValidationCommonError2[] }
  | ValidationCommonError2; // 自定义验证器返回 { kind: string, metadata?, message? }
```

### 验证器配置

通过 `formConfig` 注册验证器：

```typescript
import { formConfig, ValidatorFn, AsyncValidatorFn } from '@piying/view-angular-core';

// 同步验证器
v.pipe(
  v.string(),
  formConfig({
    validators: [
      (control) => {
        if (!control.value?.match(/^[A-Z]/)) {
          return { uppercaseStart: '必须以大写字母开头' };
        }
        return undefined; // 通过验证返回 undefined/null
      },
    ],
  }),
);

// 异步验证器（支持 Promise / Observable / Signal）
v.pipe(
  v.string(),
  formConfig({
    asyncValidators: [
      async (control) => {
        const exists = await checkUsername(control.value);
        return exists ? { duplicate: '用户名已存在' } : undefined;
      },
    ],
  }),
);
```

---

## 变更监听 Observable

### valueChanges

每次 `value$$()` 变化时发射新值（Angular signal → RxJS 转换）。

```typescript
import { firstValueFrom, skip } from 'rxjs';

// subscribe 模式
control.valueChanges.subscribe((val) => {
  console.log('值变为:', val);
});

// async/await 模式（测试常用）
let result = await firstValueFrom(control.valueChanges);
console.log(result); // undefined（初始值）

control.updateValue('111');
result = await firstValueFrom(control.valueChanges.pipe(skip(1)));
console.log(result); // '111'
```

### statusChanges

每次验证状态变化时发射 VALID / INVALID / PENDING。

```typescript
control.statusChanges.subscribe((status) => {
  switch (status) {
    case 'VALID':
      console.log('✅ 验证通过');
      break;
    case 'INVALID':
      console.log('❌ 验证失败');
      break;
    case 'PENDING':
      console.log('⏳ 验证中...');
      break;
  }
});
```

---

## 导航 API

| 属性                | 类型                           | 说明                          |
| ------------------- | ------------------------------ | ----------------------------- |
| `control.root`      | `AbstractControl` (getter)     | 根控件                        |
| `control.parent`    | `AbstractControl \| undefined` | 父控件                        |
| `control.valuePath` | `(string \| number)[]`         | 值路径（跳过 Logic 类型子级） |
| `control.fieldPath` | `(string \| number)[]`         | 完整字段路径（包含所有子级）  |

```typescript
// 获取根控件
const rootCtrl = control.root;

// 向上导航到父级
if (control.parent) {
  console.log(control.parent.value);
}

// 路径追踪
console.log(control.fieldPath); // ['users', 0, 'address', 'city']
```

### FieldArray 特有 API

| 属性/方法                      | 类型                        | 说明                        |
| ------------------------------ | --------------------------- | --------------------------- |
| `array.length`                 | `number`                    | 数组当前长度                |
| `array.controls`               | `AbstractControl[]`         | 所有子控件（fixed + reset） |
| `array.fixedControls$()`       | `Signal<AbstractControl[]>` | 固定子控件                  |
| `array.resetControls$()`       | `Signal<AbstractControl[]>` | 待重置/新增的子控件         |
| `array.clear()`                | `() => void`                | 清除所有 reset 状态的控制项 |
| `array.removeRestControl(key)` | `(key: number) => void`     | 移除指定 rest 控制项        |

```typescript
// 数组操作
result.form.control!.updateValue(['v1', 'v2']);
const arrayCtrl = result.form.control!;
console.log(arrayCtrl.length); // 2
console.log(arrayCtrl.controls.length); // 2

// 清空
arrayCtrl.clear();
console.log(arrayCtrl.controls); // []

// 设置/更新数组元素
resolved.action.set('11', 1); // set index 1 to '11'
```

---

## 配置 API

### config$

```typescript
// config$ 是 WritableSignal<FieldFormConfig>
// 通过 update 修改，使用 deepEqual 比较避免不必要的重算

// 启用/禁用
control.config$.update((c) => ({ ...c, disabled: true }));

// 设置默认值
control.config$.update((c) => ({ ...c, defaultValue: 'new default' }));

// 添加验证器
control.config$.update((c) => ({
  ...c,
  validators: [...(c.validators ?? []), myValidator],
}));

// 设置更新时机
control.config$.update((c) => ({ ...c, updateOn: 'blur' }));

// 重置配置为初始状态（注意：这不是 reset()）
```

**`FieldFormConfig` 完整字段说明：**

```typescript
interface FieldFormConfig<T = any> {
  disabled?: boolean; // 禁用此字段
  disabledValue?: 'reserve' | 'delete'; // 禁用时值处理策略
  transformer?: {
    toView?: (value: any, control: AbstractControl) => any; // 模型 → 视图
    toModel?: (value: any, control: AbstractControl) => any; // 视图 → 模型
  };
  pipe?: {
    toModel?: UnaryFunction<Observable<any>, Observable<T>>; // RxJS 管道
  };
  defaultValue?: any; // 默认值
  validators?: ValidatorFn[]; // 同步验证器数组
  asyncValidators?: AsyncValidatorFn[]; // 异步验证器数组
  updateOn?: 'change' | 'blur' | 'submit'; // 更新触发时机
  required?: boolean; // 是否必填
  undefinedable?: boolean; // 允许 undefined
  nullable?: boolean; // 允许 null
  emptyValue?: any; // group/array 空值
  deletionMode?: 'shrink' | 'mark'; // 数组删除模式
  groupMode?: 'loose' | 'default' | 'strict' | 'reset'; // 组模式
  groupKeySchema?: BaseSchema; // Record 键 schema
  groupValueSchema?: BaseSchema; // 组值 schema
  disableOrUpdateActivate?: boolean; // LogicGroup 自动切换
}
```

---

## 其他 API

### emitSubmit()

仅在 `updateOn: 'submit'` 时触发，处理 pending 状态并标记 touched。

```typescript
// 通常在表单提交时调用
resolved.form.control.emitSubmit();
```

### FieldArray 的子级信号（Field 层面）

在 `_PiResolvedCommonViewFieldConfig` 上，数组类型的 field 会暴露：

```typescript
// Field 对象上的子级信号
field.fixedChildren; // Signal<Array<_PiResolvedCommonViewFieldConfig>>
field.restChildren; // Signal<Array<_PiResolvedCommonViewFieldConfig>> | undefined
```

---

## 完整示例

### 基本表单操作

```typescript
import * as v from 'valibot';
import { convert, formConfig } from '@piying/view-angular-core';
import { firstValueFrom, debounceTime } from 'rxjs';

const schema = v.object({
  name: v.pipe(
    v.string(),
    formConfig({
      defaultValue: '',
      validators: [(c) => (c.value.length < 2 ? { short: '至少2个字符' } : undefined)],
    }),
  ),
  email: v.pipe(v.string(), v.email()),
  tags: v.optional(v.array(v.string()), []),
});

const resolved = convert(schema, {
  /* options */
});
const root = resolved.form.control!;

// 1. 读取初始值
console.log(root.value); // { name: '', email: undefined, tags: [] }

// 2. 更新值
root.updateValue({
  name: 'Test',
  email: 'test@example.com',
});

// 3. 监听值变更
root.valueChanges.subscribe((val) => {
  console.log('form value:', val);
});

// 4. 查看状态
console.log(root.valid); // true / false
console.log(root.errors); // undefined | ValidationErrors2[]

// 5. 获取子控件
const nameCtrl = root.get(['name']);
if (nameCtrl) {
  console.log(nameCtrl.value);
  console.log(nameCtrl.invalid);
  console.log(nameCtrl.errors);
}

// 6. 视图变更触发 dirty 状态
nameCtrl.viewValueChange('新输入');
console.log(nameCtrl.dirty); // true

// 7. 重置表单
root.reset();

// 8. 禁用整个表单
root.disable();
console.log(root.disabled); // true
```

### 数组控件操作

```typescript
import * as v from 'valibot';
import { convert, formConfig, isFieldArray } from '@piying/view-angular-core';

const schema = v.object({
  items: v.pipe(v.array(v.string()), formConfig({ emptyValue: [] })),
});

const resolved = convert(schema, {
  /* options */
});
const arrayCtrl = resolved.form.control!.get(['items'])!;

if (isFieldArray(arrayCtrl)) {
  // 添加元素
  resolved.action.set('new item', arrayCtrl.length);

  // 更新值
  arrayCtrl.updateValue(['a', 'b', 'c']);
  console.log(arrayCtrl.length); // 3

  // 遍历子控件
  for (const [i, child] of arrayCtrl.activatedChildren()) {
    console.log(`[${i}]`, child.value);
  }

  // 清空数组
  arrayCtrl.updateValue([]);
}
```

### 值转换器

```typescript
import * as v from 'valibot';
import { convert, formConfig } from '@piying/view-angular-core';

const schema = v.pipe(
  v.number(),
  formConfig({
    transformer: {
      toView: (value) => value?.toFixed(2) ?? '0.00', // 19.9 → "19.90"
      toModel: (value) => parseFloat(value), // "19.90" → 19.9
    },
  }),
);

const resolved = convert(schema, {
  /* options */
});
const ctrl = resolved.form.control!;

// modelValue$ 设置原始值
ctrl.updateValue(19.9);

// value$$ 是经过 toView 转换后的视图值
console.log(ctrl.value); // "19.90"（字符串）

// 模拟视图变更
ctrl.viewValueChange('25.5');
console.log(ctrl.value); // 25.5（数字）
```

---

## 注意事项

1. **Signal vs Getter**：`value$$()`、`disabled$$()` 等带 `$$` 的是 signal/computed，调用时需要加 `()`；`value`、`disabled` 是 getter，直接访问。

2. **Deep equal 比较**：`config$` signal 使用 `fast-equals` 的 deepEqual，避免相同值的重复更新。

3. **状态冒泡**：touched 和 dirty 状态会从子级冒泡到父级（通过 computed 实现）。

4. **Disabled 传导**：父级禁用会自动传导到所有子级，但 `selfDisabled$$()` 只反映自身配置。

5. **`updateOn: 'submit'`**：设置为 submit 模式后，值变更仅在调用 `emitSubmit()` 时处理。

---

## 相关文档

- [FieldFormConfig](api/field-config.md) — 字段表单配置详解
- [路径查询](api/path-querying.md) — keyPath、get() 用法速查
- [自定义验证](scenarios/custom-validation.md) — validators / asyncValidators 场景示例
- [值转换与联动](scenarios/value-transform.md) — transformer 使用指南

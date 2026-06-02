# hideWhen / disableWhen / valueChange — 动态控制 API 参考

本文介绍三个 Action 的完整 API 签名、参数说明和实现细节。

## hideWhen — 动态隐藏字段

### 类型签名

```typescript
interface HideWhenOption {
  disabled?: boolean; // 隐藏时是否同时禁用
  listen: (
    fn: (input: ValueChangFnOptions) => Observable<{
      field: _PiResolvedCommonViewFieldConfig;
      list: any[];
      listenFields: _PiResolvedCommonViewFieldConfig[];
    }>,
    field: _PiResolvedCommonViewFieldConfig,
  ) => Observable<boolean>;
}

function hideWhen<TInput>(options: HideWhenOption): RawConfigAction<TInput>;
```

### 参数说明

| 参数       | 类型       | 必填 | 说明                                 |
| ---------- | ---------- | ---- | ------------------------------------ |
| `listen`   | `Function` | ✅   | 监听回调，返回 `Observable<boolean>` |
| `disabled` | `boolean`  | ❌   | 隐藏时是否同时禁用字段               |

### listen 回调参数

```typescript
interface ValueChangFnOptions {
  list?: (KeyPath | undefined)[]; // 监听字段路径
  skipInitValue?: boolean; // 跳过初始值触发
}
```

返回 `Observable<boolean>`：`true` → 隐藏，`false` → 显示。

### listenFields 数组

`fn()` 返回的 Observable 中包含 `listenFields` 数组，对应 `list` 中每个路径的字段实例：

```typescript
import { hideWhen } from '@piying/view-angular-core';
import { map } from 'rxjs';

const schema = v.object({
  showExtra: v.boolean(),
  extraField: v.pipe(
    v.string(),
    hideWhen({
      listen: (fn) =>
        fn({ list: [['..', 'showExtra']] }).pipe(
          map((item) => !item.list[0]), // showExtra = false → 隐藏
        ),
    }),
  ),
});
```

### 示例：hideWhen + disabled

```typescript
const schema = v.object({
  enable: v.boolean(),
  name: v.pipe(
    v.string(),
    hideWhen({
      disabled: true, // 隐藏时同时禁用
      listen: (fn) => fn({ list: [['..', 'enable']] }).pipe(map((item) => !item.list[0])),
    }),
  ),
});
```

当 `enable = false` 时，`name` **同时被隐藏和禁用**。

## disableWhen — 动态禁用字段

### 类型签名

```typescript
interface DisableWhenOption {
  listen: (
    fn: (input: ValueChangFnOptions) => Observable<{
      field: _PiResolvedCommonViewFieldConfig;
      list: any[];
      listenFields: _PiResolvedCommonViewFieldConfig[];
    }>,
    field: _PiResolvedCommonViewFieldConfig,
  ) => Observable<boolean>;
}

function disableWhen<TInput>(options: DisableWhenOption): RawConfigAction<TInput>;
```

### disableWhen vs hideWhen.disabled

| 特性     | `disableWhen`      | `hideWhen({ disabled: true })` |
| -------- | ------------------ | ------------------------------ |
| 功能     | 仅控制 `disabled`  | 同时控制 `hidden` + `disabled` |
| 适用场景 | 字段可见但不可编辑 | 字段不可见且不可编辑           |

### 示例

```typescript
import { disableWhen } from '@piying/view-angular-core';
import { map } from 'rxjs';

const schema = v.object({
  isLocked: v.boolean(),
  name: v.pipe(
    v.string(),
    disableWhen({
      listen: (fn) =>
        fn({ list: [['..', 'isLocked']] }).pipe(
          map((item) => item.list[0]), // isLocked = true → 禁用
        ),
    }),
  ),
});
```

## valueChange — 值变化监听（无副作用）

### 类型签名

```typescript
type ValueChangeFn = (
  fn: (input?: ValueChangFnOptions) => Observable<{
    field: _PiResolvedCommonViewFieldConfig;
    list: any[];
    listenFields: _PiResolvedCommonViewFieldConfig[];
  }>,
  field: _PiResolvedCommonViewFieldConfig,
) => void;

function valueChange<TInput>(listenFn: ValueChangeFn): RawConfigAction<TInput>;
```

`valueChange` **只监听**值变化，不产生任何副作用（不改 hidden/disabled），适用于自定义联动逻辑。

```typescript
import { valueChange } from '@piying/view-angular-core';

const schema = v.object({
  source: v.string(),
  target: v.pipe(
    v.string(),
    valueChange((fn) =>
      fn({ list: [['..', 'source']] }).subscribe((value) => {
        // 自定义逻辑：监听 source 变化，执行自己的操作
        console.log('source changed to:', value.list[0]);
      }),
    ),
  ),
});
```

## skipInitValue — 跳过初始值触发

```typescript
hideWhen({
  listen: (fn) =>
    fn({
      list: [['..', 'field']],
      skipInitValue: true, // 组件初始化时不触发回调
    }).pipe(map((item) => !item.list[0])),
});
```

## 生命周期时机

所有三个 Action 的回调都在 `allFieldsResolved` Hook 中执行：

```typescript
mergeHooksFn(
  {
    allFieldsResolved: (field) => {
      options
        .listen((options) => valueChangeFn(field, options), field)
        .subscribe((result) => {
          /* 更新 hidden/disabled */
        });
    },
  },
  { position: 'bottom' },
  field,
);
```

这意味着这三个 Action **必须在所有字段解析完成后**才能正确获取监听字段的引用。

## outputChange — 输出事件监听

`outputChange` 监听组件的自定义输出事件（如 `@Output()` / emit 事件），支持多字段监听。

### 类型签名

```typescript
function outputChange<TInput>(
  fn: (
    input?: OutputChangeFnOptions,
  ) => Observable<{
    list: any[];
    field: _PiResolvedCommonViewFieldConfig;
  }>,
): RawConfigAction<TInput>;
```

### 示例：监听组件输出事件

```typescript
import { outputChange } from '@piying/view-angular-core';

const schema = v.object({
  childField: v.pipe(
    v.string(),
    actions.outputs.set({ myEvent: (value) => console.log('event:', value) }),
    outputChange((fn) =>
      fn([
        { list: undefined, output: 'myEvent' },
        { list: ['..', 'otherField'], output: 'otherEvent' },
      ]).subscribe((result) => {
        console.log('output change:', result);
      }),
    ),
  ),
});
```

## 相关文档

- [动态字段控制场景](../scenarios/dynamic-fields.md) — hideWhen/disableWhen/valueChange 实战用法和常见联动场景
- [综合示例](../scenarios/complete-example.md) — 结合所有知识点的完整业务表单

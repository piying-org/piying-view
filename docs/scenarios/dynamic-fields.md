# 动态字段控制 — 场景与实战

本文介绍如何使用 `hideWhen`、`disableWhen` 和 `valueChange` 实现字段的动态控制和联动。

> **API 参考**：类型签名、参数说明等详细信息请见 [hideWhen / disableWhen / valueChange API](../api/hide-disable.md)。

## hideWhen — 条件隐藏

### 基本用法：显示/隐藏额外字段

`hideWhen` 根据其他字段的值决定是否隐藏当前字段：

```typescript
import * as v from 'valibot';
import { hideWhen } from '@piying/view-angular-core';
import { map } from 'rxjs';

const schema = v.object({
  showExtra: v.boolean(),
  extraField: v.pipe(
    v.string(),
    hideWhen({
      listen: (fn) =>
        fn({ list: [['..', 'showExtra']] }).pipe(
          map((item) => !item.list[0]), // showExtra 为 false 时隐藏
        ),
    }),
  ),
});
```

当 `showExtra` 的值为 `false` 时，`extraField` 将被隐藏。

### hideWhen + disabled 联动

`hideWhen` 可同时控制 `hidden` 和 `disabled`：

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

此时当 `enable` 为 `false` 时，`name` 字段**同时被隐藏和禁用**。

## disableWhen — 条件禁用

### 基本用法：基于其他字段禁用编辑

`disableWhen` 根据其他字段的值决定是否禁用当前字段：

```typescript
import { disableWhen } from '@piying/view-angular-core';
import { map } from 'rxjs';

const schema = v.object({
  isActive: v.boolean(),
  name: v.pipe(
    v.string(),
    disableWhen({
      listen: (fn) =>
        fn({ list: [['..', 'isActive']] }).pipe(
          map((item) => !item.list[0]), // isActive 为 false 时禁用
        ),
    }),
  ),
});
```

### disableWhen vs hideWhen.disabled

| 特性     | `disableWhen`      | `hideWhen({ disabled: true })` |
| -------- | ------------------ | ------------------------------ |
| 功能     | 仅控制 disabled    | 同时控制 hidden + disabled     |
| 适用场景 | 字段可见但不可编辑 | 字段不可见且不可编辑           |

详见 [API: disableWhen](../api/hide-disable.md#disablewhen---类型签名)。

## valueChange — 自定义联动

`valueChange` 监听字段值变化但不产生副作用，可用于自定义联动逻辑：

```typescript
import { valueChange } from '@piying/view-angular-core';

const schema = v.object({
  source: v.string(),
  target: v.pipe(
    v.string(),
    valueChange((fn) =>
      fn({ list: [['..', 'source']] }).subscribe((value) => {
        // 自定义逻辑：源字段变化时更新目标字段
      }),
    ),
  ),
});
```

详见 [API: valueChange](../api/hide-disable.md#valuechange---类型签名)。

## 常见联动场景

### 场景一：条件显示 — 支付方式切换

根据单选按钮的值切换显示不同表单区域：

```typescript
import * as v from 'valibot';
import { hideWhen } from '@piying/view-angular-core';
import { map } from 'rxjs';

const schema = v.object({
  paymentMethod: v.picklist(['alipay', 'wechat', 'card']),
  alipayAccount: v.pipe(
    v.string(),
    hideWhen({
      listen: (fn) => fn({ list: [['..', 'paymentMethod']] }).pipe(map((item) => item.list[0] !== 'alipay')),
    }),
  ),
  wechatAccount: v.pipe(
    v.string(),
    hideWhen({
      listen: (fn) => fn({ list: [['..', 'paymentMethod']] }).pipe(map((item) => item.list[0] !== 'wechat')),
    }),
  ),
  cardNumber: v.pipe(
    v.string(),
    hideWhen({
      listen: (fn) => fn({ list: [['..', 'paymentMethod']] }).pipe(map((item) => item.list[0] !== 'card')),
    }),
  ),
});
```

### 场景二：条件禁用

当表单已提交时禁用所有编辑字段：

```typescript
import * as v from 'valibot';
import { disableWhen } from '@piying/view-angular-core';

const schema = v.object({
  isSubmitted: v.boolean(),
  name: v.pipe(
    v.string(),
    disableWhen({
      listen: (fn) =>
        fn({ list: [['..', 'isSubmitted']] }).pipe(
          map((item) => item.list[0]), // 已提交时禁用
        ),
    }),
  ),
});
```

### 级联联动：多字段联动更新

使用 `valueChange` + `field.get()` + `updateValue()` 实现多字段间的级联更新：

```typescript
import * as v from 'valibot';
import { valueChange } from '@piying/view-angular-core';
import { skip } from 'rxjs';

const schema = v.object({
  k1: v.boolean(),
  k2: v.pipe(
    v.boolean(),
    valueChange((fn) => {
      fn({ list: [['#', 'k1']] })
        .pipe(skip(1)) // 跳过初始值（undefined）
        .subscribe(({ list: [value], field }) => {
          field.form.control?.updateValue(!value); // k2 = !k1
        });
    }),
  ),
  k3: v.pipe(
    v.boolean(),
    valueChange((fn) => {
      fn({ list: [['#', 'k2']] })
        .pipe(skip(1))
        .subscribe(({ list: [value], field }) => {
          field.form.control?.updateValue(!value); // k3 = !k2
        });
    }),
  ),
});
```

> **注意**：首次监听时值为 `undefined`（除非设置了默认值），因此需要使用 `skip(1)` 跳过初始触发。

### 值变更时修改其他字段的值

通过 `valueChange` 监听字段并更新其他字段：

```typescript
const schema = v.object({
  mode: v.picklist(['data1', 'data2']),
  o1: v.object({ k1: v.optional(v.string()), k2: v.optional(v.string()) }),
  o2: v.object({ k3: v.optional(v.string()), k4: v.optional(v.string()) }),
});

// 在 mode 字段上添加 valueChange：
const fullSchema = v.object({
  mode: v.pipe(
    v.picklist(['data1', 'data2']),
    valueChange((fn) => {
      fn().subscribe(({ list: [value], field }) => {
        const o1FG = field.get(['#', 'o1']).form.control;
        const o2FG = field.get(['#', 'o2']).form.control;
        if (value === 'data1') {
          o1FG.updateValue({ k1: 'data1-input-k1', k2: 'data1-input-k2' });
          o2FG.updateValue({});
        } else {
          o2FG.updateValue({ k3: 'data2-input-k3', k4: 'data2-input-k4' });
          o1FG.updateValue({});
        }
      });
    }),
  ),
  o1: v.object({ k1: v.optional(v.string()), k2: v.optional(v.string()) }),
  o2: v.object({ k3: v.optional(v.string()), k4: v.optional(v.string()) }),
});
```

## 下一步

- [API: hideWhen / disableWhen / valueChange](../api/hide-disable.md) — 完整的 API 参考
- [值转换与联动](value-transform.md) — transformer(toModel/toView)
- [综合示例：完整业务表单](complete-example.md)

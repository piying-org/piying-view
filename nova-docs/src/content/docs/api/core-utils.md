---
title: "核心工具函数（@piying/view-angular-core/util）"
---

本文介绍核心库公开的信号与表单工具函数。这些函数大多由框架包（`field-control-bind` / `PiyingView` 等）内部使用，也可在自定义组件或 Action 中直接调用。

> 这些函数从 `@piying/view-angular-core`（或各框架包的 `@piying/view-core`）导出。

## combineSignal — 组合信号

将多个信号组合为一个计算信号，并提供增删改操作：

```typescript
import { combineSignal } from '@piying/view-angular-core';
import { signal } from '@angular/core';

const value$ = combineSignal<number>();
console.log(value$()); // []

const a = signal(1);
value$.add(a);        // 添加
console.log(value$()); // [1]

value$.remove(a);     // 移除
console.log(value$()); // []
```

返回对象是 `Signal<Input[]>`，附加方法：

| 方法                   | 说明                       |
| ---------------------- | -------------------------- |
| `add(item, index?)`    | 添加信号（可指定位置）     |
| `remove(item)`         | 移除信号                   |
| `items()`              | 返回内部信号列表           |
| `clean()`              | 清空                       |
| `update(fn)`           | 函数式更新列表             |

## observableSignal — 信号 + RxJS 管道

将信号包装为支持 RxJS `pipe` 的可观察信号，提供输入/输出/加载状态：

```typescript
import { observableSignal } from '@piying/view-angular-core';
import { map, pipe } from 'rxjs';

const value$ = observableSignal(1, {
  pipe: pipe(map((value: number) => value * 2)),
  autoDestroy: false,
});
console.log(value$());       // 2（管道处理后的值）
console.log(value$.output()); // 2

value$.set(2);
console.log(value$());       // 4
console.log(value$.output()); // 4
```

返回对象是 `WritableSignal<Output>`，附加成员：

| 成员          | 类型                    | 说明                     |
| ------------- | ----------------------- | ------------------------ |
| `input`       | `Signal<Input>`         | 原始输入信号             |
| `output`      | `Signal<Output>`        | 管道处理后的输出信号     |
| `loading`     | `Signal<boolean>`       | 管道处理中是否加载中     |
| `input$$`     | `Observable<Input>`     | 输入可观察流             |
| `output$$`    | `Observable<Output>`    | 输出可观察流             |
| `subject`     | `BehaviorSubject<Input>` | 内部输入主题            |
| `set(value)`  | —                        | 设置输入值并触发管道     |
| `update(fn)`  | —                        | 函数式更新输入值         |

**选项：**

| 选项          | 类型            | 说明                          |
| ------------- | --------------- | ----------------------------- |
| `pipe`        | `OperatorFunction<Input, Output>` | RxJS 管道             |
| `injector`    | `Injector`      | 用于自动销毁时取消订阅        |
| `autoDestroy` | `boolean`       | 默认 `true`，注入器销毁时自动完成 |

## asyncObjectSignal — 异步对象信号

管理一个对象信号，其键值可以是 `Promise` / `Observable` / `Signal` / 普通值，异步更新时自动写入：

```typescript
import { asyncObjectSignal } from '@piying/view-angular-core';
import { signal } from '@angular/core';
import { Subject } from 'rxjs';

const value$ = asyncObjectSignal<any>({ value: 1 });

// 普通更新
value$.update((data) => ({ ...data, value2: 2 }));
value$.set({ value3: 3 });

// 连接异步值（Promise）
value$.connect('k1', Promise.resolve(20));
// 连接 Observable
const sub$ = new Subject();
value$.connect('k1', sub$);
sub$.next(1); // value$() = { value: 1, k1: 1 }

// 连接 Signal
const s$ = signal(0);
value$.connect('k1', s$);
s$.set(1); // value$() = { value: 1, k1: 1 }

// 断开
value$.disconnect('k1');
```

返回对象是 `Signal<Input>`，附加方法：

| 方法               | 说明                                     |
| ------------------ | ---------------------------------------- |
| `connect(key, value)` | 连接异步值（Promise/Observable/Signal/普通值） |
| `disconnect(key)`  | 断开指定键的异步连接                     |
| `set(value)`       | 整体设置                                 |
| `update(fn)`       | 函数式更新                               |
| `map(fn)`          | 设置映射函数，对最终值进行变换           |

**`connect` 支持的值类型：**

| 类型         | 行为                                   |
| ------------ | -------------------------------------- |
| `Promise`    | resolve 后写入                          |
| `Observable` | 订阅每个 next 值                       |
| `Signal`     | 响应式读取，信号变化自动更新           |
| 普通值       | 立即写入                               |

## 其他内部工具

以下工具函数从 `@piying/view-angular-core/util` 导出，供内部实现使用，一般无需直接调用：

`toArray`、`clone`、`sortedArray`、`unwrapSignal`、`arrayStartsWith`、`controlStatusToClass`、`getError`、`effectListen`、`toObservable`、`lazyImport`、`createObservableSignal` 等。

## 下一步

- [核心概念](getting-started/core-concept/) — Schema → Field → Component 解析链
- [Control API](api/control-api/) — 表单控件值/状态/验证 API
- [FieldFormConfig](api/field-config/) — 字段表单配置

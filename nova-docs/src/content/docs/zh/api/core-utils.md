---
title: "核心工具函数（@piying/view-angular-core）"
---

本文介绍核心库公开的信号与表单工具函数。这些函数大多由框架包（`field-control-bind` / `PiyingView` 等）内部使用，也可在自定义组件或 Action 中直接调用。

> 这些函数统一从包的**根入口**导出：Angular 为 `@piying/view-angular-core`，其余框架为 `@piying/view-core`

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

## condition — 条件执行 Actions

`condition` 根据环境或条件执行不同的 Actions，需要在组件的 options 中配置 `environments`：

```typescript
import * as v from 'valibot';
import { condition, rawConfig } from '@piying/view-angular-core';

const schema = v.object({
  key1: v.pipe(
    v.string(),
    condition({
      environments: ['default'],
      actions: [
        rawConfig((item) => {
          item.inputs = { ...item.inputs, type: 'date' };
          return item;
        }),
      ],
    }),
  ),
});
```

> `environments` 用于匹配当前环境，匹配成功时执行对应的 `actions`。

## 其他工具

| 名称                          | 类型     | 说明                                                              |
| ----------------------------- | -------- | ----------------------------------------------------------------- |
| `toArray`                     | function | 将单值/数组/可迭代对象统一转为数组                              |
| `clone`                       | function | 深拷贝（表单值复制用）                                          |
| `SortedArray`                 | class    | 继承 `Array`，`push` 后按传入的 `compareFn` 自动排序（布局排序用）|
| `arrayStartsWith`             | function | 判断数组前缀是否匹配（路径比较用）                              |
| `controlStatusList`           | function | `(control?, skipDisabled?) => string[]`，如 `['touched','pristine','valid']` |
| `fieldControlStatusClass`     | function | 同上，拼接为 `pi-touched pi-pristine pi-valid` 形式的 class       |
| `errorSummary` / `getDeepError` | function | 字段错误摘要（当前字段 / 含子字段）                            |
| `effectListen`                | function | 在 `static-injector` 的 injector 中创建 effect                    |
| `toObservable`                | function | Signal → Observable（可配 `distinct` 等选项）                     |
| `lazyMark` / `getLazyImport`  | function | 懒加载两步式：`lazyMark(factory)` 打标记，`getLazyImport(type)` 取回工厂 |
| `isLazyMark`                  | function | 判断组件类型是否为懒加载标记                                    |
| `computedWithPrev`            | function | 可读取上一次值的 `computed`                                       |
| `asyncValidatorToSignal`      | function | 将 Promise / Observable / Signal 形式的异步验证统一为 Signal      |
| `initListen`                  | function | 根表单与外部 model 的双向监听（`PiyingView` 内部使用）            |
| `createViewControlLink`       | function | 把 `ControlValueAccessor` 链接到字段控件（各框架包内部使用）      |

> 信号相关只有 `observableSignal`（本文上方），**没有** `createObservableSignal`；`unwrapSignal` 也不存在，只有类型 `UnWrapSignal` / `SignalInputValue`。

## 下一步

- [核心概念](zh/getting-started/core-concept/) — Schema → Field → Component 解析链
- [Control API](zh/api/control-api/) — 表单控件值/状态/验证 API
- [formConfig](zh/api/form-config/) — 字段表单配置

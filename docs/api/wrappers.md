# Wrappers — 包装器设置

本文介绍 Wrapper 的 Actions（set/patch/remove/patchAsync）以及编写自定义 Wrapper 组件的方法。

## actions.wrappers — 包装器操作

### set — 设置包装器列表

将指定包装器列表设置为当前字段的 wrappers（覆盖已有值）：

```typescript
import { actions } from '@piying/view-angular-core';

// 字符串引用
const schema1 = v.pipe(
  v.string(),
  actions.wrappers.set(['card', 'fieldset']),
);

// 对象格式，可指定 inputs
const schema2 = v.pipe(
  v.string(),
  actions.wrappers.set([
    { type: 'card', inputs: { title: '卡片标题' } },
    'fieldset',
  ]),
);
```

### patchAsync — 异步添加包装器

将新包装器添加到列表末尾，或插入到指定位置：

```typescript
const schema = v.pipe(
  v.string(),
  actions.wrappers.patchAsync('w1'),                          // 追加到末尾
  actions.wrappers.patchAsync('w2', undefined, { insertIndex: 0 }),  // 插入到开头
);

// wrappers = ['w2', 'w1']
```

### remove — 移除包装器

```typescript
const schema = v.pipe(
  v.string(),
  actions.wrappers.set(['w1', 'w2', 'w3']),
  actions.wrappers.remove(['w2']),
);

// wrappers = ['w1', 'w3']
```

## Wrapper 渲染顺序

Wrapper 从外到内依次包裹字段：

```
[Wrapper0] → [Wrapper1] → [WrapperN] → [Field Component]
```

每个 Wrapper 组件负责渲染其内部内容（通过 `InsertFieldDirective`）。

## 编写自定义 Wrapper 组件

### Wrapper 要求

一个有效的 Wrapper 组件需要：

1. **不继承任何基类** — Wrapper 是纯装饰器，与 Group 组件（继承 `PiyingViewGroupBase`）不同
2. **导入 `InsertFieldDirective`** — 在 `imports` 数组中注册
3. **使用 `<ng-container insertField>`** — 作为字段插入点
4. **V2 模式用 `<ng-template #templateRef>` 包裹模板** — 通过 `viewChild` 获取引用

### V2 Wrapper 模板（推荐）

V2 模式下，整个包装器的 UI 结构放在 `<ng-template #templateRef>` 中：

```typescript
// card.wrapper.ts
import { Component, viewChild } from '@angular/core';
import { InsertFieldDirective } from '@piying/view-angular';

@Component({
  selector: 'wrapper-card',
  standalone: true,
  imports: [InsertFieldDirective],
  templateUrl: './card.wrapper.html',
})
export class CardWrapperComponent {
  static __version = 2;                          // 标记 V2 模式
  templateRef = viewChild.required('templateRef');
}
```

对应的模板文件 `card.wrapper.html`：

```html
<ng-template #templateRef>
  <div class="card">
    <h3>{{ title }}</h3>
    <ng-container insertField></ng-container>
  </div>
</ng-template>
```

### V1 Wrapper 模板（兼容）

V1 模式下，不使用 `<ng-template #templateRef>` 包裹：<

```html
<!-- fieldset.wrapper.html -->
<fieldset>
  <legend>{{ legend }}</legend>
  <ng-container insertField></ng-container>
</fieldset>
```

```typescript
// fieldset.wrapper.ts
@Component({
  selector: 'wrapper-fieldset',
  standalone: true,
  imports: [InsertFieldDirective],
  templateUrl: './fieldset.wrapper.html',
})
export class FieldsetWrapperComponent {
  // V1：不需要 templateRef，不需要设置 __version
}
```

### Wrapper 的 Inputs

Wrapper 组件通过 Angular `@Input()` 接收配置值（见上方 [Wrapper 组件的 Inputs/Attributes](#wrapper-组件的-inputsattributes) 章节）。

## V1 与 V2 的区别

| 特性 | V1（兼容） | V2（推荐） |
|------|-----------|-----------|
| `templateRef` 声明 | 不需要 | `<ng-template #templateRef>` 包裹整个 UI |
| TypeScript | 不需要设置 | `templateRef = viewChild.required('templateRef')` |
| 版本标记 | 不设置 `__version` | `static __version = 2` |
| `<ng-container insertField>` | 直接写在模板顶层 | 放在 `<ng-template #templateRef>` 内部 |

> **核心相同点**：无论 V1 还是 V2，字段插入点都是 `<ng-container insertField>`，这是 Wrapper 的唯一职责。

## Wrapper 配置

### 在 fieldGlobalConfig.wrappers 中注册

```typescript
options = {
  fieldGlobalConfig: {
    wrappers: {
      card:       { type: CardWrapperComponent },
      fieldset:   { type: FieldsetWrapperComponent },
    },
  },
};
```

### Wrapper 默认 Actions

可以在 `fieldGlobalConfig.wrappers` 中为包装器设置默认 Actions：

```typescript
options = {
  fieldGlobalConfig: {
    wrappers: {
      card: {
        type: CardWrapperComponent,
        actions: [
          actions.inputs.set({ border: true }),   // 所有 card wrapper 的默认 inputs
        ],
      },
    },
  },
};
```

## Wrapper 组件的 Inputs/Attributes

Wrapper 同样支持 `actions.wrappers` 的对象格式指定 inputs：

```typescript
const schema = v.pipe(
  v.string(),
  actions.wrappers.set([
    { type: 'card', inputs: { title: '自定义标题', border: false } },
  ]),
);
```

Wrapper 组件通过 Angular `@Input()` 接收这些值。

## Wrapper 编写注意事项

| 要点 | 说明 |
|------|------|
| **不继承任何基类** | Wrapper 是纯装饰器，与 Group（`PiyingViewGroupBase`）不同 |
| `imports: [InsertFieldDirective]` | 必须导入 InsertFieldDirective，否则 `insertField` 指令不可用 |
| V2 使用 `<ng-template #templateRef>` 包裹整个 UI | 通过 `viewChild.required('templateRef')` 获取引用 |
| V1 直接写 `<ng-container insertField>` | V1 模板中不需要 templateRef |
| V2 设置 `static __version = 2` | 标记使用 V2 模板语法 |
| `<ng-container insertField>` 是字段插入点 | 不可省略，V1/V2 完全相同 |
| Wrapper 之间可以嵌套 | 一个 Wrapper 内再套另一个 Wrapper |

## 下一步

- [API: path-querying](path-querying.md) — fullPath / keyPath / get() / @alias
- [API: fieldGlobalConfig](global-config.md) — types/wrappers 全局配置优先级体系
- [API: FieldFormConfig](field-config.md) — disabled/emptyValue/deletionMode 等配置详解

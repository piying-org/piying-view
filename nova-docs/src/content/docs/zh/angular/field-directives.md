---
title: "字段指令配置"
---

本文介绍 Angular 的**指令配置**（`actions.directives`）：为字段附加你自定义的指令，并介绍指令实例稳定性、运行时动态增删指令。

> ⚠️ **区分两类指令**：
> - 本文讲的是**指令配置**——你通过 `actions.directives` 把自定义指令（如 `D1Directive`）附加到字段组件上；
> - 而 `PiyingFieldTemplateDirective`（`[fieldTemplate]`）是库内置暴露给用户的手动模式绑定指令，属于另一类，详见 [Angular API 参考](zh/angular/api/)。

## 指令实例稳定 — 输入跟随变化

通过 `actions.directives` 附加到字段的指令，其**实例是稳定的**：输入参数变化时，指令实例不会被重建，内部数据会通过 Signal 响应式自动跟随更新。

```typescript
import { signal } from '@angular/core';
import { actions } from '@piying/view-angular';
import { D1Directive } from './d1.directive';

const inputs = signal('id1');
const define = v.pipe(
  v.string(),
  setComponent('test1'),
  actions.directives.patchAsync(D1Directive, [
    actions.inputs.patchAsync({ id: () => inputs }),
  ]),
);
```

之后修改输入：

```typescript
inputs.set('id2');
```

此时：

- 指令**实例不变**（引用相等，`toBe` 断言通过），不会触发重建
- 指令内部 `id()` 已自动更新为 `'id2'`，DOM 属性同步变化

> 💡 这保证了指令上绑定的业务状态（如事件订阅、内部缓存）不会因输入变化而丢失。

## 运行时动态添加 / 移除指令

在 Hook 中可以通过 `field.directives` 动态控制附加到字段的指令，无需重新渲染整个字段。

```typescript
import { asyncObjectSignal } from '@piying/view-angular-core';
import { NgDirectiveConfig } from '@piying/view-angular';

const makeDirective = () =>
  signal<NgDirectiveConfig>({
    type: D1Directive,
    inputs: asyncObjectSignal({}),
    outputs: asyncObjectSignal({}),
    attributes: asyncObjectSignal({}),
    events: asyncObjectSignal({}),
    model: asyncObjectSignal({}),
  });

const define = v.pipe(
  v.string(),
  setComponent('test1'),
  mergeHooks({
    allFieldsResolved(field) {
      // 动态添加指令，指令立即生效
      field.directives!.add(makeDirective());
      // 后续可清空（指令从 DOM 移除）
      field.directives!.clean();
      // 再重新添加
      field.directives!.add(makeDirective());
    },
  }),
);
```

> `field.directives` 提供 `add`（追加）与 `clean`（清空）等操作，适用于按业务状态开关指令（如权限校验、水印、埋点）等场景。

> 💡 在指令中获取附加字段的组件引用，可注入 `PI_COMPONENT_REF_TOKEN`，详见 [Token](zh/angular/tokens/)。

## 相关文档

- [Angular 包 API 参考](zh/angular/api/) — 指令配置、Token 完整参考（含 `PiyingFieldTemplateDirective` 的 `onInit` 输入）
- [Wrappers 包装器](zh/api/wrappers/) — Wrapper 与组件解析关系

# Options 配置详解

PiyingView 组件通过 `options` 属性接收配置，控制 Schema 转换和组件渲染行为。

## 基本结构

```typescript
<piying-view
  [schema]="schema"
  [(model)]="model"
  [options]="options"
></piying-view>
```

```typescript
options = {
  context?: any;                          // 上下文注入
  fieldGlobalConfig?: PiViewConfig;       // 全局配置（types + wrappers）
  builder?: typeof FormBuilder<any>;      // 自定义 Builder
};
```

## 1. context（上下文）

`context` 会在 Schema 转换过程中注入，在任意 Actions 中只要能获取到 `field`，都可以通过 `field.context` 访问：

```typescript
const options = {
  context: { userId: '123', role: 'admin' },
};
```

在 Schema 中使用：

```typescript
import { actions } from '@piying/view-angular-core';

const schema = v.object({
  name: v.pipe(
    v.string(),
    actions.hooks.merge({
      allFieldsResolved(field) {
        console.log(field.context.userId); // '123'
        console.log(field.context.role); // 'admin'
      },
    }),
  ),
});
```

## 2. fieldGlobalConfig（全局配置）
- 查看 [fieldGlobalConfig](../api/global-config.md) — types/wrappers actions、优先级体系、合并规则详解

`fieldGlobalConfig` 是最核心的配置项，包含 `types` 和 `wrappers` 两部分。

### types — 类型映射

将类型名映射到具体组件：

```typescript
options = {
  fieldGlobalConfig: {
    types: {
      string:   { type: TextInputComponent },
      number:   { type: NumberInputComponent },
      boolean:  { type: CheckboxComponent },
      object:   { type: PiyingViewGroup },
      array:    { type: PiyingViewGroup },
    },
  },
};
```

### wrappers — 包装器注册

注册可在 Schema 中引用的 Wrapper 组件：

```typescript
options = {
  fieldGlobalConfig: {
    wrappers: {
      card:     { type: CardWrapperComponent },
      fieldset: { type: FieldsetWrapperComponent },
    },
  },
};
```

### types/wrappers actions 与优先级体系

在 `types` 或 `wrappers` 中配置 `actions` 后，这些 Actions 会作为该类型/包装器的**默认 Actions**，与用户 Schema 中定义的 Actions **数组合并**。详见：

- [fieldGlobalConfig API 完整参考](../api/global-config.md) — types/wrappers actions、优先级体系、合并规则

## 3. builder（自定义 Builder）

默认使用内置 `FormBuilder`，可通过传入自定义类扩展行为：

```typescript
import { FormBuilder } from '@piying/view-angular-core';

class CustomFormBuilder extends FormBuilder<any> {
  // 重写转换逻辑
}

const options = {
  builder: CustomFormBuilder,
};
```

## Options 完整示例

```typescript
options = {
  context: { userId: '123' },
  builder: CustomFormBuilder,
  fieldGlobalConfig: {
    types: {
      string:   { type: TextInputComponent },
      number:   { type: NumberInputComponent },
      custom:   { type: CustomComponent, actions: [v.title('自定义标题')] },
    },
    wrappers: {
      card:     { type: CardWrapperComponent },
      fieldset: { type: FieldsetWrapperComponent },
    },
  },
};
```

## 下一步

- 查看 [fieldGlobalConfig API](../api/global-config.md) — types/wrappers actions、优先级体系、合并规则详解
- 查看 [setComponent API](../api/setComponent.md) — 如何在 Schema 级别指定组件

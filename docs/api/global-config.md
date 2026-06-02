# fieldGlobalConfig — 全局配置

`fieldGlobalConfig` 在 `options` 中配置，提供 types、wrappers 的全局默认值。

## 类型签名

```typescript
interface PiViewConfig {
  types?: Record<string, PiTypeConfig<TComponent>>;
  wrappers?: Record<string, PiWrapperConfig<TWrapperComponent>>;
}

interface PiTypeConfig<TComponent> {
  type?: TComponent;                     // 组件引用
  actions?: BaseMetadata[];              // 此类型的默认 Actions
}

interface PiWrapperConfig<TWrapperComponent> {
  type: TWrapperComponent;               // 包装器组件引用（必填）
  actions?: RawConfigAction[];           // 此包装器的默认 Actions
}
```

## types — 全局类型映射

`types` 将类型名（字符串 key）映射到组件配置：

```typescript
options = {
  fieldGlobalConfig: {
    types: {
      // 内置类型
      string:     { type: TextInputComponent },
      number:     { type: NumberInputComponent },
      boolean:    { type: CheckboxComponent },
      object:     { type: PiyingViewGroup },
      array:      { type: PiyingViewGroup },
      intersect:  { type: PiyingViewGroup },
      'intersect-group': { type: PiyingViewGroup },
      record:     { type: PiyingViewGroup },

      // 自定义类型
      'my-input':  { type: MyInputComponent },
      'my-group':  { type: MyGroupComponent, actions: [v.title('分组标题')] },
    },
  },
};
```

### types 中的 actions

在 `types` 的某项中配置 `actions`，这些 Actions 会作为该类型所有字段的**默认 Actions**，与用户定义的 Actions **合并**：

```typescript
const obj = v.pipe(
  v.string(),
  actions.inputs.patch({ k1: 1 }),   // 用户定义 Actions
  setComponent('test1'),
);

options = {
  fieldGlobalConfig: {
    types: {
      test1: {
        type: Test1Component,
        actions: [actions.inputs.set({ k2: 2 })],   // 全局默认 Actions
      },
    },
  },
};

// 合并结果: [...globalActions, ...defineActions]
// = [{k2: 2}, {k1: 1}]
// result.inputs() = {k2: 2, k1: 1}
```

**全局默认 Actions（`k2: 2`）先执行，用户定义 Actions（`k1: 1`）后执行**。

## wrappers — 全局包装器注册

`wrappers` 注册可在 Schema 中引用的 Wrapper 组件：

```typescript
options = {
  fieldGlobalConfig: {
    wrappers: {
      card:        { type: CardWrapperComponent },
      fieldset:    { type: FieldsetWrapperComponent },
      panel:       { type: PanelWrapperComponent, actions: [actions.inputs.set({ bordered: true })] },
    },
  },
};
```

### wrappers 中的 actions

在 `wrappers` 的某项中配置 `actions`，这些 Actions 会在 Wrapper 被引用时自动应用，**作用于 wrapper 组件本身**（而非被包装的字段组件）：

```typescript
const schema = v.pipe(
  v.string(),
  actions.wrappers.set(['panel']),   // 引用 'panel' wrapper
);

// panel wrapper 会自动携带 wrappers.panel.actions 中的动作，设置 panel 组件自身的属性
```

## 优先级体系

### Component Type 解析优先级（从高到低）

| 优先级 | 来源 | 说明 |
|--------|------|------|
| 1（最高） | `setComponent(MyComponent)` | 直接传组件类，不查 types |
| 2 | `setComponent('key')` + Schema Actions | schema 中显式指定类型 key |


### Actions 合并规则

Actions 的合并方式是**数组合并**：`[...globalActions, ...defineActions]`，全局默认 Actions 在前，用户定义的 Actions 在后。

```
全局默认 Actions（types[].actions / wrappers[].actions）
    +
用户定义 Actions（Schema Actions，v.pipe 链中定义）
    =
最终 Actions 列表 = [...globalActions, ...defineActions]
```

即：**用户定义的 Actions 在全局默认 Actions 之后执行**，后执行的 Action 拥有更高的优先级。

### Wrapper 组件查找优先级

| 条件 | 行为 |
|------|------|
| Wrapper 是对象 `{ type, inputs }` | 直接使用 `type` 属性 |
| Wrapper 是字符串 | 从 `fieldGlobalConfig.wrappers[key]` 查找，找不到则报错 |

```typescript
// 报错：'unknown-wrapper' 不在 fieldGlobalConfig.wrappers 中
actions.wrappers.set(['unknown-wrapper']);
// → Error: 🈳wrapper:[unknown-wrapper]❗
```

## fieldGlobalConfig 与 Schema Actions 的关系

```
schema 中 setComponent('key') + actions
    │
    ▼
查找 fieldGlobalConfig.types[key]
    │
    ├── type → 组件类（用于渲染）
    └── actions → 合并到当前字段的 Actions 列表
                  最终 = [...globalActions, ...defineActions]
```

**关键点**：
- `fieldGlobalConfig.types` 中的 `actions` 与用户定义的 Actions **数组合并**，不是替换
- 全局默认 Actions 在前（`...globalActions`），用户定义 Actions 在后（`...defineActions`）
- `types[].actions` 用于为同一类型的所有字段设置默认行为

## 常见配置模式

### 模式一：最小配置（仅组件映射）

```typescript
options = {
  fieldGlobalConfig: {
    types: {
      string: TextInputComponent,
      number: TextInputComponent,
      object: PiyingViewGroup,
    },
  },
};
```

### 模式二：带默认 Actions

```typescript
options = {
  fieldGlobalConfig: {
    types: {
      string: { type: TextInputComponent },
      'custom': {
        type: CustomComponent,
        actions: [v.title('自定义标题'), actions.inputs.set({ variant: 'outlined' })],
      },
    },
    wrappers: {
      card: {
        type: CardWrapperComponent,
        actions: [actions.class.top('card-wrapper')],
      },
    },
  },
};
```

### 模式三：完整生产配置

```typescript
options = {
  context: { userId: '123' },
  fieldGlobalConfig: {
    types: {
      string:   { type: TextInputComponent },
      number:   { type: NumberInputComponent },
      boolean:  { type: CheckboxComponent },
      object:   { type: PiyingViewGroup },
      array:    { type: PiyingViewGroup },
      record:   { type: PiyingViewGroup },

      'input':     { type: InputComponent, actions: [actions.class.top('form-field')] },
      'textarea':  { type: TextareaComponent },
      'select':    { type: SelectComponent },
      'date':      { type: DatePickerComponent },
    },
    wrappers: {
      card:     { type: CardWrapperComponent },
      fieldset: { type: FieldsetWrapperComponent },
      section:  { type: SectionWrapperComponent, actions: [actions.inputs.set({ bordered: false })] },
    },
  },
};
```

## 入门阅读

- [Options 配置详解](../getting-started/options-config.md) — context / fieldGlobalConfig / builder 入门讲解

## 下一步

- [场景: asControl / asVirtualGroup](../scenarios/as-control-group.md) — Group 视为独立控件
- [API: setComponent](setComponent.md) — 组件设置详解
- [5分钟快速上手](../getting-started/quick-start.md) — 从零开始搭建

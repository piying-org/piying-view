---
title: "Vue 强类型组件（typedComponent）"
---

`typedComponent` 是 Vue 包（`@piying/view-vue`）提供的**强类型** `setComponent` 封装。它基于 `fieldGlobalConfig` 的类型定义推导出组件的输入属性类型，使 `actions.inputs` 在写 Schema 时获得完整的类型检查与自动补全。

## 为什么需要 typedComponent

直接使用 `setComponent` / `actions.inputs.set` 时，`inputs` 的值是 `Record<string, any>`，没有任何类型约束。`typedComponent` 能从你注册的组件类型中**推导出 inputs 的字段名和值类型**，在编译期拦截错误。

```typescript
import { typedComponent } from '@piying/view-vue';
import { markRaw } from 'vue';
import InputsTest from './component/inputs-test.vue';

const typeDefine = typedComponent({
  types: {
    string: { type: markRaw(InputsTest) },
  },
});

// setComponent('string', (actions) => [...] )
// actions.inputs 会推导出 InputsTest 组件的 props 类型
const result = typeDefine.setComponent('string', (actions) => [
  actions.inputs.patch({ value1: '1' }),
  actions.inputs.patch({ value1: '1', value2: 2 }),
  actions.inputs.set({ value1: '1', value2: 2 }),
  actions.inputs.remove(['value1', 'value2']),
  actions.inputs.patchAsync({ value1: async () => '1' }),
]);
```

## 三种用法

### 1. 通过类型 key 引用（推荐）

`typedComponent` 传入 `fieldGlobalConfig` 配置，随后用 `setComponent('类型key', fn)` 引用：

```typescript
const typeDefine = typedComponent({
  types: {
    string: { type: markRaw(InputsTest) },
    number: { type: NumberInput },
  },
});

const schema = v.object({
  name: typeDefine.setComponent('string', (actions) => [
    actions.inputs.patch({ value1: '1' }),
  ]),
});
```

此时 `actions.inputs` 的类型会推导为 `InputsTest` 组件的 props，写错字段名或类型会直接报错。

### 2. 通过 `types[].actions` 声明组件默认 Actions

如果类型在 `types` 中通过 `actions` 声明，`typedComponent` 也能识别：

```typescript
const typeDefine = typedComponent({
  types: {
    string: { actions: [setComponent(markRaw(InputsTest))] },
  },
});

const schema = typeDefine.setComponent('string', (actions) => [
  actions.inputs.patch({ value1: '1' }),
]);
```

### 3. 直接传入组件类

不依赖 `types` 配置，直接将组件传入 `setComponent`：

```typescript
const typeDefine = typedComponent({});

const schema = typeDefine.setComponent(markRaw(InputsTest), (actions) => [
  actions.inputs.patch({ value1: '1', value2: 2 }),
]);
```

## nfcComponent — 强类型非表单控件

`typedComponent` 还返回 `nfcComponent`，用于创建非表单控件（NonFieldControl）组件：

```typescript
const typeDefine = typedComponent({
  types: {
    string: { type: markRaw(InputsTest) },
  },
});

const schema = typeDefine.nfcComponent('string', (actions) => [
  actions.inputs.patch({ value1: '1' }),
]);
```

## 返回的 Actions 类型

`fn` 回调接收的 `actions` 参数是 `PresetActions` 与组件类型推导出的 `inputs` 操作合并后的对象：

```typescript
type ComponentActions<TComponent> = {
  inputs: {
    patch: <Input>(value: ComponentInputs<TComponent>) => ReturnAction<Input>;
    set: <Input>(value: ComponentInputs<TComponent>) => ReturnAction<Input>;
    patchAsync: <Input>(value: ComponentInputsAsync<TComponent>) => ReturnAction<Input>;
    remove: <Input>(value: (keyof ComponentInputs<TComponent>)[]) => ReturnAction<Input>;
    mapAsync: <Input>(value: (field) => (value) => value) => ReturnAction<Input>;
  };
};
```

其中 `ComponentInputs<TComponent>` 是从 Vue 组件的 `$props`（排除 VNodeProps / AllowedComponentProps）推导出的输入属性类型。

## 使用 `markRaw`

在 Vue 中，组件对象默认会被 Vue 的响应式系统代理。注册到 Schema 时建议使用 `markRaw()` 避免不必要的响应式包装：

```typescript
import { markRaw } from 'vue';
import InputsTest from './component/inputs-test.vue';

const typeDefine = typedComponent({
  types: {
    string: { type: markRaw(InputsTest) },
  },
});
```

## 下一步

- [框架差异](/getting-started/framework-differences/) — Vue 的 Field Token / CVA 绑定
- [基础字段定义](/scenarios/basic-field/) — setComponent / formConfig 用法
- [API: setComponent](/api/setcomponent/) — 组件设置详解

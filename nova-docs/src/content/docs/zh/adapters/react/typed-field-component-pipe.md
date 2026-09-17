---
title: "typedFieldComponentPipe（React）"
---

`@piying/view-react` 专用。在 `typedFieldPipe` 的基础上多传一个「组件」，让 `inputs` / `outputs` 的 key 和值类型跟着这个 React 组件走。

通用版见 [typedFieldPipe](zh/api/typed-field-pipe/)。

## 输入

1. schema
2. `fieldGlobalConfig`
3. 回调：返回 `[路径, 组件, actions[]]` 组成的数组

组件位可以传 `types` 里注册的 key，也可以直接传组件（含懒加载）。

## 输出

一个新的 schema，带组件的那条 entry 自动补上 `setComponent(组件)`。**必须使用返回值**，原 schema 不会被修改。

## 例子

```tsx
import * as v from 'valibot';
import { typedFieldComponentPipe } from '@piying/view-react';
import { AmountInput } from './components/amount-input';
import { TagPicker } from './components/tag-picker';

const fieldGlobalConfig = {
  types: {
    amount: { type: AmountInput },
    tags: { type: TagPicker },
  },
};

const schema = v.object({
  price: v.number(),
  tags: v.array(v.string()),
});

const merged = typedFieldComponentPipe(schema, fieldGlobalConfig, (d) => [
  // AmountInput 的非函数 props: placeholder?: string; precision?: number
  d(['price'], 'amount', [
    d.inputs.patch({ placeholder: '请输入金额' }),
    d.inputs.patchAsync({ precision: (field) => (field.value > 100 ? 0 : 2) }),
    d.inputs.remove(['placeholder']),
  ]),

  // TagPicker 的函数 props: onChange(value: string[]) / onClear()
  d(['tags'], 'tags', [
    d.outputs.merge({ onChange: (value) => console.log(value) }),
    d.outputs.mergeAsync({ onClear: (field) => () => console.log(field.fullPath) }),
    d.outputChange((fn) => fn([{ list: undefined, output: 'onChange' }])),
  ]),
]);
```

多参数回调同样保留完整元组：

```tsx
// 组件: onRange: (start: number, end: string) => void
d(['num'], 'multi', [
  d.outputs.patch({
    // start / end 由组件类型自动推导，不需要手写标注
    onRange: (start, end) => console.log(start, end),
  }),
]);
```

## 省略 component

第二个参数直接省掉（或显式传 `undefined`）时**不下发 `setComponent`**，运行时按该路径 schema 的 `type`（如 `string`）去 `types` 里查默认组件；类型层用同一个 `type` 反推表，收窄依旧生效。

```tsx
const fieldGlobalConfig = { types: { string: { type: MyInput } } };

const merged = typedFieldComponentPipe(schema, fieldGlobalConfig, (d) => [
  d(['name'], [d.inputs.patch({ placeholder: '默认组件的 prop' })]),
  d(['name'], undefined, [d.inputs.patchAsync({ maxLength: () => 20 })]),
]);
```

## 懒加载：必须用 `React.lazy()`

React 适配层直接拿配置里的 `type` 渲染，运行时不解懒加载函数，所以必须过 `React.lazy()`（模块要有 `default` 导出）：

```tsx
import { lazy } from 'react';

const reactLazyEmit = lazy(() =>
  import('./components/typed-emit').then(({ TypedEmit }) => ({ default: TypedEmit })),
);

const fieldGlobalConfig = { types: { emit: { type: reactLazyEmit } } };

// 类型层照常按解包后的组件收窄
const merged = typedFieldComponentPipe(schema, fieldGlobalConfig, (d) => [
  d(['e'], 'emit', [d.inputs.patch({ name: 'lazy-name' })]),
]);
```

`lazyMark()` 是通用标记，但只在**类型层**解开 `() => Promise<组件>`；React 运行时不消费它，单用渲染不出来。

## attributes / events 命名

- `attributes` 的标准名取自 React 的 `HTMLAttributes`，并**摘掉 `onXxx`**（那是 events 的地盘）。
- class 要写 **`className`**，不是 `class`。
- 自定义名（`data-*`、组件自有透传属性）一律放行。
- `events` 收标准 DOM 事件名（`click` / `keydown` …），自定义事件名同样放行。

```tsx
d(['price'], 'amount', [
  d.attributes.patch({ className: 'w-full', id: 'price', role: 'spinbutton' }),
  d.attributes.patch({ 'data-x': 1 }),
  d.attributes.top.set({ title: 'top-title' }),
  d.events.patch({ click: (event) => console.log(event.clientX) }),
]);
```

## 降级行为

没有组件时退回通用 `typedFieldPipe` 行为：`inputs` / `outputs` 为普通 key / value，不校验 key 名。

## 注意

- **必须使用返回值**，原 schema 不被修改。
- action 工厂的调用要写在本次的 actions 数组里，提前存到变量会丢类型上下文。
- 同一路径写多条 entry、同一工厂调多次，都会叠加生效；字段声明顺序不受影响。
- 回调里的 `field` 是只读的：读值、读状态、`field.get()` 查其他字段都可以，改配置靠返回的 Action 下发。
- 想让 output 参数有类型，组件的函数 prop 必须写出显式签名；写成 `any` 会被归到 inputs 而不是 outputs。

## 相关文档

- [typedFieldPipe](zh/api/typed-field-pipe/) — 通用版（框架无关）
- [React 包 API 参考](zh/adapters/react/) — Token / CVA / useSignalToRef
- [字段模型绑定](zh/adapters/react/field-model-binding/) — `use-*Model` 系列
- [Action 速查表](zh/api/action-cheatsheet/) — 命名空间与动词全览

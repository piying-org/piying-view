---
title: "typedFieldComponentPipe（Svelte）"
---

`@piying/view-svelte` 专用。在 `typedFieldPipe` 的基础上多传一个「组件」，让 `inputs` / `outputs` 的 key 和值类型跟着这个 Svelte 5 组件走。

通用版见 [typedFieldPipe](zh/api/typed-field-pipe/)。

## 输入

1. schema
2. `fieldGlobalConfig`
3. 回调：返回 `[路径, 组件, actions[]]` 组成的数组

组件位可以传 `types` 里注册的 key，也可以直接传组件（含懒加载）。

## 输出

一个新的 schema，带组件的那条 entry 自动补上 `setComponent(组件)`。**必须使用返回值**，原 schema 不会被修改。

## 例子

```ts
import * as v from 'valibot';
import { typedFieldComponentPipe } from '@piying/view-svelte';
import AmountInput from './components/amount-input.svelte';
import TagPicker from './components/tag-picker.svelte';

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

```ts
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

```ts
const fieldGlobalConfig = { types: { string: { type: MyInput } } };

const merged = typedFieldComponentPipe(schema, fieldGlobalConfig, (d) => [
  d(['name'], [d.inputs.patch({ placeholder: '默认组件的 prop' })]),
  d(['name'], undefined, [d.inputs.patchAsync({ maxlength: () => 20 })]),
]);
```

## 懒加载

Svelte 适配层在运行时就会解开懒加载，用 `lazyMark()` 标记后，类型层同步解开成真实组件：

```ts
import { lazyMark } from '@piying/view-core';

const lazyEmit = () => import('./components/typed-emit.svelte').then((m) => m.default);

const fieldGlobalConfig = { types: { emit: { type: lazyMark(lazyEmit) } } };

// inputs / outputs 依旧按解包后的组件收窄
const merged = typedFieldComponentPipe(schema, fieldGlobalConfig, (d) => [
  d(['e'], 'emit', [d.inputs.patch({ name: 'lazy-name' })]),
]);
```

## attributes / events 命名

- `attributes` 的标准名取自 `svelte/elements` 的 `HTMLAttributes`，并**摘掉 `onXxx`**（那是 events 的地盘）。
- 自定义名（`data-*`、组件自有透传属性）一律放行。
- `events` 收标准 DOM 事件名（`click` / `keydown` …），自定义事件名同样放行。

```ts
d(['price'], 'amount', [
  d.attributes.patch({ class: 'w-full', id: 'price', role: 'spinbutton' }),
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
- `Snippet`（`{#snippet}` / children）在类型上也是可调用的，但它是**内容不是事件**，不会出现在 `outputs` 的 key 里。
- 字段通过 `getContext(PI_VIEW_FIELD_TOKEN)` 获取，而不是依赖注入。

## 相关文档

- [typedFieldPipe](zh/api/typed-field-pipe/) — 通用版（框架无关）
- [Svelte 包 API 参考](zh/adapters/svelte/) — getContext / signalToState / CVA
- [Action 速查表](zh/api/action-cheatsheet/) — 命名空间与动词全览

---
title: "typedFieldComponentPipe（Vue 3）"
---

`@piying/view-vue` 专用。在 `typedFieldPipe` 的基础上多传一个「组件」，让 `inputs` / `outputs` 的 key 和值类型跟着这个 Vue 组件走。

通用版见 [typedFieldPipe](zh/api/typed-field-pipe/)。

## 输入

1. schema
2. `fieldGlobalConfig`
3. 回调：返回 `[路径, 组件, actions[]]` 组成的数组

组件位可以传 `types` 里注册的 key，也可以直接传组件（含懒加载）。

## 输出

一个新的 schema，带组件的那条 entry 自动补上 `setComponent(组件)`，保证「校验用的类型」就是「真正渲染的组件」。**必须使用返回值**，原 schema 不会被修改。

## 例子

```typescript
import * as v from 'valibot';
import { markRaw } from 'vue';
import { typedFieldComponentPipe } from '@piying/view-vue';
import AmountInput from './components/amount-input.vue';
import TagPicker from './components/tag-picker.vue';

const fieldGlobalConfig = {
  types: {
    amount: { type: markRaw(AmountInput) },
    tags: { type: markRaw(TagPicker) },
  },
};

const schema = v.object({
  price: v.number(),
  tags: v.array(v.string()),
});

const merged = typedFieldComponentPipe(schema, fieldGlobalConfig, (d) => [
  // AmountInput 的 props: placeholder?: string; precision?: number
  d(['price'], 'amount', [
    d.inputs.patch({ placeholder: '请输入金额' }),
    d.inputs.patchAsync({ precision: (field) => (field.value > 100 ? 0 : 2) }),
    d.inputs.remove(['placeholder']),
  ]),

  // TagPicker 的 emits: change(value: string[]) / clear()
  d(['tags'], 'tags', [
    d.outputs.merge({ change: (value) => console.log(value) }),
    d.outputs.mergeAsync({ clear: (field) => () => console.log(field.fullPath) }),
    d.outputChange((fn) => fn([{ list: undefined, output: 'change' }])),
  ]),
]);
```

写错 key（`placeholder` 拼成 `placehold`）或写错值类型（`precision` 给字符串），**写的时候编译器就会提示错误**，自动补全也只给得出组件真实存在的那几个 —— 强类型就是为了把问题挡在写的时候，而不是等到跑起来。

## 省略 component

第二个参数可以直接省掉（或直接传 `undefined`），此时**不下发 `setComponent`**，运行时按该路径 schema 的 `type`（如 `string`）去 `types` 里查默认组件；类型层用同一个 `type` 反推表，收窄依旧生效。

```typescript
const fieldGlobalConfig = {
  types: { string: { type: markRaw(MyInput) } },
};

const merged = typedFieldComponentPipe(schema, fieldGlobalConfig, (d) => [
  d(['name'], [d.inputs.patch({ placeholder: '默认组件的 prop' })]),
  d(['name'], undefined, [d.inputs.patchAsync({ maxlength: () => 20 })]),
]);
```

## 懒加载

Vue 侧直接给 `() => import('./x.vue').then((m) => m.default)` 就能被解开；需要显式标记时用 `lazyMark()`：

```typescript
import { lazyMark } from '@piying/view-core';

const lazyEmit = () => import('./components/typed-emit.vue').then((m) => m.default);

const fieldGlobalConfig = {
  types: { emit: { type: lazyMark(lazyEmit) } },
};

// inputs / outputs 依旧按解包后的组件收窄
const merged = typedFieldComponentPipe(schema, fieldGlobalConfig, (d) => [
  d(['e'], 'emit', [d.inputs.patch({ name: 'lazy-name' })]),
]);
```

## attributes / events 命名

- `attributes` 的标准名取自 Vue 的 `HTMLAttributes`，并**摘掉 `onXxx`**（那是 events 的地盘）；class 写 `class`，不是 `className`。
- 自定义名（`data-*`、组件自有 fallthrough 属性）一律放行。
- `events` 收标准 DOM 事件名（`click` / `keydown` …），自定义事件名同样放行。

```typescript
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
- 注册组件时建议 `markRaw()`，避免 Vue 把组件包成响应式对象。

## 相关文档

- [typedFieldPipe](zh/api/typed-field-pipe/) — 通用版（框架无关）
- [Vue 包 API 参考](zh/adapters/vue/) — PiyingView / Token / CVA
- [Action 速查表](zh/api/action-cheatsheet/) — 命名空间与动词全览

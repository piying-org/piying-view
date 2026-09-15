---
title: "typedFieldPipe — 按路径写 Action"
---

按路径给 schema 里的字段挂 Action。

路径由 schema 结构推导并自动补全；回调里的 `field` 和该路径的值类型都是精确类型，与 `builder.get(path)` 等价。

**框架无关**，所有框架通用。从核心包导入：Angular 用 `@piying/view-angular-core`，Vue / React / Solid / Svelte 用 `@piying/view-core`。

## 输入

1. 一个 Valibot schema 变量
2. 回调：返回 `[路径, actions[]]` 组成的数组

## 输出

一个新的 schema。值类型不变，只是多了 Action。**必须使用返回值**，原 schema 不会被修改。

## 例子

```typescript
import * as v from 'valibot';
import { typedFieldPipe } from '@piying/view-core';

const merged = typedFieldPipe(root, (d) => [
  // 根节点
  d([], [d.props.patchAsync({ rootProp: () => 'ROOT' })]),

  // ['a'] 是 string 字段
  d(['a'], [
    v.minLength(2),
    d.props.patchAsync({
      // field 的类型 == builder.get(['a'])
      len: (field) => field.form.control!.value.length,
    }),
  ]),

  // 数组下标 / 嵌套字段
  d(['list', 0, 'c'], [
    d.inputs.patchAsync({ tag: () => 'CTAG' }),
    d.hooks.merge({
      fieldResolved: (field) => console.log(field.fullPath),
    }),
  ]),
]);
```

## 路径怎么写

路径是一个数组，编辑器会按 schema 结构补全，补不出来就是非法路径。

| 写法 | 指向 |
| ---- | ---- |
| `[]` | 根节点 |
| `['a']` | object 的字段 |
| `['outer', 'b']` | 嵌套 object 的字段 |
| `['list', 0, 'c']` | 数组第 0 项的字段 / tuple 下标 |
| `['sel', 0, 'x']` | union / intersect / variant 第 0 个成员里的字段 |
| `['[value]']` | record / map / set 的 value 节点，array 的 item |
| `['[key]']` | record / map 的 key 节点 |
| `['[rest]']` | objectWithRest / tupleWithRest 的 rest 节点 |

> `'#'` `'..'` `'@别名'` 不能写在路径里（pipe 只按结构下钻）。它们只能在回调里用：`field.get(['..'])` / `field.get(['#'])` / `field.get(['@ss'])`。

## Action 工厂

回调参数本身可以调用成一条 entry，同时挂载了全部 action 工厂。命名空间与 `actions` 完全一致：`props` `inputs` `models` `slots` `attributes` `outputs` `events` `hooks` `providers` `class` `wrappers` `createOptions` `hideWhen` `disableWhen` `valueChange` `outputChange`。

动词含义（`set` / `patch` / `patchAsync` / `remove` / `mapAsync` / `merge`）见 [Action 速查表](zh/api/action-cheatsheet/)。

Valibot 官方 action（`v.minLength` / `v.check` / `v.transform` / `v.email` …）可以直接混进 actions 数组，回调参数会拿到该路径的精确 value 类型。

## 注意

- **必须使用返回值**，原 schema 不被修改。
- action 工厂的调用要写在本次的 actions 数组里，提前存到变量会丢类型上下文。
- 同一路径写多条 entry、同一工厂调多次，都会叠加生效；字段声明顺序不受影响。
- 不支持在带 `fallback` / `cache` 的节点下继续下钻（会抛错）。
- 本 pipe **不绑定组件**，`inputs` / `outputs` 的 key 不做校验。需要按组件收窄 key 与值类型，见对应框架的组件版封装。

## 相关文档

- [Action 速查表](zh/api/action-cheatsheet/) — 命名空间与动词全览
- [路径查询](zh/api/path-querying/) — `#` / `..` / `@别名`
- [Angular：typedFieldComponentPipe](zh/angular/typed-field-component-pipe/) — 组件 + field 双强类型的 Angular 版

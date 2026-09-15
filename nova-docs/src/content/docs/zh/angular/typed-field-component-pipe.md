---
title: "typedFieldComponentPipe — 组件 + field 双强类型"
---

`@piying/view-angular` 专用。在 `typedFieldPipe` 的基础上多传一个「组件」，让 `inputs` / `outputs` 的 key 和值类型也跟着组件走。

通用版见 [typedFieldPipe](zh/api/typed-field-pipe/)。

## 输入

1. schema
2. 组件配置：`fieldGlobalConfig` 本身，或 `typedComponent({ types: { ... } })` 的返回值
3. 回调：返回 `[路径, 组件, actions[]]` 组成的数组

比通用版多一个「组件」参数。组件可以传 `types` 里的 key，也可以直接传组件类。

## 输出

一个新的 schema，每条 entry 自动带上 `setComponent(组件)`，保证「校验用的类型」就是「真正渲染的组件」。**必须使用返回值**，原 schema 不会被修改。

## 例子

```typescript
import * as v from 'valibot';
import { typedComponent, typedFieldComponentPipe } from '@piying/view-angular';

const typeDefine = typedComponent({
  types: {
    test1: { type: Test1Component },
    emit1: { type: Emit1Component },
  },
});

const merged = typedFieldComponentPipe(schema, typeDefine, (d) => [
  // 组件写 'test1'，inputs 的 key 就只能是 Test1Component 的 input
  d(['num'], 'test1', [
    d.inputs.patch({ input1: 'abc' }),
    d.inputs.patchAsync({ input1: (field) => `字段 ${field.key}` }),
    d.inputs.remove(['input1']),
    d.inputs.mapAsync((field) => (value) => ({ ...value, input1: 'mapped' })),
  ]),

  // 也可以直接传组件类
  d(['e'], Emit1Component, [
    d.outputs.merge({ output1: (data) => console.log(data) }),
    d.outputs.mergeAsync({
      output1: (field) => (data) => console.log(field.fullPath, data),
    }),
    d.outputChange((fn) => fn([{ list: undefined, output: 'output1' }])),
  ]),
]);
```

`outputChange` 监听的 output 名同样锁定在本条 entry 的组件上。

路径写法与可用的 Action 工厂命名空间与通用版完全一致，见 [typedFieldPipe](zh/api/typed-field-pipe/)。

## 注意

- **必须使用返回值**，原 schema 不被修改。
- action 工厂的调用要写在本次的 actions 数组里，提前存到变量会丢类型上下文。
- 同一路径写多条 entry、同一工厂调多次，都会叠加生效；字段声明顺序不受影响。
- 组件推不出来时不会封死：`inputs` / `outputs` 退化成普通 key / value 对象，其余功能照常，只是不再校验 key。
- 回调里的 `field` 是只读的：读值、读状态、`field.get()` 查其他字段都可以，改配置靠返回的 Action 下发。

## 相关文档

- [typedFieldPipe](zh/api/typed-field-pipe/) — 通用版（框架无关）
- [工具函数](zh/angular/tools/) — `typedComponent` / `nfcComponent`
- [Action 速查表](zh/api/action-cheatsheet/) — 命名空间与动词全览

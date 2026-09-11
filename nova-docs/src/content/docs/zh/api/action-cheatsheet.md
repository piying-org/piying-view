---
title: "Action 速查表"
---

本页把散落在各文档里的 Action 汇总成一张表，方便快速查「我要做 X，该用哪个 Action」。

## 通用操作语义

绝大多数 `actions.*` 命名空间共享同一组动词，含义固定：

| 操作 | 语义 | 参数形态 |
| ---- | ---- | -------- |
| `set` | **整体覆盖**当前值 | 普通对象 |
| `patch` | **合并**到当前值（浅合并） | 普通对象 |
| `remove` | **移除**指定的键 | 键名数组 |
| `patchAsync` | 按字段**动态求值**后合并 | `{ key: (field) => 值 \| Promise \| Observable \| Signal }` |
| `mapAsync` | 对**整个已有值**做函数式变换 | `(field) => (value) => 新值` |
| `merge` | **叠加**而非覆盖（新旧都执行） | 仅 `outputs` 支持 |

> ⚠️ 三个容易混的：
> - `set` 覆盖整个对象，`patch` 只合并传入的键
> - `patchAsync` 是「值可以是异步的」，`mapAsync` 是「对整包做变换」
> - `merge` 只有 `outputs` 有，用于让多个处理器同时生效

---

## 命名空间 × 操作 支持矩阵

✅ = 支持，— = 不支持

| 命名空间 | `set` | `patch` | `patchAsync` | `remove` | `mapAsync` | 特殊操作 |
| -------- | :---: | :-----: | :----------: | :------: | :--------: | -------- |
| `actions.inputs` | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| `actions.attributes` | ✅ | ✅ | ✅ | ✅ | ✅ | `top.set` / `top.patch` |
| `actions.props` | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| `actions.models` | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| `actions.events` | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| `actions.slots` | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| `actions.outputs` | ✅ | ✅ | ✅ | ✅ | ✅ | `merge` / `mergeAsync` |
| `actions.wrappers` | ✅ | ✅ | ✅ | ✅ | — | `changeAsync` |
| `actions.hooks` | ✅ | ✅ | — | ✅ | — | `merge`（可带 `position`） |
| `actions.providers` | ✅ | ✅ | — | — | — | `change` |
| `actions.createOptions` | ✅ | ✅ | — | — | — | — |
| `actions.directives`（仅 Angular） | ✅ | ✅ | ✅ | ✅ | — | — |
| `actions.class` | — | — | — | — | — | 见下方专节 |

### `actions.class` 专用操作

| 操作 | 作用目标 |
| ---- | -------- |
| `top(className, merge?)` | 最外层 wrapper；无 wrapper 时为字段组件本身 |
| `bottom(className, merge?)` | 字段组件本身 |
| `component(className, merge?)` | 字段组件本身（与 `bottom` 等价） |
| `asyncTop(fn)` | 最外层容器，`fn(field)` 返回 class |
| `asyncBottom(fn)` / `asyncComponent(fn)` | 字段组件本身，`fn(field)` 返回 class |

> `top` / `bottom` 指**包裹层级的上下**，不是页面视觉上的顶部/底部。

---

## 顶层 Action（不在 `actions` 命名空间下）

这些是独立导出的函数，直接 `v.pipe()` 使用：

| Action | 作用 | 详情 |
| ------ | ---- | ---- |
| `setComponent(type)` | 指定渲染组件（字符串 key 或组件类） | [setComponent](zh/api/setcomponent/) |
| `formConfig(config)` | 表单行为：禁用 / 校验 / 值转换 / 更新时机 | [formConfig](zh/api/form-config/) |
| `renderConfig({ hidden })` | 是否渲染该字段（静态） | [renderConfig](zh/api/render-config/) |
| `rawConfig(fn)` | 直接改底层配置对象 | [rawConfig](zh/api/raw-config/) |
| `layout({ priority, keyPath })` | 排序与位置移动 | [Layout metadata](zh/api/layout/) |
| `setAlias(name)` | 给字段设别名，供 `@name` 查询 | [路径查询](zh/api/path-querying/) |
| `hideWhen(options)` | 条件隐藏（可同时禁用） | [hideWhen/disableWhen](zh/api/hide-disable/) |
| `disableWhen(options)` | 条件禁用 | [hideWhen/disableWhen](zh/api/hide-disable/) |
| `valueChange(fn)` | 值监听，无副作用 | [hideWhen/disableWhen](zh/api/hide-disable/) |
| `outputChange(fn)` | 监听组件输出事件 | [hideWhen/disableWhen](zh/api/hide-disable/) |
| `nonFieldControl(bool)` | 标记为非表单控件 | [组件使用](zh/scenarios/component-use/) |
| `asControl()` | Group/Array 不展开，作为单个控件 | [asControl / asVirtualGroup](zh/scenarios/as-control-group/) |
| `asVirtualGroup()` | Intersect 子级作为普通 Group | [asControl / asVirtualGroup](zh/scenarios/as-control-group/) |
| `condition({ environments, actions })` | 按环境条件执行 Actions | [核心工具函数](zh/api/core-utils/) |
| `NFCSchema` | 非表单控件的 schema 常量 | [组件使用](zh/scenarios/component-use/) |
| `nfcComponent(input)` | 非表单控件组件快捷写法 | [工具函数](zh/angular/tools/) |

> 已废弃的顶层别名：`setHooks` / `patchHooks` / `mergeHooks` / `removeHooks`，请改用 `actions.hooks.set/patch/merge/remove`。

---

## 执行顺序与合并规则

```
最终 Actions 列表 = [...全局默认 Actions, ...Schema 中定义的 Actions]
```

- 全局默认来自 `fieldGlobalConfig.types[key].actions` 与 `fieldGlobalConfig.wrappers[key].actions`
- **全局在前，用户定义在后**；后执行的 Action 覆盖先执行的
- 所以用户 Schema 里的 `actions.inputs.set({ a: 1 })` 会盖掉全局的 `{ a: 0 }`

详见 [fieldGlobalConfig](zh/api/global-config/)。

---

## 该用哪一个？

| 我想做的事 | 用 |
| ---------- | -- |
| 给组件传配置值 | `actions.inputs` |
| 设置原生 HTML 属性 / `data-*` / ARIA | `actions.attributes` |
| 加 CSS class | `actions.class` |
| 绑定 DOM 原生事件（click 等） | `actions.events` |
| 接收组件 `@Output()` 事件 | `actions.outputs` |
| 双向绑定（`ngModel` / `model()` / `v-model`） | `actions.models` |
| 传模板插槽 | `actions.slots` |
| 存自定义配置供 `field.props()` 读 | `actions.props` |
| 包一层 label / 卡片 | `actions.wrappers` |
| 挂生命周期回调 | `actions.hooks` |
| 给字段注入业务服务 | `actions.providers` |
| 给字段附加自定义指令（Angular） | `actions.directives` |

### `inputs` / `attributes` / `props` 怎么分

| | 落到哪里 | 谁能读到 |
| - | -------- | -------- |
| `inputs` | 组件的 `@Input()` | 组件自身 |
| `attributes` | DOM 宿主元素的 attribute | DOM / CSS / 测试 |
| `props` | 字段配置对象 | 组件与包装器通过 `field.props()` |

> 理论上 `props` 能包办一切，但拆成多种是为了语义清晰。优先用语义最贴合的那个。

## 相关文档

- [fieldGlobalConfig](zh/api/global-config/) — 全局默认与合并规则
- [inputs](zh/api/inputs/) / [outputs](zh/api/outputs/) / [models](zh/api/models/)
- [attributes](zh/api/attributes/) / [CSS class](zh/api/css-class/) / [props](zh/api/props/)
- [Wrappers](zh/api/wrappers/) / [Hooks](zh/api/hooks/) / [Providers](zh/api/providers/)

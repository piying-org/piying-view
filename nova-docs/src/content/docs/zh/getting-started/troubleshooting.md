---
title: "常见错误与排查"
---

本文汇总 Piying-View 运行时的真实报错信息（含 emoji 前缀）与高频「不报错但不符合预期」的现象，帮助你快速定位问题。

## 报错速查表

| 报错信息 | 出处 | 直接原因 |
| -------- | ---- | -------- |
| `🈳define:[xxx]❗` | 组件渲染 | `types` 里没有该 key，组件类型仍是字符串没被解析成组件 |
| `🈳wrapper:[xxx]❗` | Wrapper 查找 | `actions.wrappers` 引用了未在 `fieldGlobalConfig.wrappers` 注册的包装器 |
| `🏷️ fieldControl❗` | `[formControl]` 指令 | 把 Group / Array 等非叶子控件绑到了 `[formControl]` |
| `📍 fieldControlBind:[...]->[...]❗` | `[formControl]` 指令 | 目标字段根本没有控件（非表单控件 / `nonFieldControl`） |
| `移动视图项失败` | `layout` | `layout({ keyPath })` 的目标路径查询不到任何父级 |
| `change wrapper not found` | `wrappers.changeAsync` | 定位函数返回了空，没找到要修改的 wrapper |
| `child index not found` | 路径计算 | 控件与其父级 children 的对应关系被破坏 |
| `action:[xxx]❗` | JSON Schema 转换 | JSON 里写了自定义 action，但没在 `customActions` 中注册 |
| `未知类型:xxx` | JSON Schema 转换 | JSON Schema 的 `type` 无法识别 |
| `options multi conflict` | JSON Schema 转换 | 单选/多选配置互相冲突 |
| `patternProperties->xxx: 定义未找到` | JSON Schema 转换 | `patternProperties` 引用了不存在的定义 |
| `依赖->xxx: 定义未找到` | JSON Schema 转换 | 关键字依赖的字段定义缺失 |

---

## 一、渲染类问题

### 1. `🈳define:[xxx]❗`

**含义**：库拿到了一个**字符串**类型的组件定义，但没能把它换成真实组件。

```
🈳define:[my-input]❗
```

**排查顺序**：

1. `options.fieldGlobalConfig.types` 是否传了？
2. key 拼写是否和 `setComponent('my-input')` **完全一致**（区分大小写）？
3. `types` 的值是否写成了裸组件类？必须是 `{ type: 组件 }` 对象：

```typescript
// ❌ 错误：直接给组件类
fieldGlobalConfig: { types: { 'my-input': MyInputComponent } }

// ✅ 正确：包一层 { type }
fieldGlobalConfig: { types: { 'my-input': { type: MyInputComponent } } }
```

### 2. `🈳wrapper:[xxx]❗`

**含义**：`actions.wrappers` 引用了未注册的包装器名。

```typescript
actions.wrappers.set(['card']); // 💥 🈳wrapper:[card]❗
```

**解决**：在 `fieldGlobalConfig.wrappers` 中注册同名包装器。

```typescript
fieldGlobalConfig: {
  wrappers: {
    card: { type: CardWrapperComponent },
  },
}
```

### 3. `change wrapper not found`

出现在 `actions.wrappers.changeAsync(indexFn, actions)`：`indexFn` 返回了空值。

```typescript
// ❌ 当前字段只有一个 wrapper，取 [5] 得到 undefined
actions.wrappers.changeAsync((list) => list[5], [actions.inputs.set({ a: 1 })]);

// ✅ 先确认存在再定位
actions.wrappers.changeAsync((list) => list[0], [actions.inputs.set({ a: 1 })]);
```

---

## 二、绑定类问题（手动模式）

### 4. `🏷️ fieldControl❗`

**含义**：`[formControl]` 只能绑定**叶子控件**（`FieldControl`），你绑的是 Group / Array。

```html
<!-- ❌ 根字段是 FieldGroup -->
<input [formControl]="field()" />
```

**解决**：用 `path` 定位到叶子字段。

```html
<input [formControl]="field()" [path]="['name']" />
```

### 5. `📍 fieldControlBind:[a]->[b]❗`

**含义**：路径能查到字段，但该字段**没有 `form.control`**。常见于：

- 该字段是 `NFCSchema` / `nonFieldControl()` 定义的**非表单控件**
- 路径写错，查到了一个不存在的字段

**排查**：先打印确认。

```typescript
const target = field().get(['b']);
console.log(target?.form.control); // undefined 说明它不是表单控件
```

非表单控件应该用 `[fieldTemplate]` 渲染，而不是 `[formControl]`。

---

## 三、布局类问题

### 6. `移动视图项失败`

**含义**：`layout({ keyPath })` 指定的目标位置查不到父级。

```typescript
// ❌ '@section' 别名从未通过 setAlias 定义
layout({ keyPath: ['@section'] });
```

**排查清单**：

1. 用了 `@alias` → 确认对应字段上有 `setAlias('section')`
2. 用了 `..` → 确认层级真的存在，`['..','..']` 已经到顶还会再往上就会失败
3. 目标字段是否被 `hideWhen` / 条件渲染掉了

> `layout` 的完整语义见 [API: Layout metadata](zh/api/layout/)，路径规则见 [API: 路径查询](zh/api/path-querying/)。

---

## 四、值与 model 的问题（不报错，但不符合预期）

### 7. 输入了内容，`model` 却不更新

**这是设计如此**：`PiyingView` 只在**整个表单无错误**时才向外发射 `modelChange`。

```typescript
// 库内实现（简化）
if (result.form.control?.valueNoError$$()) {
  this.modelChange.emit(value);
}
```

所以只要**任意字段验证不通过**，`[(model)]` 就不会同步。

**想看中间态**，改用控件级监听：

```typescript
import { valueChange } from '@piying/view-angular-core';

v.pipe(
  v.string(),
  valueChange((fn) =>
    fn().subscribe(({ list }) => console.log('实时值:', list[0])),
  ),
);
```

或直接拿控件：`field.form.control.valueChanges`。

### 8. 禁用字段的值「消失」了

由 `disabledValue` 策略决定：

| `disabledValue` | 禁用时的行为 |
| --------------- | ------------ |
| `'reserve'`（默认） | 保留值，照常输出 |
| `'delete'` | 不输出该字段的值 |

```typescript
formConfig({ disabled: true, disabledValue: 'delete' });
```

### 9. 空数组 / 空对象输出 `undefined`

给 `emptyValue` 兜底：

```typescript
v.pipe(v.array(v.string()), formConfig({ emptyValue: [] }));
```

### 10. 模型里多出来的键被吃掉了

由 `groupMode` 决定（schema 自动推导）：

| Schema | `groupMode` | 多余键 |
| ------ | ----------- | ------ |
| `v.object()` | `default` | 丢弃 |
| `v.looseObject()` | `loose` | 保留 |
| `v.strictObject()` | `strict` | 验证失败 |

详见 [对象组高级用法](zh/scenarios/object-group-advanced/)。

---

## 五、监听类问题

### 11. 第一次回调收到 `undefined`

`valueChange` / `hideWhen` / `disableWhen` 初始化时会带初始值触发一次；未设默认值时即为 `undefined`。

**两种解法**：

```typescript
// 方式一：Action 自带开关
hideWhen({
  listen: (fn) =>
    fn({ list: [['..', 'a']], skipInitValue: true }).pipe(map((i) => !i.list[0])),
});

// 方式二：RxJS 跳过
fn({ list: [['..', 'a']] }).pipe(skip(1), map((i) => !i.list[0]));
```

### 12. 监听不到别的字段

`['aa']` 查的是**当前级别的子级**，不是兄弟字段。查同级必须加 `..`：

```typescript
fn({ list: [['aa']] });        // ❌ 查自己的子级 aa
fn({ list: [['..', 'aa']] }); // ✅ 查同级 aa
```

---

## 六、JSON Schema 转换类

### 13. `action:[xxx]❗`

JSON 里写了 `actions: [{ "name": "myAction" }]`，但转换时没注册：

```typescript
jsonSchemaToValibot(jsonSchema, {
  customActions: {
    myAction: () => v.title('自定义'),
  },
});
```

### 14. `未知类型:xxx`

`type` 字段值不在支持列表（`string` / `number` / `integer` / `boolean` / `null` / `object` / `array`）内。

### 15. `options multi conflict`

同一处同时表达了单选与多选语义，需去掉冲突的一方。

> JSON Schema 的完整限制（互斥模式、嵌套限制、`$ref` 单文件）见 [JSON Schema 支持](zh/getting-started/jsonschema/)。

---

## 调试技巧

| 手段 | 用法 |
| ---- | ---- |
| 看解析结果 | `console.log(field.origin)` — 保留了解析前的原始数据，仅供调试 |
| 看控件 | `field.form.control` / `field.form.root` |
| 看状态 | `control.status$$()` → `'VALID' \| 'INVALID' \| 'PENDING'` |
| 看错误 | `control.errors`（`PENDING` 时为 `undefined`，属正常） |
| 查字段 | `field.get(['..', 'name'])` / `field.get(['#', 'a', 'b'])` |
| 确认类型解析 | 报 `🈳define` 时，先打印 `options.fieldGlobalConfig.types` 确认 key |

> ⚠️ `control.errors` 在异步验证期间返回 `undefined`，别误判成「没有错误」；要区分状态请用 `status$$()`。

## 相关文档

- [两种使用模式](zh/getting-started/two-modes/) — 自动 / 手动模式边界
- [核心概念](zh/getting-started/core-concept/) — Schema → Field → Component 解析链
- [AbstractControl](zh/api/control-api/) — 值 / 状态 / 验证 API
- [路径查询](zh/api/path-querying/) — `..` / `#` / `@alias` 规则

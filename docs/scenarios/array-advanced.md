# 数组高级用法

本文介绍 Piying-View 中数组的高级特性：增删改操作、deletionMode、groupMode 等。

## 数组基本操作

Piying-View 的 FieldArray 提供以下操作方法：

### set — 设置指定索引的值

直接调用 `field.action.set(value, index)`：

```typescript
field.action.set('newValue', 0); // 将索引 0 的值设为 'newValue'
```

支持跳过前面的元素直接插入：

```typescript
field.action.set('value', 5); // 在索引 5 处设置值
```

### remove — 删除指定索引的元素

直接调用 `field.action.remove(index)`：

```typescript
field.action.remove(0); // 删除索引 0 的元素
```

### updateValue — 整体替换数组

直接调用 `field.form.control.updateValue(value)`：

```typescript
field.form.control.updateValue(['a', 'b', 'c']); // 完全替换数组内容
```

### clear — 清空数组

直接调用 `field.form.control.clear()`：

```typescript
field.form.control.clear(); // 清空所有元素
```

### reset — 重置到初始值

```typescript
const obj = v.pipe(v.optional(v.array(v.string()), ['default1', 'default2']));

field.form.root.updateValue(['a', 'b']);
expect(field.form.root.value).toEqual(['a', 'b']);

field.form.root.reset(); // 重置为默认值
expect(field.form.root.value).toEqual(['default1', 'default2']);
```

## deletionMode — 删除模式

控制数组元素被删除后的处理方式。

### shrink（默认）— 收缩模式

删除元素后，数组长度自动缩短：

```typescript
const obj = v.pipe(
  v.array(v.string()),
  formConfig({ deletionMode: 'shrink' }), // 默认值，可省略
);
field.form.control!.updateValue(['a', 'b', 'c']);
// ['a', 'b', 'c']

// 删除索引 1 → ['a', 'c']（长度从 3 变为 2）
```

### mark — 标记模式

删除元素后，该位置的值设为 `undefined`，数组长度保持不变：

```typescript
const obj = v.pipe(v.tuple([v.number(), v.string()]), formConfig({ deletionMode: 'mark' }));
field.form.control!.updateValue([1, 'v2']);
// 0 → [undefined, 'v2']（长度仍为 2）
```

## groupMode — 组验证模式

控制 Group / Array 的验证行为。`groupMode` 在解析 schema 时自动推导，无需手动赋值。

| Schema 类型                      | 自动解析的 `groupMode` | 说明                         |
| -------------------------------- | ---------------------- | ---------------------------- |
| `v.object()`                     | `'default'`            | 标准对象，校验字段完整性     |
| `v.loose_object()`               | `'loose'`              | 宽松对象，允许多余字段       |
| `v.strict_object()`              | `'strict'`             | 严格对象，拒绝多余字段       |
| `v.tuple()`                      | `'default'`            | 固定长度元组                 |
| `v.loose_tuple()`                | `'loose'`              | 宽松元组                     |
| `v.strict_tuple()`               | `'strict'`             | 严格元组                     |
| `v.array()` / `v.rest()`         | `'reset'`              | 数组/可变尾部，值变更时重置  |
| `v.intersect()` + `asVirtualGroup()` | 可手动配置         | 等价于`v.object()`           |

### 自动推导示例

```typescript
import * as v from 'valibot';

// v.loose_object() 自动解析为 groupMode: 'loose'
const schema = v.loose_object({ a: v.string() });
field.form.root.updateValue({ a: '11', extra: 'ignored' });
 // ✅ loose 模式，验证通过
```

### 手动覆盖示例

```typescript
import * as v from 'valibot';
import { formConfig, asVirtualGroup } from '@piying/view-angular-core';

// intersect + asVirtualGroup 默认需要所有子 schema 通过，可手动配置 loose 模式放松验证
const schema = v.pipe(v.intersect([v.object({ a: v.string() })]), asVirtualGroup(), formConfig({ groupMode: 'loose' }));

field.form.root.updateValue({ a: '11' });
// ✅ 宽松模式验证通过
```

### emptyValue — 空值回退

当验证失败时，使用 `emptyValue` 作为回退值：

```typescript
const obj = v.pipe(v.object({ a: v.pipe(v.number(), v.maxValue(5)) }), formConfig({ emptyValue: {} }));

field.form.control!.viewValueChange({ a: 6 }); // 超出最大值，验证失败
```

## Array 属性

FieldArray 提供便捷的数组相关属性：

| 属性                     | 类型             | 说明                             |
| ------------------------ | ---------------- | -------------------------------- |
| `field.length`           | `number`         | 数组长度（不包含标记删除的）     |
| `field.controls`         | `FieldControl[]` | 当前子控件列表                   |
| `field.fixedControls$()` | `FieldControl[]` | 固定子控件（不含 rest children） |
| `field.resetControls$()` | `FieldControl[]` | 所有可重置子控件                 |

## Tuple 与 TupleWithRest

### Tuple — 固定长度元组

```typescript
const obj = v.tuple([v.string(), v.number()]);
// [string, number] → 两个固定位置的字段
```

### TupleWithRest — 元组 + 可变尾部

```typescript
const obj = v.pipe(v.tupleWithRest([v.string()], v.number()), setComponent('array'));

field.form.control!.updateValue(['v1', 0, 1]);
expect(field.fixedChildren?.().length).toEqual(1); // 固定部分：1 个
expect(field.restChildren?.().length).toEqual(2); // 可变尾部：2 个
expect(field.form.control!.value).toEqual(['v1', 0, 1]);
```

## 完整示例

```typescript
import * as v from 'valibot';
import { formConfig } from '@piying/view-angular-core';

const schema = v.object({
  // 普通数组 + 标记删除模式
  tags: v.pipe(v.array(v.string()), formConfig({ deletionMode: 'mark' })),

  // 可选数组 + 默认值
  scores: v.pipe(v.optional(v.array(v.number()), [0, 0])),

  // 元组（固定位置）
  position: v.tuple([v.number(), v.number()]),

  // 元组 + 可变尾部
  coordinates: v.pipe(v.tupleWithRest([v.string()], v.number()), setComponent('array')),

  // 嵌套对象（使用 loose_object 自动解析为 loose 模式）
  groups: v.pipe(v.array(v.loose_object({ name: v.string() })), v.optional(v.array(v.loose_object({ name: v.string() })), [])),
});
```

## 示例

```typescript
// Array set + remove
const field$ = Promise.withResolvers<_PiResolvedCommonViewFieldConfig>();
const obj = v.object({
  key1: v.pipe(v.array(v.string()), getField(field$)),
});

field.action.set('11', 1); // 在索引 1 设置 '11'
field.action.remove(0); // 删除索引 0
```

## 下一步

- [Record Schema 动态对象组](record-dynamic-group.md) — 动态键值对表单
- [API: FieldFormConfig](../api/field-config.md) — deletionMode / groupMode / emptyValue 配置详解

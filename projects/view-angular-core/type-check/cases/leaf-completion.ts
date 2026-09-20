import * as v from 'valibot';
import { createConvertToField, setComponent } from '@piying/view-angular-core';

const Schema = v.object({
  text1: v.pipe(v.optional(v.string()), v.title('text1-label')),
  number1: v.pipe(v.number(), v.title('number1')),
  radio1: v.pipe(
    v.optional(v.picklist(['v1', 'v2'])),
    setComponent('radio'),
    v.title('radio1-title'),
  ),
  checkbox1: v.optional(v.boolean()),
  nested: v.object({ bb: v.number(), deep: v.object({ cc: v.string() }) }),
});
const field = createConvertToField({} as any)(() => Schema);

// @complete 根级: 给出 # 与全部根 key; 根无父, 不给 ..
//   include: #, checkbox1, number1, radio1, text1
//   forbid: ..
const c1 = field.get(['<|>']);

// @complete 叶子(裸 optional)之后: 只剩 .., 不再补任何字段键
//   include: ..
//   forbid: checkbox1, number1, radio1, text1, nested, #
const c2 = field.get(['checkbox1', '<|>']);

// @complete 叶子(pipe + setComponent)之后: 同样只剩 ..
//   include: ..
//   forbid: checkbox1, number1, radio1, text1, nested, #
const c3 = field.get(['radio1', '<|>']);

// @complete 叶子(pipe + title)之后: 同样只剩 ..
//   include: ..
//   forbid: checkbox1, number1, radio1, text1, nested, #
const c4 = field.get(['text1', '<|>']);

// @complete 组之后: 只补该组子 key 与 ..
//   include: bb, deep, ..
//   forbid: checkbox1, number1, radio1, text1, nested, #
const c5 = field.get(['nested', '<|>']);

// @complete '#' 之后: 根级 key 全部可联想(核心回归点)
//   include: checkbox1, number1, radio1, text1, nested
//   forbid: #
const c6 = field.get(['#', '<|>']);

// @complete '#' 之后再下钻组: 只补该组子 key
//   include: bb, deep, ..
//   forbid: checkbox1, number1, radio1, text1, nested, #
const c7 = field.get(['#', 'nested', '<|>']);

// @expect-error 叶子再下钻自身
//   pattern: is not assignable
// @ts-expect-error 见上两行标记
const e1 = field.get(['checkbox1', 'checkbox1']);

// @expect-error pipe 包装的叶子再下钻
//   pattern: is not assignable
// @ts-expect-error 见上两行标记
const e2 = field.get(['radio1', 'radio1']);

// @expect-error '#' 出现在非首位
//   pattern: is not assignable
// @ts-expect-error 见上两行标记
const e3 = field.get(['nested', '#']);

export { c1, c2, c3, c4, c5, c6, c7, e1, e2, e3 };

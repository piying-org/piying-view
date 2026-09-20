import * as v from 'valibot';
import { createConvertToField } from '@piying/view-angular-core';

const Schema = v.object({
  text1: v.optional(v.string()),
  number1: v.number(),
  nested: v.object({ bb: v.number(), deep: v.object({ cc: v.string() }) }),
});
const xxx = createConvertToField({} as any)(() => Schema);

// @complete 根级: 给出 # 与全部根 key; 根无父, 不给 ..
//   include: #, text1, number1, nested
//   forbid: ..
const c1 = xxx.get(['<|>']);

// @complete '#' 之后: 根级 key 全部可联想(核心回归点)
//   include: text1, number1, nested
const c2 = xxx.get(['#', '<|>']);

// @complete '#' 之后再下钻: 给出该组子 key
//   include: bb, deep
const c3 = xxx.get(['#', 'nested', '<|>']);

// @complete 普通下钻: 给出该组子 key 与 ..
//   include: bb, deep, ..
//   forbid: #
const c4 = xxx.get(['nested', '<|>']);

// @complete '#' 只允许第 0 位: 更深处不再联想 #
//   forbid: #
const c5 = xxx.get(['nested', 'deep', '<|>']);

// @complete '#' 后遇叶子: 补全走按位并集, 锁住「已知宽松度」
//   snapshot: .., bb, cc, deep, nested, number1, text1
const c6 = xxx.get(['#', 'text1', '<|>']);

export { c1, c2, c3, c4, c5, c6 };

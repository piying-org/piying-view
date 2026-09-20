import * as v from 'valibot';
import { createConvertToField } from '@piying/view-angular-core';

const Schema = v.object({
  text1: v.optional(v.string()),
  number1: v.number(),
  nested: v.object({ bb: v.number(), deep: v.object({ cc: v.string() }) }),
});
const xxx = createConvertToField({} as any)(() => Schema);

// @expect-error '#' 出现在非首位
//   pattern: Type '"#"' is not assignable
// @ts-expect-error 见上两行标记
const e1 = xxx.get(['nested', '#']);

// @expect-error 一条路径里出现多个 '#'
//   pattern: Type '"#"' is not assignable
// @ts-expect-error 见上两行标记
const e2 = xxx.get(['#', '#', 'text1']);

// @expect-error 叶子之后再下钻: 叶子后只允许 '..'
//   pattern: Type '"number1"' is not assignable
// @ts-expect-error 见上两行标记
const e3 = xxx.get(['number1', 'number1']);

// @expect-error '#' 回到根后, 叶子再下钻
//   pattern: Type '"text1"' is not assignable
// @ts-expect-error 见上两行标记
const e4 = xxx.get(['#', 'text1', 'text1']);

// @expect-error 未知键
//   pattern: Type '"zzz"' is not assignable
// @ts-expect-error 见上两行标记
const e5 = xxx.get(['zzz']);

// @expect-no-error 常规下钻不该报错
const ok1 = xxx.get(['nested', 'deep', 'cc']);

// @expect-no-error '#' 在第 0 位合法
const ok2 = xxx.get(['#', 'nested', 'deep', 'cc']);

// @expect-no-error 上溯在余额内合法
const ok3 = xxx.get(['nested', 'deep', '..', '..']);

export { e1, e2, e3, e4, e5, ok1, ok2, ok3 };

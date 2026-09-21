import {
  Assertion,
  CompleteAssertion,
  cursorSpan,
  ExpectErrorAssertion,
  ExpectNoErrorAssertion,
} from './markers';
import { FileChecker } from './service';

export type CaseResult = {
  name: string;
  ok: boolean;
  detail: string[];
  actual?: string;
};

const eqSet = (a: string[], b: string[]) =>
  JSON.stringify([...a].sort()) === JSON.stringify([...b].sort());

function checkComplete(
  a: CompleteAssertion,
  checker: FileChecker,
  text: string,
): CaseResult {
  const got = checker.completionsAt(a.pos);
  const missing = a.include.filter((n) => !got.includes(n));
  const leaked = a.forbid.filter((n) => got.includes(n));
  const snapBad = a.snapshot !== undefined && !eqSet(a.snapshot, got);

  const detail: string[] = [];
  if (missing.length) detail.push(`缺少联想: ${missing.join(', ')}`);
  if (leaked.length) detail.push(`不该出现: ${leaked.join(', ')}`);
  if (snapBad)
    detail.push(`快照不符, 期望 [${[...a.snapshot!].sort().join(', ')}]`);

  return { name: a.name, ok: !detail.length, detail, actual: got.join(', ') };
}

function checkExpectError(
  a: ExpectErrorAssertion,
  checker: FileChecker,
): CaseResult {
  const hits = checker.diagnostics().filter((d) => d.line === a.line);
  const matched = a.pattern
    ? hits.filter((d) => d.message.includes(a.pattern as string))
    : hits;

  if (!matched.length) {
    const detail = [`期望报错但未报错`];
    if (hits.length)
      detail.push(`该行有错但消息不含「${a.pattern}」: ${hits[0].message}`);
    return { name: a.name, ok: false, detail };
  }
  return { name: a.name, ok: true, detail: [], actual: matched[0].message };
}

function checkExpectNoError(
  a: ExpectNoErrorAssertion,
  checker: FileChecker,
  ignore: { start: number; end: number }[],
): CaseResult {
  const hits = checker
    .diagnostics()
    .filter(
      (d) =>
        d.line === a.line &&
        !ignore.some((s) => d.start >= s.start && d.start < s.end),
    );
  if (hits.length) {
    return {
      name: a.name,
      ok: false,
      detail: ['不该报错但报错了'],
      actual: hits[0].message,
    };
  }
  return { name: a.name, ok: true, detail: [] };
}

/** 跑一个文件里的全部断言 */
export function runAssertions(
  assertions: Assertion[],
  checker: FileChecker,
  text: string,
): CaseResult[] {
  // 游标字符串本身可能是非法 token, 那些位置的诊断对 no-error 断言不算数
  const cursorIgnores = assertions
    .filter((a): a is CompleteAssertion => a.kind === 'complete')
    .map((a) => cursorSpan(text, a.pos));

  return assertions.map((a) => {
    if (a.kind === 'complete') return checkComplete(a, checker, text);
    if (a.kind === 'expect-error') return checkExpectError(a, checker);
    return checkExpectNoError(a, checker, cursorIgnores);
  });
}

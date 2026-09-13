import * as v from 'valibot';
import { createImpasseAction } from '../../../adapter/util/validation';

/**
 * createImpasseAction 产出的 issue 形态。
 * label 不会单独保留, 只被拼进 message; received 未传时回退为输入值的字符串化结果。
 */
type ImpasseIssue = {
  kind: 'validation';
  type: 'raw_check';
  input: unknown;
  expected: string;
  received: unknown;
  message: string;
};

const firstIssue = (
  issues: [v.BaseIssue<unknown>, ...v.BaseIssue<unknown>[]],
): ImpasseIssue => issues[0] as unknown as ImpasseIssue;

describe('createImpasseAction', () => {
  it('无前置错误时必定报错', () => {
    const define = v.pipe(v.number(), createImpasseAction<number>('k1', 123));
    const result = v.safeParse(define, 1);
    expect(result.success).toBeFalse();
    expect(result.issues![0].message).toContain('impasse:k1');
  });

  it('issue 携带 expected / received', () => {
    const result = v.safeParse(
      v.pipe(v.number(), createImpasseAction<number>('k1', 123)),
      1,
    );
    const issue = firstIssue(result.issues!);
    expect(issue.kind).toBe('validation');
    expect(issue.type).toBe('raw_check');
    expect(issue.expected).toBe('[no validation conflict]');
    expect(issue.received).toBe(123);
    expect(issue.message).toContain('impasse:k1');
  });

  it('已有前置错误时直接跳过, 不重复追加', () => {
    const define = v.pipe(
      v.number(),
      v.minValue(100),
      createImpasseAction<number>('k1'),
    );
    const result = v.safeParse(define, 1);
    expect(result.success).toBeFalse();
    expect(
      result.issues!.some((i) => `${i.message}`.includes('impasse:k1')),
    ).toBeFalse();
  });

  it('未传 value 时 received 回退为输入值', () => {
    const result = v.safeParse(
      v.pipe(v.number(), createImpasseAction<number>('k2')),
      1,
    );
    const issue = firstIssue(result.issues!);
    expect(issue.message).toContain('impasse:k2');
    expect(issue.received).toBe('1');
  });

  it('不同 key 生成不同 label', () => {
    const a = v.safeParse(v.pipe(v.number(), createImpasseAction<number>('a')), 1);
    const b = v.safeParse(v.pipe(v.number(), createImpasseAction<number>('b')), 1);
    expect(firstIssue(a.issues!).message).toContain('impasse:a');
    expect(firstIssue(b.issues!).message).toContain('impasse:b');
  });
});

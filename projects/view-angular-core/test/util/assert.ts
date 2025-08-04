import { BaseIssue } from 'valibot';

export function assertIssues(
  input: any,
): asserts input is BaseIssue<any>['issues'] {
  if (!input || !Array.isArray(input)) {
    throw new Error('valibot Issues验证失败');
  }
  expect('message' in input[0]).toBeTrue();
  expect(input[0].kind).toBe('validation');
  expect('input' in input[0]).toBeTrue();
}

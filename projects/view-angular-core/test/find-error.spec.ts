import * as v from 'valibot';
import { findError } from '@piying/view-angular-core';
import type {
  ValidationCommonError2,
  ValidationErrorError2,
  ValidationErrors2,
  ValidationValibotError2,
} from '../field/abstract_model';
import { Equal } from './util/type-assert';

describe('findError', () => {
  const valibotIssues = v.safeParse(v.string(), 1)!.issues!;

  const list: ValidationErrors2[] = [
    { kind: 'validation', message: 'other' },
    {
      kind: 'valibot',
      metadata: valibotIssues as ValidationValibotError2['metadata'],
    },
    { kind: 'error', metadata: new Error('boom') },
  ];

  it('list 为 undefined 时返回 undefined', () => {
    expect(findError(undefined, 'valibot')).toBeUndefined();
  });

  it('按 kind 命中对应错误', () => {
    expect(findError(list, 'validation')?.kind).toBe('validation');
    expect(findError(list, 'valibot')?.kind).toBe('valibot');
    expect(findError(list, 'error')?.kind).toBe('error');
  });

  it('未命中时返回 undefined', () => {
    expect(findError(list, 'notExist')).toBeUndefined();
  });

  it('返回类型按 key 收窄到具体错误形态', () => {
    const valibot = findError(list, 'valibot');
    const err = findError(list, 'error');
    const common = findError(list, 'validation');

    const isValibot: Equal<
      typeof valibot,
      ValidationValibotError2 | undefined
    > = true;
    const isError: Equal<typeof err, ValidationErrorError2 | undefined> = true;
    const isCommon: Equal<typeof common, ValidationCommonError2 | undefined> =
      true;
    expect([isValibot, isError, isCommon]).toEqual([true, true, true]);

    // 收窄后 metadata 直接是各自的具体类型, 无需断言
    expect(valibot?.metadata.length).toBe(valibotIssues.length);
    expect(err?.metadata.message).toBe('boom');
  });
});

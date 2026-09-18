import * as v from 'valibot';
import { setAlias } from '@piying/view-angular-core';
import type {
  FieldPathToken,
  InferAliasMap,
  KeyPath,
} from '@piying/view-angular-core';
import { createBuilder } from '../util/create-builder';
import { Equal } from '../util/type-assert';

const root = v.object({
  aa: v.string(),
  nested: v.object({ bb: v.number(), deep: v.object({ cc: v.string() }) }),
  list: v.array(v.object({ dd: v.pipe(v.string(), setAlias('ddAlias')) })),
});

type RootTok = FieldPathToken<typeof root, InferAliasMap<typeof root>>;

describe('强类型推断: get 路径补全 token', () => {
  it('token 覆盖当前层与所有后代层的对象键', () => {
    const t1: RootTok = 'aa';
    const t2: RootTok = 'nested';
    const t3: RootTok = 'bb';
    const t4: RootTok = 'deep';
    const t5: RootTok = 'cc';
    const t6: RootTok = 'list';
    const t7: RootTok = 'dd';
    expect([t1, t2, t3, t4, t5, t6, t7]).toEqual([
      'aa',
      'nested',
      'bb',
      'deep',
      'cc',
      'list',
      'dd',
    ]);
    // @ts-expect-error 未定义的键不应进入补全集合
    const bad: RootTok = 'zzz';
  });

  it('特殊 token # / .. 与数字下标始终可用', () => {
    const t1: RootTok = '#';
    const t2: RootTok = '..';
    const t3: RootTok = 0;
    expect([t1, t2, t3]).toEqual(['#', '..', 0]);
  });

  it('别名 token 按作用域进入补全集合', () => {
    // 数组项属于内层作用域, 根级拿不到 @ddAlias
    // @ts-expect-error @ddAlias 不在根作用域内
    const notInRoot: RootTok = '@ddAlias';

    const builder = createBuilder(root);
    builder.form.control?.updateValue({ list: [{ dd: 'x' }] });
    const item = builder.get(['list', 0])!;
    const aliased = item.get(['@ddAlias']);
    expect(aliased?.keyPath).toEqual(['dd']);
    const aliasedValue = aliased!.form.control!.value;
    const eq: Equal<typeof aliasedValue, string> = true;
    expect(aliasedValue).toBe('x');
    expect(eq).toBe(true);
  });

  it('字面量路径的推导结果不受 token 约束影响', () => {
    const builder = createBuilder(root);
    builder.form.control?.updateValue({
      aa: 'v1',
      nested: { bb: 2, deep: { cc: 'v3' } },
      list: [{ dd: 'v4' }],
    });

    const aaValue = builder.get(['aa'])!.form.control!.value;
    const aaEq: Equal<typeof aaValue, string> = true;
    // @ts-expect-error aa 是 string, 不是 number
    const aaWrong: number = aaValue;

    const ccValue = builder.get(['nested', 'deep', 'cc'])!.form.control!.value;
    const ccEq: Equal<typeof ccValue, string> = true;
    // @ts-expect-error cc 是 string, 不是 number
    const ccWrong: number = ccValue;

    const bbValue = builder.get(['nested', 'bb'])!.form.control!.value;
    const bbEq: Equal<typeof bbValue, number> = true;

    const deep = builder.get(['nested', 'deep'])!;
    const fromRootValue = deep.get(['#', 'aa'])!.form.control!.value;
    const fromRootEq: Equal<typeof fromRootValue, string> = true;

    expect([aaEq, ccEq, bbEq, fromRootEq]).toEqual([true, true, true, true]);
    expect([aaValue, ccValue, bbValue, fromRootValue]).toEqual([
      'v1',
      'v3',
      2,
      'v1',
    ]);
  });

  it('record / intersect / union 的键与下标进入补全集合', () => {
    const rec = v.object({
      map: v.record(v.string(), v.object({ mm: v.number() })),
      mix: v.intersect([
        v.object({ p: v.string() }),
        v.object({ q: v.number() }),
      ]),
      or: v.union([v.object({ x: v.string() }), v.object({ y: v.number() })]),
    });
    type Tok = FieldPathToken<typeof rec, InferAliasMap<typeof rec>>;
    const t1: Tok = 'map';
    const t2: Tok = 'mm';
    const t3: Tok = 'mix';
    const t4: Tok = 'p';
    const t5: Tok = 'or';
    const t6: Tok = 'x';
    const t7: Tok = 1;
    expect([t1, t2, t3, t4, t5, t6, t7].length).toBe(7);
  });

  it('未知键仍然合法, 只是退化为宽松类型(向后兼容)', () => {
    const builder = createBuilder(root);
    const unknownKey = builder.get(['zzz']);
    expect(unknownKey).toBeUndefined();
    const unknownValue = unknownKey?.form.control?.value;
    expect(unknownValue).toBeUndefined();
  });

  it('动态 KeyPath 变量仍然合法', () => {
    const builder = createBuilder(root);
    builder.form.control?.updateValue({ aa: 'v1' });
    const path: KeyPath = ['aa'];
    const field = builder.get(path);
    expect(field?.keyPath).toEqual(['aa']);
    expect(field?.form.control?.value).toBe('v1');
  });

  it('schema 为 any 时不收紧路径', () => {
    const builder = createBuilder(v.any());
    const field = builder.get(['whatever', 3]);
    expect(field).toBeUndefined();
  });

  it('get([]) 类型退化为自身所在层, 且不报错', () => {
    const builder = createBuilder(root);
    const self = builder.get([]);
    expect(self).toBeUndefined();
    const deep = builder.get(['nested', 'deep'])!;
    const selfFromDeep = deep.get([]);
    expect(selfFromDeep).toBeUndefined();
  });
});

import * as v from 'valibot';
import { setAlias } from '@piying/view-angular-core';
import type {
  DotPathTokens,
  FieldPathToken,
  InferAliasMap,
  KeyPath,
} from '@piying/view-angular-core';
import { createBuilder } from '../util/create-builder';
import { Equal, IsAny, Val } from '../util/type-assert';

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

  it('特殊 token # / .. 与数字下标在公开 token 集合中可用', () => {
    // FieldPathToken 是公开的原始 token 集合, AllowParent 默认 true
    const t1: RootTok = '#';
    const t2: RootTok = '..';
    const t3: RootTok = 0;
    expect([t1, t2, t3]).toEqual(['#', '..', 0]);
  });

  it('FieldPathToken 显式关闭 AllowParent 后不再包含 ..', () => {
    type NoParentTok = FieldPathToken<
      typeof root,
      InferAliasMap<typeof root>,
      false
    >;
    const t1: NoParentTok = '#';
    const t2: NoParentTok = 'aa';
    const t3: NoParentTok = 0;
    expect([t1, t2, t3]).toEqual(['#', 'aa', 0]);
    // @ts-expect-error 关掉 AllowParent 后 '..' 不在集合内
    const bad: NoParentTok = '..';
    expect(bad as unknown).toBe('..');
  });

  it('根级字段写 .. 直接编译报错', () => {
    const builder = createBuilder(root);

    // 越界路径在编译期就被拦住, 不该进入运行时, 所以只写不跑
    const unreachable = () => {
      // @ts-expect-error 根级没有父字段, '..' 越界
      builder.get(['..']);
      // @ts-expect-error 带剩余路径同样越界
      builder.get(['..', 'aa']);
      // @ts-expect-error '#' 落到根后, 再 '..' 依旧越界
      builder.get(['#'])!.get(['..']);
    };

    expect(unreachable).toBeInstanceOf(Function);
  });

  it('下钻撑出额度, 超出后报错', () => {
    type RootPath = DotPathTokens<typeof root, typeof root, any, {}>;

    // 下钻一层 → 能上退一层
    const ok1: RootPath = ['aa', '..'];
    const ok2: RootPath = ['nested', 'deep', 'cc', '..', '..', '..'];

    // @ts-expect-error 未下钻就上退
    const bad1: RootPath = ['..'];
    // @ts-expect-error 下钻 1 层却上退 2 层
    const bad2: RootPath = ['aa', '..', '..'];
    // @ts-expect-error 下钻 2 层却上退 3 层
    const bad3: RootPath = ['nested', 'deep', '..', '..', '..'];
    // @ts-expect-error '#' 只允许出现在第 0 位
    const bad4: RootPath = ['aa', '..', '#', 'nested'];

    expect(ok1.length + ok2.length).toBe(8);
    expect(
      [bad1 as unknown, bad2 as unknown, bad3 as unknown, bad4 as unknown]
        .length,
    ).toBe(4);
  });

  it("'#' 重置余额后再上退: 调用处直接编译报错", () => {
    const builder = createBuilder(root);
    // '#' 把余额清零, 再上退就是越界
    const unreachable = () => {
      // @ts-expect-error '#' 之后上退越界
      builder.get(['aa', '..', '#', '..', '..']);
    };
    expect(unreachable).toBeInstanceOf(Function);
  });

  it("'#' 在根级仍合法(空操作), 结果层解得出根字段", () => {
    const builder = createBuilder(root);
    builder.form.control?.updateValue({
      aa: 'v1',
      nested: { bb: 2, deep: { cc: 'v3' } },
      list: [{ dd: 'v4' }],
    });

    const viaHash = builder.get(['#'])!;
    const viaHashEq: Equal<
      Val<typeof viaHash.form.control>,
      v.InferOutput<typeof root>
    > = true;
    expect(viaHash.fullPath).toEqual([]);
    expect(viaHashEq).toBe(true);

    // 带后续路径照常下钻
    expect(
      builder.get(['#', 'nested', 'deep', 'cc'])!.form.control!.value,
    ).toBe('v3');
    // '#' 不在第 0 位: 字面量元组被类型拦住,
    // 但运行时不约束 —— 走通用 KeyPath 依旧能解出根字段
    const midHash: KeyPath = ['nested', '#'];
    expect(builder.get(midHash)!.fullPath).toEqual([]);
  });

  it('非根级 .. 不受影响, 且能逐级上溯到根后被止住', () => {
    const builder = createBuilder(root);
    builder.form.control?.updateValue({
      aa: 'v1',
      nested: { bb: 2, deep: { cc: 'v3' } },
      list: [{ dd: 'v4' }],
    });

    // 子级 '..' 回到根
    const child = builder.get(['nested'])!;
    const toRoot = child.get(['..'])!;
    const toRootEq: Equal<
      Val<typeof toRoot.form.control>,
      v.InferOutput<typeof root>
    > = true;
    expect(toRoot.fullPath).toEqual([]);
    expect(toRootEq).toBe(true);

    // 到了根之后不能再往上退(编译期拦住, 不执行)
    const unreachableAfterRoot = () => {
      // @ts-expect-error 已在根, 上溯越界
      toRoot.get(['..']);
    };
    expect(unreachableAfterRoot).toBeInstanceOf(Function);

    // 孙级 '..' 拿父级(deep), 类型依旧精确
    const grand = builder.get(['nested', 'deep', 'cc'])!;
    const parent = grand.get(['..'])!;
    const parentEq: Equal<
      Val<typeof parent.form.control>,
      { cc: string }
    > = true;
    expect(parent.fullPath).toEqual(['nested', 'deep']);
    expect(parentEq).toBe(true);

    // 多级上溯仍然可用
    const two = grand.get(['..', '..'])!;
    expect(two.fullPath).toEqual(['nested']);
    const three = grand.get(['..', '..', '..'])!;
    expect(three.fullPath).toEqual([]);
  });

  it('别名落点不是根时, 其 .. 仍可用', () => {
    const builder = createBuilder(root);
    builder.form.control?.updateValue({ list: [{ dd: 'v4' }] });

    const item = builder.get(['list', 0])!;
    const aliased = item.get(['@ddAlias'])!;
    expect(aliased.fullPath).toEqual(['list', 0, 'dd']);

    // 别名字段的父级是数组项, 不是根
    const up = aliased.get(['..'])!;
    expect(up.fullPath).toEqual(['list', 0]);
    // 别名跳转会丢失父链信息, 类型落回宽松而不是报错
    const upLoose: IsAny<Val<typeof up.form.control>> = true;
    expect(upLoose).toBe(true);
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

  it('未知字面量键直接编译报错', () => {
    const builder = createBuilder(root);
    // @ts-expect-error 'zzz' 不在 token 集合内
    const bad = builder.get(['zzz']);
    expect(bad).toBeUndefined();
  });

  it('叶子之后再下钻: 补全集合不再给出任何字段键', () => {
    type RootPath = DotPathTokens<typeof root, typeof root, any, {}>;

    // 叶子自身 / 叶子之后上溯回根, 依旧合法
    const ok1: RootPath = ['aa'];
    const ok2: RootPath = ['aa', '..'];

    // @ts-expect-error aa 是叶子, 第 2 位不该有字段键
    const bad1: RootPath = ['aa', 'aa'];
    // @ts-expect-error aa 是叶子, 第 2 位不该有兄弟键
    const bad2: RootPath = ['aa', 'nested'];
    // @ts-expect-error '#' 只允许出现在第 0 位
    const badHash: RootPath = ['aa', '#'];
    // @ts-expect-error deep 是叶子, 第 4 位不该有字段键
    const bad3: RootPath = ['nested', 'deep', 'cc', 'cc'];

    expect([ok1.length, ok2.length]).toEqual([1, 2]);
    expect(
      [bad1 as unknown, bad2 as unknown, badHash as unknown, bad3 as unknown]
        .length,
    ).toBe(4);
  });

  it('叶子之后再下钻: 调用处直接编译报错', () => {
    const builder = createBuilder(root);
    const unreachable = () => {
      // @ts-expect-error '#' 之后 aa 仍是叶子, 再下钻解不出字段
      builder.get(['#', 'aa', 'aa']);
    };
    expect(unreachable).toBeInstanceOf(Function);
  });

  it('叶子之后再下钻: 运行时同样查不到字段', () => {
    const builder = createBuilder(root);
    builder.form.control?.updateValue({
      aa: 'v1',
      nested: { bb: 2, deep: { cc: 'v3' } },
      list: [{ dd: 'v4' }],
    });
    expect(builder.get(['aa', 'aa'] as any)).toBeUndefined();
    expect(builder.get(['nested', 'bb', 'x'] as any)).toBeUndefined();
    expect(builder.get(['nested', 'deep', 'cc', 'cc'] as any)).toBeUndefined();
  });

  it('根级上溯越界: 运行时直接抛错', () => {
    const builder = createBuilder(root);
    expect(() => builder.get(['..'] as any)).toThrowError(/无法继续上溯/);
    expect(() => builder.get(['#', '..'] as any)).toThrowError(/无法继续上溯/);
  });

  it('动态 KeyPath 变量走 get, 拿通用字段类型', () => {
    const builder = createBuilder(root);
    builder.form.control?.updateValue({ aa: 'v1' });
    const path: KeyPath = ['aa'];
    const field = builder.get(path);
    const notAny: IsAny<typeof field> = false;
    expect(field?.keyPath).toEqual(['aa']);
    expect(field?.form.control?.value).toBe('v1');
    expect(notAny).toBe(false);
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

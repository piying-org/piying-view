import { TestBed } from '@angular/core/testing';
import * as v from 'valibot';
import { convertToField } from '@piying/view-angular';
import { setAlias } from '@piying/view-angular-core';
import type { FieldPathToken, InferAliasMap } from '@piying/view-angular-core';
import { Equal } from '@piying/view-angular-core/test';

const schema = v.object({
  aa: v.string(),
  nested: v.object({ bb: v.number(), deep: v.object({ cc: v.string() }) }),
  list: v.array(v.object({ dd: v.pipe(v.string(), setAlias('ddAlias')) })),
});

describe('convertToField: get 路径补全与强类型', () => {
  function setup() {
    const field = TestBed.runInInjectionContext(() =>
      convertToField(() => schema),
    );
    field.form.control?.updateValue({
      aa: 'v1',
      nested: { bb: 2, deep: { cc: 'v3' } },
      list: [{ dd: 'v4' }],
    });
    return field;
  }

  it('convertToField 返回的 field 上, 路径字面量可被补全', () => {
    type Tok = FieldPathToken<typeof schema, InferAliasMap<typeof schema>>;
    const tokens: Tok[] = [
      'aa',
      'nested',
      'bb',
      'deep',
      'cc',
      'list',
      'dd',
      '#',
      '..',
    ];
    expect(tokens.length).toBe(9);
    // @ts-expect-error 未定义的键不应进入补全集合
    const bad: Tok = 'zzz';
  });

  it('get 各层路径的 value 类型精确', () => {
    const field = setup();

    const aaValue = field.get(['aa'])!.form.control!.value;
    const aaEq: Equal<typeof aaValue, string> = true;
    // @ts-expect-error aa 是 string, 不是 number
    const aaWrong: number = aaValue;

    const ccValue = field.get(['nested', 'deep', 'cc'])!.form.control!.value;
    const ccEq: Equal<typeof ccValue, string> = true;

    const itemValue = field.get(['list', 0, 'dd'])!.form.control!.value;
    const itemEq: Equal<typeof itemValue, string> = true;

    expect([aaEq, ccEq, itemEq]).toEqual([true, true, true]);
    expect(aaValue).toBe('v1');
    expect(ccValue).toBe('v3');
    expect(itemValue).toBe('v4');
  });

  it('从子级用 # / .. 跳转后类型依旧精确', () => {
    const field = setup();
    const deep = field.get(['nested', 'deep'])!;

    const fromRoot = deep.get(['#', 'aa'])!;
    const fromRootValue = fromRoot.form.control!.value;
    const fromRootEq: Equal<typeof fromRootValue, string> = true;

    const fromParent = deep.get(['..', 'bb'])!;
    const fromParentValue = fromParent.form.control!.value;
    const fromParentEq: Equal<typeof fromParentValue, number> = true;

    expect([fromRootEq, fromParentEq]).toEqual([true, true]);
    expect(fromRootValue).toBe('v1');
    expect(fromParentValue).toBe(2);
  });

  it('别名路径在可访问作用域内补全并解析', () => {
    const field = setup();
    const item = field.get(['list', 0])!;
    const aliased = item.get(['@ddAlias'])!;
    expect(aliased.keyPath).toEqual(['dd']);
    const value = aliased.form.control!.value;
    const eq: Equal<typeof value, string> = true;
    expect(value).toBe('v4');
    expect(eq).toBe(true);
  });

  it('未知键 / 动态路径不会因补全约束而报错', () => {
    const field = setup();
    expect(field.get(['zzz'])).toBeUndefined();

    const path: (string | number)[] = ['aa'];
    expect(field.get(path)?.form.control?.value).toBe('v1');
  });
});

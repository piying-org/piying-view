import { ɵUnwrapDirectiveSignalInputs } from '@angular/core';
import {
  _PiResolvedCommonViewFieldConfig,
  InferAliasMap,
  KeyPath,
  PiFieldAtPath,
} from '@piying/view-angular-core';
import { Equal, IsAny, Val } from '@piying/view-angular-core/test';
import {
  PiyingFieldControlBindDirective,
  PiyingFieldTemplateDirective,
} from '@piying/view-angular';
import { typedRoot } from './schema';

type BindT = _PiResolvedCommonViewFieldConfig<
  typeof typedRoot,
  typeof typedRoot,
  any,
  InferAliasMap<typeof typedRoot>
>;
const bind = (): BindT => null!;

/**
 * 复刻 Angular TCB 对泛型指令的实例化: `_ctorN({ 输入名: 绑定表达式 })`。
 * 未绑定的输入不参与推断, 故用 Partial 表达。
 */
type TcbInit<
  D,
  Req extends keyof D,
  Opt extends keyof D,
> = ɵUnwrapDirectiveSignalInputs<D, Req> &
  Partial<ɵUnwrapDirectiveSignalInputs<D, Opt>>;

const fieldTemplateCtor = <S, P extends KeyPath = []>(
  _init: TcbInit<PiyingFieldTemplateDirective<S, P>, 'fieldTemplate', 'path'>,
): PiyingFieldTemplateDirective<S, P> => null!;

const formControlCtor = <S, P extends KeyPath = []>(
  _init: TcbInit<PiyingFieldControlBindDirective<S, P>, 'formControl', 'path'>,
): PiyingFieldControlBindDirective<S, P> => null!;

type GotField<T extends { field$$(): any }> = NonNullable<
  ReturnType<T['field$$']>
>;
type ControlOf<F> = F extends { form: { control?: infer C } } ? C : never;

describe('typed export 类型推断: #x="fieldTemplate" / #x="formControl"', () => {
  it('fieldTemplate 未绑定 path 时, field$$() 即绑定字段自身', () => {
    const t = fieldTemplateCtor({ fieldTemplate: bind() });
    const eq: Equal<
      GotField<typeof t>,
      PiFieldAtPath<typeof typedRoot, []>
    > = true;
    const notAny: IsAny<GotField<typeof t>> = false;
    expect([eq, notAny]).toEqual([true, false]);
  });

  it('fieldTemplate 绑定 path 后, field$$() 与 builder.get(path) 完全等价', () => {
    const t = fieldTemplateCtor({
      fieldTemplate: bind(),
      path: ['list', 0, 'c'],
    });
    const eq: Equal<
      GotField<typeof t>,
      PiFieldAtPath<typeof typedRoot, ['list', 0, 'c']>
    > = true;
    expect(eq).toBe(true);

    // 直接声明类型同样成立(自动实例化)
    const got = null as unknown as GotField<typeof t>;
    const typed: PiFieldAtPath<typeof typedRoot, ['list', 0, 'c']> = got;
    expect(typed).toBeNull();
  });

  it('fieldTemplate 的 value 类型精确到具体类型', () => {
    const t = fieldTemplateCtor({ fieldTemplate: bind(), path: ['n'] });
    const v: Equal<Val<ControlOf<GotField<typeof t>>>, number> = true;
    const notStr: Equal<Val<ControlOf<GotField<typeof t>>>, string> = false;
    expect([v, notStr]).toEqual([true, false]);
  });

  it('fieldTemplate 支持 @别名 路径', () => {
    const t = fieldTemplateCtor({ fieldTemplate: bind(), path: ['@bb'] });
    const eq: Equal<
      GotField<typeof t>,
      PiFieldAtPath<typeof typedRoot, ['@bb']>
    > = true;
    const v: Equal<Val<ControlOf<GotField<typeof t>>>, string> = true;
    expect([eq, v]).toEqual([true, true]);
  });

  it('formControl 绑定 path 后, field$$() 与 builder.get(path) 完全等价', () => {
    const f = formControlCtor({ formControl: bind(), path: ['a'] });
    const eq: Equal<
      GotField<typeof f>,
      PiFieldAtPath<typeof typedRoot, ['a']>
    > = true;
    const v: Equal<Val<ControlOf<GotField<typeof f>>>, string> = true;
    expect([eq, v]).toEqual([true, true]);
  });

  it('formControl 未绑定 path 时, field$$() 即绑定字段自身', () => {
    const f = formControlCtor({ formControl: bind() });
    const eq: Equal<
      GotField<typeof f>,
      PiFieldAtPath<typeof typedRoot, []>
    > = true;
    expect(eq).toBe(true);
  });

  it('不同 path 推导出的类型互不相等(断言可判别)', () => {
    const t = fieldTemplateCtor({ fieldTemplate: bind(), path: ['n'] });
    const wrong: Equal<
      GotField<typeof t>,
      PiFieldAtPath<typeof typedRoot, ['a']>
    > = false;
    const wrongVal: Equal<Val<ControlOf<GotField<typeof t>>>, string> = false;
    expect([wrong, wrongVal]).toEqual([false, false]);
  });
});

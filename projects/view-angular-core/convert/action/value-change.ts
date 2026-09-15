import { combineLatest, map, Observable, skip } from 'rxjs';
import {
  PiFieldGet,
  PiFieldValueOf,
  PiFieldScopeOf,
  _PiResolvedCommonViewFieldConfig,
} from '../../builder-base';
import { mergeHooksFn } from './hook';
import { rawConfig } from './raw-config';
import { ListenPath, ToKeyPath } from '../../util';
import type { PathsOf } from './typed-field-pipe';

type IsAny<T> = 0 extends 1 & T ? true : false;

/** 宽松路径: 作用域 schema 拿不准时的兜底, 保证旧写法不报错 */
type LoosePath = readonly (string | number)[];

/** 一个作用域 schema 往下可写的路径; any 时退成宽松形态 */
type ScopePaths<S> = IsAny<S> extends true ? LoosePath : PathsOf<S>;

/** 别名路径: ['@别名', ...该别名目标 schema 的路径] */
type AliasListenPaths<AliasMap> = AliasMap extends readonly (infer M)[]
  ? M extends Record<string, any>
    ? {
        [K in keyof M & string]: [`@${K}`, ...ScopePaths<M[K]>];
      }[keyof M & string]
    : never
  : never;

/**
 * 单条监听路径的补全候选 —— 与运行时 `field.get` 的寻址方式一一对应:
 * `undefined`(自身) / 当前作用域往下 / `'#'` 根级 / `'..'` 父级 / `'@别名'`。
 *
 * 注: 作用域 schema 推不出来(any) 时整条退成 `LoosePath`, 保持宽松;
 * 但 schema 明确时, 不在候选里的路径会直接编译报错(包括 `['..','..',x]` 这类多级上溯)。
 */
export type ListenPathOf<F> =
  | undefined
  | ScopePaths<PiFieldScopeOf<F>['schema']>
  | ['#', ...ScopePaths<PiFieldScopeOf<F>['root']>]
  | ['..', ...ScopePaths<PiFieldScopeOf<F>['parent']>]
  | AliasListenPaths<PiFieldScopeOf<F>['alias']>;

/** list 里的一条: undefined 表示监听自身, 其余为 field.get(path) 的路径 */
export type ValueChangeListenPath = ListenPath | undefined;

/** 未绑定具体路径时的兜底形态(保持宽松) */
export type AnyListenList = readonly ValueChangeListenPath[];

/**
 * 监听参数。
 *
 * L 是「路径元组」, 由调用 fn 时的字面量经 `const` 推断得出;
 * `list?: [...L]` 是元组推断的关键 —— 直接写 `L` 会被拓宽成数组而丢掉逐位类型。
 */
export interface ValueChangFnOptions<
  L extends readonly unknown[] = AnyListenList,
> {
  list?: [...L];
  skipInitValue?: boolean;
}

/** 路径元组 L -> 逐位对应的字段类型(undefined 即自身) */
export type ListenFieldsOf<F, L extends readonly unknown[]> = {
  [I in keyof L]: L[I] extends undefined ? F : PiFieldGet<F, ToKeyPath<L[I]>>;
};

/** 路径元组 L -> 逐位对应的 value 类型 */
export type ListenValuesOf<F, L extends readonly unknown[]> = {
  [I in keyof L]: PiFieldValueOf<ListenFieldsOf<F, L>[I]>;
};

/** valueChange 回调流里携带的一批字段 */
export interface ValueChangeStream<
  F,
  L extends readonly unknown[] = AnyListenList,
> {
  field: F;
  list: ListenValuesOf<F, L>;
  listenFields: ListenFieldsOf<F, L>;
}

/**
 * 监听函数: 传入路径元组, 返回与该元组逐位对齐的强类型流。
 * `const L` 保证 `['..', 'a']` 不会被拓宽成 `string[]`;
 * 约束落在 `ListenPathOf<F>` 上, 所以写 list 时能直接补全可监听的路径。
 */
export interface ValueChangeListenFn<F> {
  <const L extends readonly ListenPathOf<F>[] = [undefined]>(
    input?: ValueChangFnOptions<L>,
  ): Observable<ValueChangeStream<F, L>>;
}

export type ValueChangeFn<F = _PiResolvedCommonViewFieldConfig> = (
  fn: ValueChangeListenFn<F>,
  field: F,
) => void;

const DefaultSelfList: AnyListenList = [undefined];

export function valueChangeFn<const L extends AnyListenList = [undefined]>(
  field: _PiResolvedCommonViewFieldConfig,
  input: ValueChangFnOptions<L> = {},
): Observable<ValueChangeStream<_PiResolvedCommonViewFieldConfig, L>> {
  const paths = (input.list ?? DefaultSelfList) as AnyListenList;
  const listenFields = paths.map((keyPath) =>
    !keyPath ? field : field.get([...keyPath])!,
  );

  return combineLatest(
    listenFields.map((control) =>
      input.skipInitValue
        ? control.form.control!.valueChanges.pipe(skip(1))
        : control.form.control!.valueChanges,
    ),
  ).pipe(
    map((list) => ({ list, field, listenFields })),
  ) as unknown as Observable<
    ValueChangeStream<_PiResolvedCommonViewFieldConfig, L>
  >;
}

// TInput 必须只出现在返回类型: 直接写 v.pipe(schema, valueChange(..)) 时靠上下文反推,
// 一旦绑到参数上或加约束, pipe 上下文就推不出 TInput 了.
// 强类型 field 由门面 ActionFactories 负责, 不靠这个裸函数.
export function valueChange<TInput>(listenFn: ValueChangeFn) {
  return rawConfig<TInput>((field) => {
    mergeHooksFn(
      {
        allFieldsResolved: (field) => {
          listenFn((options) => valueChangeFn(field, options), field);
        },
      },
      { position: 'bottom' },
      field,
    );
  });
}

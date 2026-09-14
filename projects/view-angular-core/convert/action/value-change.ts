import { combineLatest, map, Observable, skip } from 'rxjs';
import { _PiResolvedCommonViewFieldConfig } from '../../builder-base';
import { mergeHooksFn } from './hook';
import { rawConfig } from './raw-config';
import { KeyPath } from '../../util';
export interface ValueChangFnOptions {
  list?: (KeyPath | undefined)[];
  skipInitValue?: boolean;
}

/** valueChange 回调流里携带的一批字段 */
export interface ValueChangeStream<F> {
  field: F;
  list: any[];
  listenFields: F[];
}

export type ValueChangeFn<F = _PiResolvedCommonViewFieldConfig> = (
  fn: (input?: ValueChangFnOptions) => Observable<ValueChangeStream<F>>,
  field: F,
) => void;
const DefaultSelfList = [undefined];
export function valueChangeFn(
  field: _PiResolvedCommonViewFieldConfig,
  input: ValueChangFnOptions = {},
) {
  const listenFields = (input.list ?? DefaultSelfList).map((keyPath) =>
    !keyPath ? field! : field.get(keyPath)!,
  );

  return combineLatest(
    listenFields.map((control) =>
      input.skipInitValue
        ? control.form.control!.valueChanges.pipe(skip(1))
        : control.form.control!.valueChanges,
    ),
  ).pipe(map((list) => ({ list, field, listenFields })));
}

// TInput 必须只出现在返回类型: 直接写 v.pipe(schema, valueChange(..)) 时靠上下文反推,
// 一旦绑到参数上或加约束, pipe 上下文就推不出 TInput 了.
// 强类型 field 山门面 ActionFactories 负责, 不靠这个裸函数.
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

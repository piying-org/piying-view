import { combineLatest, map, Observable, skip } from 'rxjs';
import { _PiResolvedCommonViewFieldConfig } from '../../builder-base';
import { mergeHooksFn } from './hook';
import { rawConfig } from './raw-config';
import { KeyPath } from '../../util';
export interface ValueChangFnOptions {
  list?: (KeyPath | undefined)[];
  skipInitValue?: boolean;
}
export interface ChangeWhenOption<
  T extends _PiResolvedCommonViewFieldConfig = _PiResolvedCommonViewFieldConfig,
> {
  fn: (
    fn: (input: ValueChangFnOptions) => Observable<{
      field: _PiResolvedCommonViewFieldConfig;
      input: ValueChangFnOptions;
    }>,
  ) => void;
}
export type ValueChangeFn = (
  fn: (input?: ValueChangFnOptions) => Observable<{
    field: _PiResolvedCommonViewFieldConfig;
    list: any[];
  }>,
  field: _PiResolvedCommonViewFieldConfig,
) => void;
const DefaultSelfList = [undefined];
export function valueChangeFn(
  field: _PiResolvedCommonViewFieldConfig,
  input: ValueChangFnOptions = {},
) {
  const list = (input.list ?? DefaultSelfList).map((keyPath) =>
    !keyPath ? field.form.control! : field.get(keyPath)!.form.control!,
  );

  return combineLatest(
    list.map((control) =>
      input.skipInitValue
        ? control.valueChanges.pipe(skip(1))
        : control.valueChanges,
    ),
  ).pipe(map((list) => ({ list, field, listenFields: list })));
}

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

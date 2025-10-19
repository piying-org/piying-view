import { combineLatest, map, Observable, skip } from 'rxjs';
import { _PiResolvedCommonViewFieldConfig } from '../../builder-base';
import { mergeHooksFn } from './hook';
import { rawConfig } from './raw-config';
import { KeyPath } from '../../util';
export interface ValueChangFnOptions {
  list?: (KeyPath | undefined)[];
  skipInitValue?: boolean;
}

export type ValueChangeFn = (
  fn: (input?: ValueChangFnOptions) => Observable<{
    field: _PiResolvedCommonViewFieldConfig;
    list: any[];
    listenFields: _PiResolvedCommonViewFieldConfig[];
  }>,
  field: _PiResolvedCommonViewFieldConfig,
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

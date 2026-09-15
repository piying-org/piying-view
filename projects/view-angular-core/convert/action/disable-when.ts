import { Observable } from 'rxjs';
import { _PiResolvedCommonViewFieldConfig } from '../../builder-base';
import { mergeHooksFn } from './hook';
import { ValueChangeListenFn, valueChangeFn } from './value-change';
import { rawConfig } from './raw-config';

export interface DisableWhenOption<
  T extends _PiResolvedCommonViewFieldConfig = _PiResolvedCommonViewFieldConfig,
> {
  listen: (fn: ValueChangeListenFn<T>, field: T) => Observable<boolean>;
}

// 同 valueChange: TInput 只出现在返回类型, 保证 v.pipe 上下文能反推.
export function disableWhen<TInput>(options: DisableWhenOption) {
  return rawConfig<TInput>((field) => {
    mergeHooksFn(
      {
        allFieldsResolved: (field) => {
          options
            .listen((options) => valueChangeFn(field, options), field)
            .subscribe((disabled) => {
              if (field.formConfig().disabled !== disabled) {
                field.formConfig.update((value) => ({
                  ...value,
                  disabled: disabled,
                }));
              }
            });
        },
      },
      { position: 'bottom' },
      field,
    );

    return field;
  });
}

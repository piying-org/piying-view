import { Observable } from 'rxjs';
import { _PiResolvedCommonViewFieldConfig } from '../../builder-base';
import { mergeHooksFn } from './hook';
import { valueChangeFn, ValueChangFnOptions } from './value-change';
import { rawConfig } from './raw-config';
export interface DisableWhenOption<
  T extends _PiResolvedCommonViewFieldConfig = _PiResolvedCommonViewFieldConfig,
> {
  listen: (
    fn: (input: ValueChangFnOptions) => Observable<{
      field: _PiResolvedCommonViewFieldConfig;
      list: any[];
      listenFields: _PiResolvedCommonViewFieldConfig[];
    }>,
    field: _PiResolvedCommonViewFieldConfig,
  ) => Observable<boolean>;
}

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

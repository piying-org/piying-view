import { Observable } from 'rxjs';
import { _PiResolvedCommonViewFieldConfig } from '../../builder-base';
import { mergeHooksFn } from './hook';
import { valueChangeFn, ValueChangFnOptions } from './value-change';
import { rawConfig } from './raw-config';
export interface HideWhenOption<
  T extends _PiResolvedCommonViewFieldConfig = _PiResolvedCommonViewFieldConfig,
> {
  disabled?: boolean;

  listen: (
    fn: (input: ValueChangFnOptions) => Observable<{
      field: _PiResolvedCommonViewFieldConfig;
      list: any[];
      listenFields: _PiResolvedCommonViewFieldConfig[];
    }>,
    field: _PiResolvedCommonViewFieldConfig,
  ) => Observable<boolean>;
}

export function hideWhen<TInput>(options: HideWhenOption) {
  return rawConfig<TInput>((field) => {
    mergeHooksFn(
      {
        allFieldsResolved: (field) => {
          options
            .listen((options) => valueChangeFn(field, options), field)
            .subscribe((hidden) => {
              field.renderConfig.update((value) =>
                !!value.hidden !== hidden
                  ? { ...value, hidden: hidden }
                  : value,
              );
              if (options.disabled !== undefined && field.formConfig) {
                field.formConfig.update((value) => {
                  value = { ...value };
                  value.disabled = hidden ? options.disabled! : false;
                  return value;
                });
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

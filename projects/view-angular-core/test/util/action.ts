import { RawConfigActionCommon } from '@piying/valibot-visit';
import {
  _PiResolvedCommonViewFieldConfig,
  mergeHooksFn,
  rawConfig,
} from '@piying/view-angular-core';
export type GetFieldType<T> = <B>(
  field$: PromiseWithResolvers<T>,
  hooks?:
    | 'allFieldsResolved'
    | 'fieldResolved'
    | 'beforeCreateComponent'
    | 'afterCreateComponent',
) => RawConfigActionCommon<B>;
export const getField: GetFieldType<_PiResolvedCommonViewFieldConfig> = (
  field$,
  hooks = 'allFieldsResolved',
) =>
  rawConfig((field) => {
    mergeHooksFn(
      {
        [hooks]: (field: any) => {
          field$.resolve(field as any);
        },
      },
      { position: 'bottom' },
      field,
    );
  });

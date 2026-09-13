import { RawConfigActionCommon } from '@piying/valibot-visit';
import { mergeHooksFn, rawConfig } from '@piying/view-angular-core';
export type GetFieldType<T> = <B>(
  field$: PromiseWithResolvers<T>,
  hooks?:
    | 'allFieldsResolved'
    | 'fieldResolved'
    | 'beforeCreateComponent'
    | 'afterCreateComponent',
) => RawConfigActionCommon<B>;
export const getField: GetFieldType<any> = (
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

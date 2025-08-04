import { RawConfigActionCommon } from '@piying/valibot-visit';
import {
  _PiResolvedCommonViewFieldConfig,
  rawConfig,
} from '@piying/view-angular-core';
export type GetFieldType<T> = <B>(
  field$: PromiseWithResolvers<T>,
  hooks?:
    | 'allInit'
    | 'fieldInit'
    | 'chilrenInit'
    | 'beforeComponent'
    | 'afterComponent',
) => RawConfigActionCommon<B>;
export const getField: GetFieldType<_PiResolvedCommonViewFieldConfig> = (
  field$,
  hooks = 'allInit',
) =>
  rawConfig((field) => {
    field.hooks ??= {};
    switch (hooks) {
      case 'allInit': {
        field.hooks.allFieldsResolved = (field) => {
          field$.resolve(field as any);
        };
        break;
      }
      case 'fieldInit': {
        field.hooks.fieldResolved = (field) => {
          field$.resolve(field as any);
        };
        break;
      }
      case 'chilrenInit': {
        field.hooks.afterChildrenInit = (field) => {
          field$.resolve(field as any);
        };
        break;
      }
      case 'afterComponent': {
        field.hooks.afterCreateComponent = (field) => {
          field$.resolve(field as any);
        };
        break;
      }
      case 'beforeComponent': {
        field.hooks.beforeCreateComponent = (field) => {
          field$.resolve(field as any);
        };
        break;
      }
    }
  });

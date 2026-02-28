import { summarize } from 'valibot';
import {
  AbstractControl,
  ValidationDescendantError2,
  ValidationErrors2,
  ValidationValibotError2,
} from '../field/abstract_model';
import { FieldArray } from '../field/field-array';
import { FieldLogicGroup } from '../field/field-logic-group';

export interface ErrorSummary {
  /** 方便判断是哪一个控件产生的异常 */
  debugPathList: string[];
  /** 可以用于直接get查询到当前配置 */
  queryPathList: (number | string)[];
  fieldList: AbstractControl[];
  item: Exclude<ValidationErrors2, ValidationDescendantError2>;
  valibotIssueSummary: string | undefined;
}
function errorItem(
  item: ValidationErrors2,
  prefixList: ValidationDescendantError2[],
  list: ErrorSummary[],
) {
  if (item.kind === 'descendant') {
    const item2 = item as ValidationDescendantError2;
    item2.metadata.forEach((child) => {
      errorItem(child, prefixList.slice().concat(item2), list);
    });
  } else {
    list.push({
      debugPathList: prefixList.map((item) => {
        const parentField = item.field.parent;
        if (parentField instanceof FieldLogicGroup) {
          return parentField.type() === 'and'
            ? `[∧${item.key}]`
            : `[∨${item.key}]`;
        } else if (parentField instanceof FieldArray) {
          return `[${item.key}]`;
        } else {
          return `${item.key}`;
        }
      }),
      queryPathList: prefixList.map((item) => item.key),
      fieldList: prefixList.map((item) => item.field),
      item: item,
      get valibotIssueSummary() {
        if (item.kind === 'valibot') {
          return summarize((item as ValidationValibotError2).metadata);
        }
        return undefined;
      },
    });
  }
}
export function errorSummary(control?: AbstractControl) {
  if (!control?.errors) {
    return [];
  }
  const list: ErrorSummary[] = [];
  for (const item of control.errors) {
    errorItem(item, [], list);
  }
  return list;
}

export const getDeepError = errorSummary;

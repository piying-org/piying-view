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
  pathList: string[];
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
      pathList: prefixList.map((item) => {
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

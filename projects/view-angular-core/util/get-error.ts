import { summarize } from 'valibot';
import {
  AbstractControl,
  ValidationDescendantError2,
  ValidationErrors2,
  ValidationValibotError2,
} from '../field/abstract_model';
import { FieldArray } from '../field/field-array';
import { FieldLogicGroup } from '../field/field-logic-group';
import { isFieldArray, isFieldGroup } from '../field/is-field';

export function getDeepError(control?: AbstractControl) {
  if (!control) {
    return [];
  }
  const list = [];
  const controlList = [control];
  while (controlList.length) {
    const control = controlList.shift()!;
    if (control.valid) {
      continue;
    }
    list.push({ control, errors: control.errors });
    if (isFieldArray(control) || isFieldGroup(control)) {
      Object.values(
        (control.activatedChildren$$ ?? control.children$$)(),
      ).forEach((control) => {
        controlList.push(control);
      });
    }
  }
  return list;
}
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
    let item2 = item as ValidationDescendantError2;
    item2.metadata.forEach((child) => {
      errorItem(child, prefixList.slice().concat(item2), list);
    });
  } else {
    list.push({
      pathList: prefixList.map((item) => {
        let parentField = item.field.parent;
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
  let list: ErrorSummary[] = [];
  for (const item of control.errors) {
    errorItem(item, [], list);
  }
  return list;
}

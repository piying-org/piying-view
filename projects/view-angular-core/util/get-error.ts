import { AbstractControl } from '../field/abstract_model';
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

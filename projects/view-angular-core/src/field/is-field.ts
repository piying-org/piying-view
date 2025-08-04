import { FieldArray } from './field-array';
import { FieldControl } from './field-control';
import { FieldGroup } from './field-group';
import { FieldLogicGroup } from './field-logic-group';

export function isFieldGroup(input: any): input is FieldGroup {
  return input instanceof FieldGroup;
}
export function isFieldArray(input: any): input is FieldArray {
  return input instanceof FieldArray;
}
export function isFieldControl(input: any): input is FieldControl {
  return input instanceof FieldControl;
}
export function isFieldLogicGroup(input: any): input is FieldLogicGroup {
  return input instanceof FieldLogicGroup;
}

import {
  FieldArray,
  FieldControl,
  FieldGroup,
  FieldLogicGroup,
  isFieldArray,
  isFieldControl,
  isFieldGroup,
  isFieldLogicGroup,
} from '@piying/view-angular-core';
declare const expect: any;
export function assertFieldGroup(input: any): asserts input is FieldGroup {
  if (!(input instanceof FieldGroup)) {
    throw new Error('FieldGroup验证失败');
  }
  expect(isFieldGroup(input)).toBeTrue();
}
export function assertFieldArray(input: any): asserts input is FieldArray {
  if (!(input instanceof FieldArray)) {
    throw new Error('FieldArray验证失败');
  }
  expect(isFieldArray(input)).toBeTrue();
}
export function assertFieldControl(input: any): asserts input is FieldControl {
  if (!(input instanceof FieldControl)) {
    throw new Error('FieldControl验证失败');
  }
  expect(isFieldControl(input)).toBeTrue();
}
export function assertFieldLogicGroup(
  input: any,
): asserts input is FieldLogicGroup {
  if (!(input instanceof FieldLogicGroup)) {
    throw new Error('FieldLogicGroup验证失败');
  }
  expect(isFieldLogicGroup(input)).toBeTrue();
}

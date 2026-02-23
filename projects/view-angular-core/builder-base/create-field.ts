import { Injector } from '@angular/core';
import { FieldArray } from '../field/field-array';
import { FieldControl } from '../field/field-control';
import { FieldGroup } from '../field/field-group';
import { FieldLogicGroup } from '../field/field-logic-group';
import { isFieldLogicGroup } from '../field/is-field';
import { FieldFormConfig$ } from '../field/type';
import { AbstractControl } from '../field/abstract_model';
import { AnyCoreSchemaHandle } from '../convert';
import { isArray, isGroup } from './util/is-group';
import { RawKeyPath } from '../util';
export function createField(
  parentForm: AbstractControl,
  field: AnyCoreSchemaHandle,
  /** 创建用 */
  key: RawKeyPath,
  formConfig$$: FieldFormConfig$,
  isRoot: boolean,
  injector: Injector,
) {
  let FieldClass;
  if (field.isLogicAnd || field.isLogicOr) {
    FieldClass = FieldLogicGroup;
  } else if (isGroup(field)) {
    FieldClass = FieldGroup;
  } else if (isArray(field) || field.isTuple) {
    FieldClass = FieldArray;
  } else {
    FieldClass = FieldControl;
  }
  let control;
  if (isRoot) {
    control = new (FieldClass as any)(
      field.checkSchema ?? field.sourceSchema,
      injector,
    ) as AbstractControl;
    if (isFieldLogicGroup(control)) {
      control.type.set(field.isLogicAnd ? 'and' : 'or');
    }
    control.initConfig(formConfig$$);
  } else {
    control = parentForm.get([key]);
    if (!control) {
      control = new (FieldClass as any)(
        field.checkSchema ?? field.sourceSchema,
        injector,
      ) as AbstractControl;
      if (isFieldLogicGroup(control)) {
        control.type.set(field.isLogicAnd ? 'and' : 'or');
      }
      parentForm.setControl?.(key as any, control);
      control.initConfig(formConfig$$);
    }
  }
  return control;
}

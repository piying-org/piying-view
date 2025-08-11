import { WritableSignal } from '@angular/core';
import {
  AbstractControl,
  AsyncValidatorFn,
  FormHooks,
  ValidatorFn,
} from './abstract_model';
import type { Observable, UnaryFunction } from 'rxjs';

export type DisabledValueStrategy = 'reserve' | 'delete';
export interface FieldTransformerConfig {
  toView?: (value: any, control: AbstractControl) => any;
  toModel?: (value: any, control: AbstractControl) => any;
}
export type LogicType = 'and' | 'or';
export type ArrayDeletionMode = 'shrink' | 'mark';
export interface FieldFormConfig<T = any> {
  disabled?: boolean;
  /** 删除时value应该如何处理 */
  disabledValue?: DisabledValueStrategy;
  transfomer?: FieldTransformerConfig;
  pipe?: { toModel?: UnaryFunction<Observable<any>, Observable<T>> };
  defaultValue?: any;
  validators?: ValidatorFn[];
  asyncValidators?: AsyncValidatorFn[];
  updateOn?: FormHooks;
  // activateIndex?: number;
  // type?: LogicType;
  /** auto */
  required?: boolean;
  /** array/group/logic group */
  emptyValue?: any;
  /** array  */
  deletionMode?: ArrayDeletionMode;
  /** group */
  groupMode?: 'loose' | 'default' | 'strict' | 'reset';
}

export type FieldFormConfig$ = WritableSignal<FieldFormConfig>;
export type FieldGroupConfig$ = WritableSignal<
  Omit<FieldFormConfig, 'defaultValue'>
>;
export type FieldArrayConfig$ = WritableSignal<
  Omit<FieldFormConfig, 'defaultValue'>
>;
export type FieldLogicGroupConfig$ = WritableSignal<
  Omit<FieldFormConfig, 'defaultValue'>
>;
export const enum UpdateType {
  init = 0,
  update = 1,
  reset = 2,
}
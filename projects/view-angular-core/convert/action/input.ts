import { Signal } from '@angular/core';
import { rawConfig } from './raw-config';
import {
  _PiResolvedCommonViewFieldConfig,
  CoreRawViewInputs,
} from '../../builder-base';
import { Observable } from 'rxjs';
import {
  actions,
  patchAsyncInputsCommon,
  removeInputsCommonFn,
} from './input-common';
// export const setInputs = actions.set.inputs;
// export const patchInputs = actions.patch.inputs;
// export const removeInputs = actions.remove.inputs;
export function setInputs<T>(inputs: CoreRawViewInputs) {
  return rawConfig<T>((field) => {
    field.inputs = inputs;
  });
}
export function patchInputs<T>(inputs: CoreRawViewInputs) {
  return rawConfig<T>((field) => {
    field.inputs = {
      ...field.inputs,
      ...inputs,
    };
  });
}
export const removeInputs = removeInputsCommonFn('inputs');
export type AsyncResult =
  | Promise<any>
  | Observable<any>
  | Signal<any>
  | (any & {});
export type AsyncProperty = (
  field: _PiResolvedCommonViewFieldConfig,
) => AsyncResult;

export const patchAsyncInputs = patchAsyncInputsCommon;

import {
  computed,
  isSignal,
  linkedSignal,
  Signal,
  WritableSignal,
} from '@angular/core';
import { rawConfig } from './raw-config';
import {
  _PiResolvedCommonViewFieldConfig,
  CoreRawViewInputs,
} from '../../builder-base';
import { mergeHooksFn } from './hook';
import { Observable } from 'rxjs';
import { isPromise, isSubscribable } from '../util/is-promise';
import { unWrapSignal, Writeable } from '../../util';
import { patchAsyncInputsCommon } from './input-common';
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
export function removeInputs<T>(list: string[]) {
  return rawConfig<T>((field) => {
    const oldValue = unWrapSignal(field.inputs);
    if (!oldValue) {
      return;
    }
    list.forEach((item) => {
      delete oldValue[item];
    });
    field.inputs = oldValue;
  });
}

export type AsyncResult =
  | Promise<any>
  | Observable<any>
  | Signal<any>
  | (any & {});
export type AsyncProperty = (
  field: _PiResolvedCommonViewFieldConfig,
) => AsyncResult;


export const patchAsyncInputs = patchAsyncInputsCommon;

import { Signal } from '@angular/core';
import { _PiResolvedCommonViewFieldConfig } from '../../builder-base';
import { Observable } from 'rxjs';
import { actions } from './input-common';
/** @deprecated use actions.inputs.set */
export const setInputs = actions.inputs.set;
/** @deprecated use actions.inputs.patch */
export const patchInputs = actions.inputs.patch;
/** @deprecated use actions.inputs.remove */
export const removeInputs = actions.inputs.remove;

export type AsyncResult =
  | Promise<any>
  | Observable<any>
  | Signal<any>
  | (any & {});
export type AsyncProperty = (
  field: _PiResolvedCommonViewFieldConfig,
) => AsyncResult;
/** @deprecated use actions.inputs.patchAsync */
export const patchAsyncInputs = actions.inputs.patchAsync;

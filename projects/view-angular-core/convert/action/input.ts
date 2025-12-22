import { Signal } from '@angular/core';
import { _PiResolvedCommonViewFieldConfig } from '../../builder-base';
import { Observable } from 'rxjs';
import { actions } from './input-common';
/** @deprecated use actions.set.inputs */
export const setInputs = actions.set.inputs;
/** @deprecated use actions.patch.inputs */
export const patchInputs = actions.patch.inputs;
/** @deprecated use actions.remove.inputs */
export const removeInputs = actions.remove.inputs;

export type AsyncResult =
  | Promise<any>
  | Observable<any>
  | Signal<any>
  | (any & {});
export type AsyncProperty = (
  field: _PiResolvedCommonViewFieldConfig,
) => AsyncResult;
/** @deprecated use actions.patchAsync.inputs */
export const patchAsyncInputs = actions.patchAsync.inputs;

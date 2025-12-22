import { Signal } from '@angular/core';
import { _PiResolvedCommonViewFieldConfig } from '../../builder-base';
import { Observable } from 'rxjs';

export type AsyncResult =
  | Promise<any>
  | Observable<any>
  | Signal<any>
  | (any & {});
export type AsyncProperty = (
  field: _PiResolvedCommonViewFieldConfig,
) => AsyncResult;

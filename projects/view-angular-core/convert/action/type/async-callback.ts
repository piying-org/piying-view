import { Observable } from 'rxjs';
import { Signal } from '@angular/core';
import { _PiResolvedCommonViewFieldConfig } from '../../../builder-base/type';

export type AsyncCallback<R> = (
  field: _PiResolvedCommonViewFieldConfig,
) => Promise<R> | Observable<R> | Signal<R> | (R & {});

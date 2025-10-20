import {
  computed,
  Injector,
  reflectComponentType,
  resource,
  Type,
  untracked,
} from '@angular/core';
import { NgResolvedComponentDefine2 } from '../type/component';
import { NgResolvedComponentDefine1 } from '../type';
import { getLazyImport, isLazyMark } from '@piying/view-angular-core';
export function isComponentType(input: any): input is Type<any> {
  return !!reflectComponentType(input as any);
}

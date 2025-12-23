import { Type } from '@angular/core';
import {
  LazyImport,
  LazyMarkType,
  PiCommonConfig,
} from '@piying/view-angular-core';
import { NgComponentDefine } from './component';

export type PiViewConfig = PiCommonConfig<
  | Type<any>
  | LazyImport<Type<any>>
  | NgComponentDefine
  | LazyImport<NgComponentDefine>
  | LazyMarkType<Type<any>>
  | LazyMarkType<NgComponentDefine>,
  Type<any> | LazyImport<Type<any>>
>;

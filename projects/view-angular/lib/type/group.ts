import { Type } from '@angular/core';

import { NgComponentDefine } from './component';
import { DirectiveConfig } from '../component/dynamic-define.component';
import {
  CombineSignal,
  CoreResolvedComponentDefine,
  CoreWrapperConfig,
  LazyMarkType,
  PiResolvedCommonViewFieldConfig,
} from '@piying/view-angular-core';
import { LazyImport } from '@piying/view-angular-core';
/** 指令配置 */
export type NgDirectiveConfig = DirectiveConfig;
/** 用于全局可选配置 */

/** 解析后但是未加载 */
export type NgResolvedComponentDefine1 = Omit<
  CoreResolvedComponentDefine,
  'type'
> & {
  type:
    | Type<any>
    | LazyImport<Type<any>>
    | NgComponentDefine
    | LazyImport<NgComponentDefine>
    | LazyMarkType<Type<any>>
    | LazyMarkType<NgComponentDefine>;
};

export type PiResolvedViewFieldConfig = PiResolvedCommonViewFieldConfig<
  () => PiResolvedViewFieldConfig,
  NgResolvedComponentDefine1
> & {
  directives?: CombineSignal<NgDirectiveConfig>;
};

export type NgResolvedWraaperConfig = Omit<CoreWrapperConfig, ''>;

export type ComponentRawType =
  | Type<any>
  | LazyImport<Type<any>>
  | NgComponentDefine
  | LazyImport<NgComponentDefine>
  | LazyMarkType<Type<any>>
  | LazyMarkType<NgComponentDefine>;

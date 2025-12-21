import { Type } from '@angular/core';
import {
  PiDefaultRawViewFieldConfig,
  NgDirectiveConfig,
  NgRawComponentDefine,
} from './group';
import { LazyImport } from '@piying/view-angular-core';
import {
  CoreRawWrapperConfig,
  CoreWrapperConfig1,
} from '@piying/view-angular-core';
import { RawConfigAction } from '@piying/valibot-visit';
// 全局配置相关
export type PiComponentDefaultConfig = NgRawComponentDefine & {
  /** @deprecated */
  directives?: NgDirectiveConfig[];
  /** @deprecated */
  wrappers?: CoreRawWrapperConfig[];
};

export interface PiViewConfig {
  types?: Record<string, Pick<PiComponentDefaultConfig, 'type' | 'actions'>>;
  wrappers?: Record<
    string,
    {
      type: Type<any> | LazyImport<Type<any>>;
      /** 目前设计为field全部初始化后再用,也就是等价为patchAsyncWrapper */
      actions?: RawConfigAction<'rawConfig', any, any>[];
    }
  >;
}

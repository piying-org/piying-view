import { Type } from '@angular/core';
import {
  PiDefaultRawViewFieldConfig,
  NgDirectiveConfig,
  NgRawComponentDefine,
} from './group';
import { LazyImport } from '@piying/view-angular-core';
import {
  ConfigMergeStrategy,
  CoreRawWrapperConfig,
  CoreWrapperConfig1,
} from '@piying/view-angular-core';
// 全局配置相关
export type PiComponentDefaultConfig = NgRawComponentDefine & {
  /** @deprecated */
  directives?: NgDirectiveConfig[];
  /** @deprecated */
  wrappers?: CoreRawWrapperConfig[];
};

export type ConfigMergeStrategyObject = Record<
  keyof PiDefaultRawViewFieldConfig,
  ConfigMergeStrategy
>;
export interface PiViewConfig {
  types?: Record<
    string,
    PiComponentDefaultConfig & {
      /** @deprecated 使用actions */ props?: Record<string, any>;
    }
  >;
  wrappers?: Record<
    string,
    Omit<CoreWrapperConfig1, 'type'> & {
      type: Type<any> | LazyImport<Type<any>>;
    }
  >;
  defaultConfig?: PiDefaultRawViewFieldConfig;
  /** merge 数组/对象会合并 replace 优先自身/组件/全局 */
  defaultConfigMergeStrategy?: ConfigMergeStrategyObject;
}

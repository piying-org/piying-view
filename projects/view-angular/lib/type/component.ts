import { Injector, Signal, Type } from '@angular/core';
import { DirectiveConfig } from '../component/dynamic-define.component';
import { PiResolvedViewFieldConfig, NgResolvedComponentDefine1 } from './group';
import {
  CoreRawViewAttributes,
  CoreRawViewInputs,
  CoreRawViewOutputs,
} from '@piying/view-angular-core';
/** todo 这个没有支持 */
export interface RawDirectiveOutputs {
  [name: string]: (event: any, field: PiResolvedViewFieldConfig) => void;
}

export interface DynamicComponentConfig {
  type: Type<any> | string;
  module?: Type<any>;
  attributes: Signal<CoreRawViewAttributes | undefined>;
  selector?: string;
  inputs: Signal<CoreRawViewInputs | undefined>;
  directives?: DirectiveConfig[];
  outputs?: CoreRawViewOutputs;
  injector?: Injector;
  contents?: ComponentContent;
}

export type ComponentContent = {
  select?: string;
  nodes?: any[];
  text?: Signal<string>;
}[];

/** 解析后组件已经加载 ngcomponentoutlet */
export type NgResolvedComponentDefine2 = Omit<
  NgResolvedComponentDefine1,
  'type'
> & {
  type: NgComponentDefine;
};
/** component,wrapper通用定义 */
export type NgComponentDefine = {
  component: Type<any> | string;
  module?: Type<any>;
};

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
  type: Type<any>;
  module?: Type<any>;
  attributes: Signal<CoreRawViewAttributes | undefined>;
  selector?: string;
  inputs: Signal<CoreRawViewInputs | undefined>;
  directives?: DirectiveConfig[];
  outputs?: CoreRawViewOutputs;
  injector?: Injector;
}

/** 解析后组件已经加载 ngcomponentoutlet */
export type NgResolvedComponentDefine2 = Omit<
  NgResolvedComponentDefine1,
  'type'
> & {
  type: NgComponentDefine;
};
/** component,wrapper通用定义 */
export type NgComponentDefine = {
  component: Type<any>;
  module?: Type<any>;
};
